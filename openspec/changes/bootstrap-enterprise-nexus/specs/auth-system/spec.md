# Spec: Auth System

## Capability
`auth-system` - Auth.js v5 + Redis Session + Directus RBAC

## ADDED Requirements

### Requirement: 用户注册
**Priority**: P0
**Rationale**: 新用户入口

#### Scenario: 邮箱注册
**Given** 用户输入邮箱和密码
**When** 提交注册表单
**Then**
- 验证邮箱格式和密码强度
- 检查邮箱是否已存在
- 创建用户记录到 `auth.users`
- 密码使用 bcrypt 加密存储
- 返回成功并自动登录

#### Scenario: 邮箱已存在
**Given** 用户输入已注册的邮箱
**When** 提交注册表单
**Then**
- 返回错误 "邮箱已被注册"
- 不创建新用户

---

### Requirement: 用户登录
**Priority**: P0
**Rationale**: 身份验证入口

#### Scenario: 正确凭证
**Given** 用户输入正确的邮箱和密码
**When** 提交登录表单
**Then**
- 验证凭证
- 创建 Session 存储到 Redis
- 设置 HttpOnly Cookie `nexus-session`
- 重定向到 Dashboard

#### Scenario: 错误凭证
**Given** 用户输入错误的密码
**When** 提交登录表单
**Then**
- 返回错误 "邮箱或密码错误"
- 不泄露具体是哪个错误

#### Scenario: 账户锁定
**Given** 用户连续 5 次输入错误密码
**When** 再次尝试登录
**Then**
- 返回错误 "账户已锁定，请 15 分钟后重试"
- 锁定状态存储在 Redis (TTL: 15min)

---

### Requirement: Session 管理
**Priority**: P0
**Rationale**: 跨子系统登录态共享

#### Scenario: Session 结构
**Given** 用户登录成功
**When** Session 存储到 Redis
**Then**
- Key: `session:{sessionId}`
- Value: 
```json
{
  "userId": "cuid...",
  "email": "user@example.com",
  "name": "张三",
  "roles": ["user"],
  "permissions": ["crm:read", "okr:read"],
  "expiresAt": "2026-02-26T00:00:00Z"
}
```
- TTL: 30 天

#### Scenario: Session 读取
**Given** 请求携带 Cookie
**When** 中间件验证
**Then**
- 解析 Cookie 获取 Session ID
- 从 Redis 读取 Session 数据
- 注入到请求上下文

#### Scenario: Session 刷新
**Given** Session 剩余时间 < 7 天
**When** 用户活跃访问
**Then**
- 延长 Session 有效期至 30 天
- 更新 Redis TTL

---

### Requirement: 登出
**Priority**: P0
**Rationale**: 安全退出

#### Scenario: 主动登出
**Given** 用户点击登出按钮
**When** 执行 signOut()
**Then**
- 删除 Redis 中的 Session
- 清除 Cookie
- 重定向到登录页

#### Scenario: 全设备登出
**Given** 用户在设置中点击 "登出所有设备"
**When** 执行 signOutAll()
**Then**
- 删除该用户所有 Session (pattern: `session:*:{userId}`)
- 所有设备需要重新登录

---

### Requirement: 权限检查
**Priority**: P0
**Rationale**: 基于 Directus RBAC

#### Scenario: 路由守卫
**Given** 用户访问 `/finance/invoices`
**When** 中间件检查权限
**Then**
- 检查 Session 中是否有 `finance:read`
- 有: 允许访问
- 无: 重定向到 403 页面

#### Scenario: API 权限
**Given** Server Action 需要 `finance:write` 权限
**When** 执行 `createInvoice()`
**Then**
- 装饰器检查 `@RequirePermission("finance:write")`
- 有权限: 执行操作
- 无权限: 抛出 `ForbiddenError`

---

### Requirement: Directus 集成
**Priority**: P1
**Rationale**: 权限配置可视化管理

#### Scenario: 同步权限
**Given** 管理员在 Directus 修改角色权限
**When** Portal 下次获取用户 Session
**Then**
- 从 Directus 重新拉取权限树
- 更新 Redis 中的 Session
- 新权限立即生效

---

## Auth.js Configuration

```typescript
// packages/auth/src/config.ts
import { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { redis } from "@nexus/redis"
import { prisma } from "@nexus/db"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      // 从 Directus 获取权限
      const permissions = await fetchPermissionsFromDirectus(user.id)
      session.user.permissions = permissions
      return session
    },
  },
}
```

---

## Middleware

```typescript
// apps/portal/src/middleware.ts
import { auth } from "@nexus/auth"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const isAuthPage = nextUrl.pathname.startsWith("/login")

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl))
  }

  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL("/login", nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

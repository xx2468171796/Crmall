# Auth 技能 — 认证与会话管理

## 技术栈
- Auth.js v5 (next-auth@5)
- Redis Session Store
- Prisma 7 User Model
- 自建 RBAC（不用 Clerk/Directus）

## 认证配置

统一配置文件 `packages/auth/src/index.ts`：

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@twcrm/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        // 校验逻辑
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId
        token.role = user.role
        token.locale = user.locale
      }
      return token
    },
    session({ session, token }) {
      session.user.tenantId = token.tenantId
      session.user.role = token.role
      session.user.locale = token.locale
      return session
    }
  }
})
```

## Session 中必须包含的字段
- id: 用户 ID
- email: 邮箱
- name: 姓名
- tenantId: 租户 ID（多租户关键）
- role: 角色（platform_admin / tenant_admin / tenant_user 等）
- locale: 语言偏好（zh-TW / zh-CN / en）

## 使用方式

Server Component / Server Action:
```typescript
import { auth } from '@twcrm/auth'
const session = await auth()
if (!session) redirect('/login')
```

Client Component:
```typescript
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
```

## 权限校验
每个 Server Action 必须：
1. `await auth()` 获取 session
2. 检查 session 是否存在
3. 检查角色/权限是否满足
4. 检查 tenantId 数据范围

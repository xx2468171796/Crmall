# Spec: Shared Packages

## Capability
`shared-packages` - 6 个核心共享包

## ADDED Requirements

### Requirement: @nexus/db - Prisma Client
**Priority**: P0
**Rationale**: 统一数据库访问，支持 Multi-Schema

#### Scenario: 导入 Prisma Client
**Given** `apps/portal` 需要查询用户
**When** 执行 `import { prisma } from "@nexus/db"`
**Then**
- 可访问所有 Schema 的表
- TypeScript 类型正确推断

#### Scenario: Multi-Schema 查询
**Given** 需要查询 `auth.User` 和 `plane.Issue`
**When** 执行跨 Schema 查询
**Then**
- 两个 Schema 的数据正确返回
- 无运行时错误

---

### Requirement: @nexus/redis - Redis Client
**Priority**: P0
**Rationale**: Session 存储和 API 缓存

#### Scenario: 基础连接
**Given** 配置 `REDIS_URL` 环境变量
**When** 执行 `import { redis } from "@nexus/redis"`
**Then**
- 连接成功
- 可执行 `get`/`set` 操作

#### Scenario: BullMQ 队列
**Given** 需要创建后台任务
**When** 执行 `createQueue("pdf-generation")`
**Then**
- 队列创建成功
- 可添加 Job

---

### Requirement: @nexus/storage - MinIO Client
**Priority**: P1
**Rationale**: 文件上传统一入口

#### Scenario: 上传文件
**Given** 用户上传头像图片
**When** 执行 `uploadFile(bucket, key, buffer)`
**Then**
- 文件上传至 MinIO
- 返回文件 URL

#### Scenario: 生成签名 URL
**Given** 需要临时访问私有文件
**When** 执行 `getSignedUrl(bucket, key, expiresIn)`
**Then**
- 返回带签名的 URL
- URL 在指定时间后过期

---

### Requirement: @nexus/auth - Auth.js 配置
**Priority**: P0
**Rationale**: 统一身份认证

#### Scenario: 密码登录
**Given** 用户输入正确的邮箱和密码
**When** 执行 `signIn("credentials", { email, password })`
**Then**
- Session 创建并存储到 Redis
- 返回 Session Cookie

#### Scenario: 登出
**Given** 用户已登录
**When** 执行 `signOut()`
**Then**
- Redis 中 Session 删除
- Cookie 清除

---

### Requirement: @nexus/ui - Shadcn 组件库
**Priority**: P0
**Rationale**: 统一 UI 风格 (Zinc Theme)

#### Scenario: 导入组件
**Given** Portal 需要 Button 组件
**When** 执行 `import { Button } from "@nexus/ui"`
**Then**
- 组件正确渲染
- 样式符合 Zinc Theme

---

### Requirement: @nexus/tailwind-config - 共享配置
**Priority**: P1
**Rationale**: 确保所有应用样式一致

#### Scenario: 扩展基础配置
**Given** Portal 的 `tailwind.config.ts`
**When** 配置 `presets: [require("@nexus/tailwind-config")]`
**Then**
- 继承所有基础配色
- 可覆盖/扩展

---

## Package Structure

```
packages/
├── db/
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       └── index.ts         # export { prisma }
├── redis/
│   ├── package.json
│   └── src/
│       ├── index.ts         # export { redis }
│       └── queue.ts         # export { createQueue }
├── storage/
│   ├── package.json
│   └── src/
│       └── index.ts         # export { uploadFile, getSignedUrl }
├── auth/
│   ├── package.json
│   └── src/
│       ├── index.ts         # export { auth, signIn, signOut }
│       └── config.ts        # Auth.js configuration
├── ui/
│   ├── package.json
│   ├── components.json      # shadcn config
│   └── src/
│       ├── index.ts         # re-export all
│       └── components/
│           ├── button.tsx
│           ├── input.tsx
│           └── ...
└── tailwind-config/
    ├── package.json
    └── src/
        └── index.ts         # export default preset
```

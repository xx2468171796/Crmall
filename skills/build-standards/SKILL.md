---
name: build-standards
description: 打包构建规范技能。在需要配置开发环境、生产构建、Docker 镜像、环境变量等时使用此技能。基于 Turbopack + pnpm workspace + Next.js Standalone。
---

# 打包构建技能 (Build Standards Skill)

配置构建和部署相关功能时，遵循以下规范。

## 技术栈

- **Turbopack** - 开发环境构建
- **Next.js Standalone** - 生产构建
- **pnpm 10.x** - 包管理（严禁 yarn/npm/bun）
- **Turborepo** - monorepo 任务编排
- **Docker** - 容器化部署（可选）

## 开发环境

### 启动开发服务器

```json
// apps/portal/package.json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start"
  }
}
```

```bash
# 启动开发 (必须使用 --turbo)
pnpm dev

# 或从根目录启动所有 apps
pnpm --filter portal dev
```

### Next.js 配置

```typescript
// apps/portal/next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig
```

## pnpm workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```bash
# 初始化
corepack enable

# 安装依赖
pnpm install

# 添加依赖到指定 app
pnpm --filter portal add <package>

# 添加开发依赖
pnpm --filter portal add -D <package>

# 添加共享包依赖
pnpm --filter @twcrm/db add <package>
```

## Turborepo 配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": { "cache": false, "persistent": true },
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "lint": {},
    "test": {}
  }
}
```

## 生产构建

### Standalone 模式

```bash
# 构建
pnpm build

# 输出目录
.next/standalone/
├── server.js
├── .next/
└── node_modules/
```

### Docker 构建

```dockerfile
FROM node:24-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/portal/package.json ./apps/portal/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter portal build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/portal/.next/standalone ./
COPY --from=builder /app/apps/portal/.next/static ./.next/static
COPY --from=builder /app/apps/portal/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

## 环境变量

```typescript
// src/lib/env.ts
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.coerce.number(),
  MINIO_BUCKET: z.string(),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_WS_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

## 核心规范

1. **开发必须用 Turbopack** - `next dev --turbo`
2. **生产用 Standalone** - `output: 'standalone'`
3. **Docker 多阶段构建** - 最小化镜像
4. **环境变量 Zod 验证** - 类型安全
5. **pnpm workspace** - monorepo 管理
6. **严禁 yarn / npm / bun**

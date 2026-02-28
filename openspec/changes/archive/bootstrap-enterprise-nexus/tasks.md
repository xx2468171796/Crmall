# Tasks: Bootstrap Enterprise Nexus

## Phase 1: Monorepo Foundation

### 1.1 初始化 Monorepo 结构 [P0] ✅
- [x] 创建根目录 `package.json` (Yarn Workspaces)
- [x] 创建 `.yarnrc.yml` (nodeLinker: node-modules)
- [x] 创建 `turbo.json` (任务配置)
- [x] 创建 `.gitignore` (更新忽略规则)
- [x] 创建 `apps/` 和 `packages/` 目录

**验证**: `yarn install` 成功执行

### 1.2 创建 @nexus/tailwind-config [P0] ✅
- [x] 创建 `packages/tailwind-config/package.json`
- [x] 创建 `packages/tailwind-config/src/index.ts` (导出 preset)
- [x] 配置 Zinc Theme 颜色变量
- [x] 配置 shadcn/ui 兼容设置

**验证**: 可被其他包引用

### 1.3 创建 @nexus/db [P0] ✅
- [x] 创建 `packages/db/package.json`
- [x] 创建 `packages/db/prisma/schema.prisma` (Multi-Schema)
- [x] 定义 `auth` Schema 用户表
- [x] 创建 `packages/db/src/index.ts` (导出 prisma client)
- [ ] 执行 `prisma db push` 同步表结构

**验证**: `import { prisma } from "@nexus/db"` 可用

### 1.4 创建 @nexus/redis [P0] ✅
- [x] 创建 `packages/redis/package.json`
- [x] 创建 `packages/redis/src/index.ts` (ioredis 连接)
- [x] 创建 `packages/redis/src/queue.ts` (BullMQ 工厂)

**验证**: Redis PING 成功

### 1.5 创建 @nexus/storage [P1] ✅
- [x] 创建 `packages/storage/package.json`
- [x] 创建 `packages/storage/src/index.ts` (MinIO S3 client)
- [x] 实现 `uploadFile()` 函数
- [x] 实现 `getSignedUrl()` 函数

**验证**: 上传测试文件到 MinIO

### 1.6 创建 @nexus/auth [P0] ✅
- [x] 创建 `packages/auth/package.json`
- [x] 创建 `packages/auth/src/config.ts` (Auth.js 配置)
- [x] 创建 `packages/auth/src/index.ts` (导出 auth, signIn, signOut)
- [ ] 配置 Redis Session Adapter

**验证**: Auth.js 配置无错误

### 1.7 创建 @nexus/ui [P0] ✅
- [x] 创建 `packages/ui/package.json`
- [x] 初始化 shadcn/ui (`npx shadcn@latest init`)
- [x] 安装核心组件: Button, Input, Card, Dialog, Form, Table
- [x] 创建 `packages/ui/src/index.ts` (re-export)

**验证**: `import { Button } from "@nexus/ui"` 可用

---

## Phase 2: Portal 应用

### 2.1 初始化 Portal 应用 [P0] ✅
- [x] 创建 `apps/portal/package.json`
- [x] 创建 `apps/portal/next.config.ts`
- [x] 配置 `transpilePackages` 包含所有 @nexus/* 包
- [x] 创建 `apps/portal/postcss.config.mjs` (Tailwind v4)
- [x] 创建 `apps/portal/src/app/layout.tsx` (根布局)

**验证**: `yarn workspace @nexus/portal dev` 启动成功 (with --turbo)

### 2.2 实现 App Shell [P0] ✅
- [x] 创建 `apps/portal/src/components/layouts/app-shell.tsx`
- [x] 创建 `apps/portal/src/components/layouts/header.tsx`
- [x] 创建 `apps/portal/src/components/layouts/sidebar.tsx`
- [ ] 创建 `apps/portal/src/components/layouts/breadcrumbs.tsx`
- [x] 创建 `apps/portal/src/store/sidebar.ts` (Zustand)

**验证**: 布局正确渲染，Sidebar 可折叠

### 2.3 实现认证页面 [P0] ✅
- [x] 创建 `apps/portal/src/app/(auth)/layout.tsx`
- [x] 创建 `apps/portal/src/app/(auth)/login/page.tsx`
- [x] 创建 `apps/portal/src/app/(auth)/register/page.tsx`
- [x] 创建 `apps/portal/src/actions/auth.ts` (登录/注册 Server Actions)
- [x] 创建登录/注册表单 (React Hook Form + Zod)

**验证**: 可完成注册和登录流程

### 2.4 实现中间件 [P0] ✅
- [x] 创建 `apps/portal/src/middleware.ts`
- [x] 实现路由保护 (未登录 → 跳转登录页)
- [ ] 实现权限检查 (无权限 → 403)

**验证**: 未登录访问 /dashboard 重定向到 /login

### 2.5 实现 Dashboard 首页 [P1] ✅
- [x] 创建 `apps/portal/src/app/(dashboard)/layout.tsx` (App Shell)
- [x] 创建 `apps/portal/src/app/(dashboard)/dashboard/page.tsx`
- [x] 显示欢迎信息和统计卡片

**验证**: 登录后可访问 Dashboard

### 2.6 实现动态菜单 [P1] ✅
- [x] 创建 `apps/portal/src/lib/menu-config.ts` (菜单配置)
- [x] 创建 `apps/portal/src/hooks/use-menu.ts` (Session-based)
- [x] Sidebar 根据用户权限渲染菜单

**验证**: 不同角色看到不同菜单

### 2.7 实现双重架构组织管理 [P0] ✅

**平台层 (SaaS)**:
- [x] 创建 Tenant 模型 (租户/客户) - Prisma Schema
- [x] 创建平台管理后台 `/platform/tenants` (租户列表)
- [x] 创建 `buildScopeFilter` 在 @nexus/db/scope.ts

**租户层 (集团多公司)**:
- [x] 创建组织架构模型 (Group/Company/Department/Team/Employee)
- [x] 创建集团管理 `/admin/companies` (公司列表)
- [x] 创建 `/org/departments` (部门列表)
- [x] 创建 `/org/employees` (员工列表)
- [x] 创建 `/settings` (设置页面 + 登出)
- [ ] 实现公司切换器 (集团管理员跨公司查看)

**验证**: 
- 租户间 100% 隔离，绝对不可跨租户
- 集团管理员可查看本租户所有公司数据
- 公司用户只能看本公司数据

---

## Phase 3: 基础设施

### 3.1 Docker Compose [P1] ✅
- [x] 创建 `docker-compose.yml` 添加 Directus 服务
- [x] 配置 Directus 连接到现有 PostgreSQL
- [x] 配置 Directus CORS 允许 Portal 域名
- [x] 创建 `@nexus/rbac` 包 (Directus SDK 集成)

**验证**: `docker compose up -d directus` 成功

### 3.2 Tauri 桌面端 [P2]
- [ ] 确认 `src-tauri/` 配置正确
- [ ] 更新 Tauri 指向 `apps/portal` 构建产物
- [ ] 测试桌面端启动

**验证**: `yarn tauri dev` 打开桌面窗口

---

## 依赖关系

```
1.1 Monorepo 结构
    ↓
├── 1.2 tailwind-config
├── 1.3 db
├── 1.4 redis
├── 1.5 storage
├── 1.6 auth (依赖 db, redis)
└── 1.7 ui (依赖 tailwind-config)
    ↓
2.1 Portal 初始化 (依赖所有 packages)
    ↓
├── 2.2 App Shell (依赖 ui)
├── 2.3 认证页面 (依赖 auth, ui)
├── 2.4 中间件 (依赖 auth)
├── 2.5 Dashboard (依赖 App Shell)
└── 2.6 动态菜单 (依赖 3.1 Directus)
```

---

## 验收标准

1. **Monorepo 可用**: `yarn install && yarn build` 无错误
2. **开发体验**: `yarn dev` 启动 Portal (with Turbopack)
3. **认证完整**: 用户可注册、登录、登出
4. **权限生效**: 不同角色看到不同菜单
5. **Session 共享**: 刷新页面保持登录状态

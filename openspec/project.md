# Project Context

## Purpose
**Project Enterprise Nexus (CRMALL)** 是一个基于 Next.js 16 (Web) 和 Tauri v2 (Desktop) 的企业级超级应用 (Super App)。采用 **"Source Code Fusion" (源码融合)** 策略，将多个顶级开源项目集成到一个 Monorepo 中，共享同一个数据库、缓存层、文件存储以及统一的身份认证体系。

**核心目标**：打造一个无缝的、模块化的、私有化部署的企业操作系统 (Enterprise OS)。

## Tech Stack

### Frontend
- **Next.js 16** (App Router) + **Turbopack** 构建引擎
- **React 19** (Server Components, useOptimistic, Actions)
- **TypeScript 5.x** (Strict Mode)
- **Tailwind CSS v4** (Oxide Engine)
- **shadcn/ui** + **HeroUI** (UI 组件)
- **Lucide React** (图标)
- **Zustand v5** (UI 状态管理)
- **TanStack Query v5** (服务端状态)
- **React Hook Form** + **Zod** (表单校验)

### Backend
- **Server Actions** (去 API 化设计)
- **Prisma v6+** (ORM)
- **PostgreSQL v17** (主数据库)
- **Auth.js v5** (身份认证)
- **Directus** (Headless CMS / 权限引擎)

### Desktop
- **Tauri v2** (Rust 驱动跨平台)
- **SQLite** (桌面端离线数据)
- **Rust 2024 Edition** (系统通信)

### Infrastructure
- **Docker Compose** (容器编排)
- **Redis v7** (缓存 / BullMQ 队列)
- **MinIO** (S3 兼容对象存储)
- **OpenResty** (网关/反代)

### DevTools
- **Yarn v4** (Berry, node-modules mode)
- **Biome** (替代 ESLint/Prettier)
- **Husky** + **Commitlint** (Git 规范)

## Project Conventions

### Code Style
- **Biome** 作为唯一的 Lint/Format 工具
- **命名即文档**: 变量名必须全称且语义化 (`isUserLoggedIn` 而非 `flag`)
- **严禁魔法数字**: 常量必须有明确命名
- **童子军军规**: 修改代码时顺手修复周围的类型定义、格式问题
- **严禁 `any`**: 全链路类型安全

### Architecture Patterns
- **原子化设计 (Atomic Design)**: 组件拆解为 `atoms`/`molecules`/`organisms`，严禁超过 150 行的巨型组件
- **单一职责 (SRP)**: UI 组件只负责展示，业务逻辑抽离到 Hooks，数据获取抽离到 Server Actions
- **关注点分离 (SoC)**: 严禁在 UI 层直接编写 SQL 或复杂算法
- **依赖倒置 (DIP)**: 外部服务使用 Adapter 模式
- **单一数据源 (SSOT)**: 数据库是唯一真理，禁止存冗余计算字段

### Directory Structure
```
/
├── src-tauri/           # Rust 后端代码 (Tauri v2)
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/
│   │   ├── ui/          # Shadcn 基础组件 (Atoms)
│   │   ├── shared/      # 业务通用组件 (Molecules)
│   │   └── features/    # 特定业务模块 (Organisms)
│   ├── actions/         # Server Actions
│   ├── hooks/           # Custom React Hooks
│   ├── lib/             # 工具函数
│   ├── schemas/         # Zod Schemas (前后端共享)
│   └── store/           # Zustand Stores
├── apps/                # Monorepo 子应用
└── packages/            # 共享包 (ui, db, redis, storage, auth)
```

### Testing Strategy
- 使用 Zod Schema 进行运行时校验
- Server Actions 必须有输入验证
- 关键业务逻辑需要单元测试

### Git Workflow
- **Husky** + **Commitlint** 强制提交信息标准化
- 提交信息格式: `type(scope): message`
- 类型: `feat`, `fix`, `refactor`, `docs`, `chore`

## Domain Context

### 子系统模块
| 模块 | 开源项目源 | 职责 | Schema |
|------|-----------|------|--------|
| **Portal** | Next.js 16 | 主控台/OS | `auth` |
| **CRM** | NocoDB | 客户管理 | `nocodb` |
| **OKR** | Plane | 目标管理 | `plane` |
| **Finance** | Midday | 财务发票 | `midday` |
| **Inventory** | MedusaJS | 库存产品 | `medusa` |
| **Learning** | ClassroomIO | 培训系统 | `classroomio` |
| **Docs** | AppFlowy | 知识库 | `appflowy` |
| **Admin** | Directus | 权限/配置 | `public` |

### 融合策略
- 所有子系统进行 **"Headless" (无头化)** 改造
- 移除原有 Sidebar/Header，作为组件嵌入 Portal
- 共享 CSS Variables 实现一键换肤

## Important Constraints

### 技术约束
- **❌ NO API Routes**: 严禁创建 `/pages/api` 或 `/app/api`
- **✅ Server Actions**: 所有后端交互必须用 `"use server"`
- **❌ No Node.js in UI**: `.tsx` 中严禁 import `fs`/`path`/`os`
- **✅ Rust Commands**: 文件系统/Shell 操作必须用 Tauri Command
- **❌ No CSS Files**: 严禁创建 `.css`/`.scss`/`.less` (除 `globals.css`)
- **✅ Shadcn UI First**: 优先复用 shadcn/ui 组件
- **❌ No Zustand for Server Data**: Zustand 仅用于 UI 状态，服务端数据用 TanStack Query
- **✅ Schema First**: 数据库变更必须先修改 `schema.prisma`

### 架构约束
- **DRY**: 逻辑重复 2 次必须重构
- **YAGNI**: 只实现当前需求，严禁过度封装
- **KISS**: 可读性 > 炫技

## External Dependencies

### 数据库 (PostgreSQL)
- **Host**: `192.168.110.246:5433`
- **Database**: `crmall0125`
- **Multi-Schema**: 各子系统使用独立 Schema

### 缓存 (Redis)
- **Host**: `192.168.110.246:6379`
- **用途**: Session Store, API Caching, BullMQ Job Queue

### 对象存储 (MinIO)
- **Endpoint**: `192.168.110.246:9000`
- **Bucket**: `crmall0125`
- **协议**: S3 兼容，严禁使用本地磁盘 `fs.write`

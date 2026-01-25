# Design: Source Code Fusion

## ADR-001: 源码引入策略

### Context

需要将 6 个开源项目的源码引入 Monorepo，但各项目技术栈差异大：

| 项目 | 框架 | 包管理 | 构建工具 |
|------|------|--------|----------|
| NocoDB | Nuxt 3 | pnpm | Vite |
| Plane | Next.js 14 | yarn | Turbopack |
| Midday | Next.js 14 | pnpm | Turbopack |
| MedusaJS | React + Express | yarn | Webpack |
| ClassroomIO | SvelteKit | pnpm | Vite |
| AppFlowy | Flutter + Rust | cargo/flutter | - |

### Decision

采用 **Git Subtree** 策略引入源码：

```bash
# 添加远程仓库
git remote add plane-upstream https://github.com/makeplane/plane.git
git remote add nocodb-upstream https://github.com/nocodb/nocodb.git
# ...

# 引入为 subtree
git subtree add --prefix=apps/plane plane-upstream main --squash
git subtree add --prefix=apps/nocodb nocodb-upstream master --squash
```

### Rationale

- **完整历史**: 保留原项目 commit 历史
- **易于更新**: `git subtree pull` 同步上游更新
- **独立构建**: 各子系统保持独立的 package.json 和构建配置

### Consequences

- 需要定期 rebase 上游更新
- 初始克隆体积较大
- 需要处理各项目的依赖冲突

---

## ADR-002: Headless 改造架构

### Context

原项目都有完整的 UI Shell (Sidebar, Header, Auth Pages)，需要移除这些组件，保留核心功能。

### Decision

分层改造策略：

```
┌─────────────────────────────────────────────────────────┐
│                    Portal App Shell                      │
│  ┌─────────────┬─────────────┬─────────────────────────┐│
│  │   Sidebar   │   Header    │      Main Content       ││
│  │  (Directus  │  (User/     │                         ││
│  │   Menus)    │   Notify)   │   ┌─────────────────┐   ││
│  │             │             │   │  Subsystem View │   ││
│  │             │             │   │  (iframe/embed) │   ││
│  │             │             │   └─────────────────┘   ││
│  └─────────────┴─────────────┴─────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**集成方式**：

| 子系统 | 集成方式 | 原因 |
|--------|----------|------|
| Plane | 组件嵌入 | Next.js 同构，可直接 import |
| Midday | 组件嵌入 | Next.js 同构 |
| NocoDB | iframe | Nuxt 异构，需隔离 |
| MedusaJS | 组件嵌入 | React 兼容 |
| ClassroomIO | iframe | SvelteKit 异构 |
| AppFlowy | iframe | Flutter Web 异构 |

### Rationale

- **同构优先**: Next.js 项目优先使用组件嵌入，共享 React Context
- **异构隔离**: 非 React 项目使用 iframe，通过 PostMessage 通信
- **渐进增强**: 初期 iframe，后期可逐步改为 Web Component

---

## ADR-003: 认证统一方案

### Context

各子系统原有独立的认证系统，需要统一为 Auth.js + Redis Session。

### Decision

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Portal     │────▶│   Auth.js    │────▶│    Redis     │
│  (登录入口)   │     │   (验证)     │     │  (Session)   │
└──────────────┘     └──────────────┘     └──────────────┘
        │                    │
        ▼                    ▼
┌──────────────────────────────────────────────────────────┐
│                    Cookie: nexus-session                  │
│                    Domain: .nexus.local                   │
└──────────────────────────────────────────────────────────┘
        │         │         │         │         │
        ▼         ▼         ▼         ▼         ▼
    ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
    │Plane │ │NocoDB│ │Midday│ │Medusa│ │ LMS  │
    └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
```

**子系统认证适配**：

1. **Plane**: 替换 NextAuth → 引用 @nexus/auth
2. **NocoDB**: 禁用内置 Auth → 添加 Cookie 验证中间件
3. **Midday**: 替换 Supabase Auth → @nexus/auth
4. **MedusaJS**: 替换 JWT → Redis Session 验证
5. **ClassroomIO**: 添加 Session 验证 Hook
6. **AppFlowy**: 对接 Auth.js API (REST 调用)

---

## ADR-004: 数据库 Multi-Schema

### Context

各子系统需要独立的数据库命名空间，避免表名冲突。

### Decision

PostgreSQL Multi-Schema 架构：

```sql
-- 各子系统独立 Schema
CREATE SCHEMA IF NOT EXISTS auth;       -- Portal 认证
CREATE SCHEMA IF NOT EXISTS plane;      -- OKR 系统
CREATE SCHEMA IF NOT EXISTS nocodb;     -- CRM 系统
CREATE SCHEMA IF NOT EXISTS midday;     -- 财务系统
CREATE SCHEMA IF NOT EXISTS medusa;     -- 库存系统
CREATE SCHEMA IF NOT EXISTS classroomio;-- 培训系统
CREATE SCHEMA IF NOT EXISTS appflowy;   -- 知识库
CREATE SCHEMA IF NOT EXISTS public;     -- Directus 权限
```

**Prisma 配置**：

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth", "plane", "nocodb", "midday", "medusa", "classroomio", "appflowy", "public"]
}
```

### Constraints

- **禁止跨 Schema 外键**: 使用应用层关联 (ID 映射表)
- **统一用户表**: `auth.users` 为主表，子系统存储 `user_id` 引用
- **独立迁移**: 各子系统保持独立的 migration 目录

---

## ADR-005: 文件存储统一

### Context

各子系统原有独立的文件存储方案 (本地/S3/Supabase Storage)。

### Decision

统一使用 MinIO (S3 兼容)：

```
MinIO Server: 192.168.110.246:9000
├── nexus-public/    # Portal 公共资源
├── nexus-crm/       # NocoDB 附件
├── nexus-okr/       # Plane 附件
├── nexus-finance/   # Midday 发票 PDF
├── nexus-products/  # Medusa 产品图片
├── nexus-lms/       # ClassroomIO 课件
└── nexus-docs/      # AppFlowy 文档附件
```

**子系统适配**：

1. 替换文件上传逻辑 → 调用 `@nexus/storage`
2. 替换文件 URL 生成 → Presigned URL
3. 禁用本地磁盘存储

---

## ADR-006: 子系统通信

### Context

子系统间需要数据交互 (如 CRM 客户关联 OKR 目标)。

### Decision

基于 **事件驱动 + ID 映射** 的松耦合架构：

```
┌─────────────────────────────────────────────────────────┐
│                    BullMQ (Redis)                        │
│                    Event Bus                             │
└─────────────────────────────────────────────────────────┘
        │                │                │
        ▼                ▼                ▼
   crm:customer     okr:issue      finance:invoice
      :created        :closed         :paid
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  ID Mapping  │ │  ID Mapping  │ │  ID Mapping  │
│    Table     │ │    Table     │ │    Table     │
└──────────────┘ └──────────────┘ └──────────────┘
```

**ID 映射表**：

```sql
CREATE TABLE auth.entity_mappings (
  id UUID PRIMARY KEY,
  source_system VARCHAR(50),  -- 'crm', 'okr', 'finance'
  source_id VARCHAR(255),
  target_system VARCHAR(50),
  target_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 技术决策总结

| 决策点 | 方案 | 状态 |
|--------|------|------|
| 源码引入 | Git Subtree | 待实施 |
| Headless 集成 | iframe + 组件混合 | 待实施 |
| 认证统一 | Auth.js + Redis Cookie | 待实施 |
| 数据库隔离 | PostgreSQL Multi-Schema | 待实施 |
| 文件存储 | MinIO S3 兼容 | 待实施 |
| 系统通信 | BullMQ Event + ID Mapping | 待实施 |

# Design: Enterprise Nexus Architecture

## Overview

本文档记录 Enterprise Nexus Monorepo 的架构决策和技术选型理由。

## Architecture Decisions

### ADR-001: Monorepo 工具选型

**决策**: Yarn v4 (Berry) + Turborepo

**备选方案**:
- pnpm + Turborepo
- Nx
- Lerna (已废弃)

**选择理由**:
1. Yarn Berry 支持 PnP 和 node-modules 两种模式，兼容性更好
2. Turborepo 专注任务缓存，轻量且与 Vercel 生态集成
3. 团队已有 Yarn 使用经验

**后果**:
- 需要 `.yarnrc.yml` 配置 `nodeLinker: node-modules`
- 需要在 CI 中配置 Turborepo Remote Caching

---

### ADR-002: 共享包边界定义

**决策**: 6 个核心共享包

| 包名 | 职责 | 导出 |
|------|------|------|
| `@nexus/ui` | Shadcn UI 组件 | React Components |
| `@nexus/db` | Prisma Client | `prisma`, `PrismaClient` |
| `@nexus/redis` | Redis 连接 | `redis`, `createQueue` |
| `@nexus/storage` | MinIO S3 | `uploadFile`, `getSignedUrl` |
| `@nexus/auth` | Auth.js 配置 | `auth`, `signIn`, `signOut` |
| `@nexus/tailwind-config` | Tailwind 预设 | `preset` |

**边界原则**:
- 每个包只做一件事
- 包之间严禁循环依赖
- UI 包不依赖业务逻辑包

---

### ADR-003: 数据库 Schema 隔离策略

**决策**: PostgreSQL Multi-Schema + Prisma `multiSchema` 预览特性

**Schema 分配**:
```
crmall0125 (database)
├── auth      # Portal 用户表、Session
├── public    # Directus 系统表
├── plane     # OKR 系统
├── nocodb    # CRM 系统
├── midday    # 财务系统
├── medusa    # 库存系统
├── classroomio # 培训系统
└── appflowy  # 知识库
```

**Prisma 配置**:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth", "public", "plane", "nocodb"]
}

model User {
  id    String @id @default(cuid())
  email String @unique
  @@schema("auth")
}
```

**后果**:
- 子系统表不会冲突
- 可独立备份/恢复单个 Schema
- 需要手动管理跨 Schema 外键

---

### ADR-004: Session 存储策略

**决策**: Redis Session Store (替代 JWT)

**理由**:
1. 支持即时撤销会话 (登出、封禁)
2. 可跨子系统共享登录态 (Cookie-based)
3. 减少 Token 体积 (Session ID vs JWT Payload)

**实现**:
```typescript
// packages/auth/src/config.ts
import { Redis } from "@nexus/redis"

export const authConfig = {
  session: {
    strategy: "database", // 实际存 Redis
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: RedisAdapter(redis),
}
```

**后果**:
- Redis 成为关键依赖 (需要高可用)
- 需要配置 Session Cookie 的 Domain 为根域名

---

### ADR-005: Portal App Shell 架构

**决策**: Server Components + Zustand Sidebar State

**布局结构**:
```
┌──────────────────────────────────────────────┐
│ Header (Server Component)                     │
│ ┌──────────┬────────────────────────────────┐ │
│ │ Sidebar  │ Main Content                   │ │
│ │ (Client) │ (Server Component + Suspense)  │ │
│ │          │                                │ │
│ │ Menu     │ {children}                     │ │
│ │ from     │                                │ │
│ │ Directus │                                │ │
│ └──────────┴────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**状态管理**:
- `useSidebarStore` (Zustand): 控制折叠/展开、移动端抽屉
- `useMenuQuery` (TanStack Query): 缓存 Directus 菜单数据

**后果**:
- Header/Breadcrumbs 可以是纯 Server Component
- Sidebar 需要 `"use client"` 处理交互
- 菜单数据需要 revalidate 策略

---

## Component Architecture

### Atomic Design 层级

```
packages/ui/
├── atoms/           # 最小单元
│   ├── button.tsx
│   ├── input.tsx
│   └── badge.tsx
├── molecules/       # 组合单元
│   ├── form-field.tsx
│   ├── search-input.tsx
│   └── dropdown-menu.tsx
└── organisms/       # 复杂组件
    ├── data-table.tsx
    ├── sidebar.tsx
    └── command-palette.tsx

apps/portal/src/components/
├── features/        # 业务组件
│   ├── user-nav.tsx
│   └── breadcrumb-nav.tsx
└── layouts/         # 布局组件
    ├── app-shell.tsx
    └── auth-layout.tsx
```

---

## Data Flow

### 认证流程

```
User → Login Form → Server Action (signIn)
                         ↓
                    Auth.js → Verify Credentials
                         ↓
                    Create Session in Redis
                         ↓
                    Set Cookie (nexus-session)
                         ↓
                    Redirect to Dashboard
```

### 权限检查流程

```
Request → Middleware
              ↓
         Read Cookie → Get Session from Redis
              ↓
         Fetch Permissions from Directus
              ↓
         ┌────────────────┐
         │ Has Permission │
         └───────┬────────┘
                 ↓
         ┌───────┴───────┐
         │               │
        YES             NO
         ↓               ↓
      Proceed       403 / Redirect
```

---

---

### ADR-006: SaaS + 集团多公司双重架构

**决策**: 平台 → 租户 → 集团 → 公司 → 部门 → 小组 → 员工

**架构模式**: 
- **第一层 (SaaS)**: 租户间 100% 隔离，卖给不同客户
- **第二层 (集团)**: 租户内部，集团可查看所有子公司数据

**层级结构**:
```
Platform (平台方/你的公司)           ← 系统运营商
  └── Tenant (租户/客户) [N]        ← 购买系统的客户，100% 数据隔离
        └── Group (集团) [1]        ← 客户自己的集团总部
              └── Company (公司) [N] ← 客户的下属公司，公司间隔离
                    └── Department (部门) [N]
                          └── Team (小组) [N]
                                └── Employee (员工) [N]
```

**数据访问规则**:
| 角色 | 数据范围 | 说明 |
|------|----------|------|
| **平台管理员** | 所有租户所有数据 | 可查看全部业务数据，用于运营监控 |
| **租户/集团管理员** | 本租户所有公司数据 | 可跨公司查看、汇总、分析 |
| 公司管理员 | 本公司所有数据 | 看不到其他公司 |
| 部门经理 | 本部门及下级 | 公司内部分权 |
| 小组长 | 本小组数据 | - |
| 员工 | 仅自己数据 | - |

**双重隔离实现**:
```typescript
// 第一层: 租户隔离 (绝对不可跨租户)
// 所有查询必须带 tenantId

// 第二层: 公司隔离 (集团管理员可跨公司)
// 集团管理员查询 - 带 tenantId，不带 companyId
const allCustomers = await prisma.customer.findMany({
  where: { 
    tenantId: session.user.tenantId // 必须
    // 无 companyId 过滤 - 集团可看所有
  }
})

// 公司用户查询 - 带 tenantId + companyId
const myCustomers = await prisma.customer.findMany({
  where: { 
    tenantId: session.user.tenantId,  // 必须
    companyId: session.user.companyId // 公司用户必须
  }
})
```

**数据库模型**:
```prisma
// auth schema

// ========== 第一层: SaaS 租户 ==========
model Tenant {
  id          String       @id @default(cuid())
  name        String       // 租户名称 (客户公司名)
  code        String       @unique  // 租户编码 (子域名)
  logo        String?
  plan        TenantPlan   @default(TRIAL)
  status      TenantStatus @default(ACTIVE)
  maxUsers    Int          @default(50)
  expiresAt   DateTime?
  group       Group?       // 1:1 每个租户有一个集团
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  @@schema("auth")
}

enum TenantPlan {
  TRIAL      // 试用
  BASIC      // 基础版
  PRO        // 专业版
  ENTERPRISE // 企业版
  @@schema("auth")
}

enum TenantStatus {
  ACTIVE     // 正常
  SUSPENDED  // 暂停
  EXPIRED    // 过期
  @@schema("auth")
}

// ========== 第二层: 集团 (租户内唯一) ==========
model Group {
  id        String    @id @default(cuid())
  tenantId  String    @unique
  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  name      String    // 集团名称
  companies Company[]
  @@schema("auth")
}

// ========== 第三层: 公司 ==========
model Company {
  id          String       @id @default(cuid())
  tenantId    String       // 冗余，方便过滤
  groupId     String
  group       Group        @relation(fields: [groupId], references: [id])
  name        String
  code        String
  status      CompanyStatus @default(ACTIVE)
  departments Department[]
  @@unique([tenantId, code])  // 同租户内编码唯一
  @@index([tenantId])
  @@schema("auth")
}

enum CompanyStatus {
  ACTIVE
  INACTIVE
  @@schema("auth")
}

// ========== 第四层: 部门 ==========
model Department {
  id        String       @id @default(cuid())
  tenantId  String       // 冗余
  companyId String
  company   Company      @relation(fields: [companyId], references: [id])
  parentId  String?
  parent    Department?  @relation("DeptTree", fields: [parentId], references: [id])
  children  Department[] @relation("DeptTree")
  name      String
  teams     Team[]
  @@index([tenantId])
  @@index([companyId])
  @@schema("auth")
}

// ========== 第五层: 小组 ==========
model Team {
  id           String     @id @default(cuid())
  tenantId     String     // 冗余
  companyId    String     // 冗余
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  name         String
  leaderId     String?
  employees    Employee[]
  @@index([tenantId])
  @@index([companyId])
  @@schema("auth")
}

// ========== 第六层: 员工 ==========
model Employee {
  id           String     @id @default(cuid())
  tenantId     String     // 冗余
  companyId    String     // 冗余
  userId       String     @unique
  user         User       @relation(fields: [userId], references: [id])
  teamId       String
  team         Team       @relation(fields: [teamId], references: [id])
  position     String?
  employeeNo   String
  @@unique([tenantId, employeeNo])  // 同租户内工号唯一
  @@index([tenantId])
  @@index([companyId])
  @@schema("auth")
}
```

**权限数据范围**:
| 范围类型 | 说明 | 示例角色 |
|----------|------|----------|
| `platform` | 所有租户所有数据 | 平台管理员 |
| `group` | 本租户所有公司数据 | 集团管理员 |
| `company` | 本公司所有数据 | 公司管理员 |
| `department` | 本部门及下级 | 部门经理 |
| `team` | 本小组数据 | 小组长 |
| `self` | 仅自己数据 | 普通员工 |

**业务表结构规范**:
```typescript
// 所有业务表必须包含 tenantId + companyId
model Customer {
  id        String  @id
  tenantId  String  // 必须 - 租户隔离 (绝对)
  companyId String  // 必须 - 公司隔离 (集团可跨)
  // ...
  @@index([tenantId])
  @@index([tenantId, companyId])
}
```

**buildScopeFilter 实现**:
```typescript
export function buildScopeFilter(session: Session) {
  const { tenantId, companyId, departmentId, teamId, id: userId, dataScope } = session.user

  const filter: any = {}

  switch (dataScope) {
    case "PLATFORM":
      break // 平台管理员看全部，无过滤
    case "GROUP":
      filter.tenantId = tenantId // 本租户所有公司
      break
    case "COMPANY":
      filter.tenantId = tenantId
      filter.companyId = companyId
      break
    case "DEPARTMENT":
      filter.tenantId = tenantId
      filter.companyId = companyId
      filter.departmentId = { in: getDepartmentTree(departmentId) }
      break
    case "TEAM":
      filter.tenantId = tenantId
      filter.companyId = companyId
      filter.teamId = teamId
      break
    case "SELF":
      filter.tenantId = tenantId
      filter.companyId = companyId
      filter.createdById = userId
      break
  }
  return filter
}
```

**后果**:
- 所有业务表必须有 `tenantId` + `companyId` 字段
- Session 中包含 `tenantId`, `companyId`, `departmentId`, `teamId`, `dataScope`
- **平台管理员**: 无过滤，可看所有租户数据
- **集团管理员**: 带 `tenantId`，可看本租户所有公司
- **其他用户**: 带 `tenantId` + `companyId`

---

## Risk Assessment

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| Prisma Multi-Schema 预览特性不稳定 | 中 | 高 | 准备回退到单 Schema 方案 |
| Redis 单点故障 | 中 | 高 | 配置 Sentinel 或 Cluster |
| 子系统源码更新后合并困难 | 高 | 中 | 最小化改动，使用 Adapter 模式 |
| Directus 性能瓶颈 | 低 | 中 | 权限数据缓存到 Redis |

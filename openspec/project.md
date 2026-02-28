# Project Context

## Purpose
**TWCRM** 是一个面向台湾智能家居行业的 CRM 系统，采用 **集团总部 + 多子公司** 架构。总部可查看所有子公司数据，子公司之间数据完全隔离。系统涵盖 CRM、B2B 订货、进销存、培训、财务、OKR 等模块。

**核心目标**：打造一个统一的、模块化的、多租户的智能家居企业管理平台。

## Tech Stack

### Framework & Runtime
- **Next.js 16** (App Router + Turbopack)
- **React 19** (Server Components + Server Actions)
- **TypeScript 5.7+** (Strict Mode)
- **pnpm 10.x** (Monorepo Workspaces，严禁 yarn/npm/bun)
- **Turborepo** (任务编排)

### Database & ORM
- **PostgreSQL 17** (Multi-Schema 隔离，单实例)
- **Prisma 7** (TypeScript 重写，3x 更快)
- **Redis 7** (Session + Cache + BullMQ 队列)
- **MinIO** (S3 兼容对象存储)

### Authentication & Authorization
- **Auth.js v5** (next-auth@5，自建，JWT Session)
- **自建 RBAC** (Prisma 模型 + Middleware)
- **行级多租户隔离** (tenantId 字段 + Prisma Middleware 自动过滤)

### Frontend
- **Tailwind CSS 4.2** (CSS-first 配置，Oxide Engine)
- **Shadcn UI** (Zinc 主题)
- **Zustand 5** (UI 状态)
- **Nuqs** (URL 状态)
- **TanStack Table 8** (服务端分页表格)
- **TanStack Query 5** (服务端状态)
- **React Hook Form 7** + **Zod 4** (表单校验)
- **Recharts 3** (图表)
- **Lucide React** (图标)
- **Sonner** (Toast 通知)

### Realtime & Communication
- **Socket.IO** (WebSocket + Redis Pub/Sub 多实例广播)

### Content & Docs
- **BlockNote** (Notion 风格块编辑器，基于 Tiptap/ProseMirror)

### Table System
- **Teable** (开源 Airtable，原生 PG 表，源码集成到 monorepo)

### Internationalization
- **next-intl 4** (用户级语言偏好，zh-CN 默认 / zh-TW / en)

## Project Conventions

### Architecture Patterns
- **OOP 分层**: Component → Hook → Service → Repository → Entity
- **SOLID 原则**: 单一职责、开闭、里氏替换、接口隔离、依赖倒置
- **Feature-based 目录**: 每个业务模块独立 components/actions/services/repositories/hooks/schemas/events/types
- **DI 容器**: 工厂函数创建 Service 实例，统一管理依赖

### Code Style
- **命名即文档**: 变量名必须全称且语义化
- **严禁 `any`**: 全链路类型安全
- **严禁魔法数字**: 常量必须有明确命名
- **DTO/VO 分离**: 输入用 DTO (Zod Schema)，输出用 VO (TypeScript Type)
- **接口优先**: Service/Repository 必须先定义 Interface

### Naming Conventions
| 类型 | 规则 | 示例 |
|------|------|------|
| React 组件文件 | kebab-case | `order-list.tsx` |
| Service 类文件 | kebab-case + `.service` | `order.service.ts` |
| Repository 文件 | kebab-case + `.repository` | `order.repository.ts` |
| Hook 文件 | kebab-case + `use-` | `use-order.ts` |
| Schema 文件 | kebab-case + `.schema` | `order.schema.ts` |
| 类名 | PascalCase | `OrderService` |
| 接口名 | PascalCase + `I` 前缀 | `IOrderService` |
| 常量 | UPPER_SNAKE_CASE | `ORDER_STATUS` |
| Server Action | camelCase + 动词 | `createOrderAction` |

### Directory Structure
```
TWCRM/
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── .env
├── apps/
│   ├── portal/                # CRM 主应用 (Next.js 16)
│   │   └── src/
│   │       ├── app/           # App Router
│   │       │   ├── (auth)/    # 登录/注册
│   │       │   └── (dashboard)/ # 后台主体
│   │       ├── features/      # 业务模块 (Feature-based)
│   │       ├── components/    # 共享组件
│   │       ├── hooks/         # 全局 Hooks
│   │       ├── lib/           # 工具函数
│   │       ├── messages/      # i18n 语言文件
│   │       ├── stores/        # Zustand stores
│   │       └── types/         # TypeScript 类型
│   └── teable/                # Teable 表格系统（源码集成）
├── packages/
│   ├── db/                    # Prisma 7 + Multi-Schema
│   ├── shared/                # 全局类型/错误类/常量
│   └── ui/                    # 设计系统/设计令牌
├── skills/                    # Cursor Skills
├── openspec/                  # OpenSpec 规范驱动
└── doc/                       # 文档
```

### Technical Constraints
- **❌ NO API Routes**: 严禁创建 `/app/api`，所有后端交互用 Server Actions
- **✅ Server Actions**: `"use server"` + Zod 校验 + ActionResult 统一返回
- **✅ Prisma 7**: 数据库变更必须先修改 `schema.prisma`，再 `prisma db push`
- **✅ Multi-Schema**: 各模块使用独立 PostgreSQL Schema (auth/system/crm/ordering/inventory/finance/okr/docs/lms)
- **✅ tenantId 隔离**: 所有业务表必须有 tenantId 字段，Prisma Middleware 自动过滤
- **✅ i18n**: 所有 UI 文案必须走 next-intl，禁止硬编码中文
- **✅ Shadcn UI First**: 优先复用 Shadcn UI 组件，禁止引入其他 UI 库
- **❌ No Zustand for Server Data**: Zustand 仅用于 UI 状态，服务端数据用 TanStack Query
- **✅ OOP**: 业务逻辑必须封装在 Service 类中，禁止在组件中直接写业务逻辑

### DRY / YAGNI / KISS
- **DRY**: 逻辑重复 2 次必须重构
- **YAGNI**: 只实现当前需求，严禁过度封装
- **KISS**: 可读性 > 炫技

## Domain Context

### 多租户模型
```
总部 (Platform) — 可查看所有子公司数据 + 大屏汇总
  ├── 子公司A (台北分部) — 数据隔离
  ├── 子公司B (台中分部) — 数据隔离
  └── 子公司C (高雄分部) — 数据隔离
```

### 角色层级
| 角色 | 数据范围 |
|------|----------|
| `platform_admin` | 所有租户 |
| `platform_viewer` | 所有租户（只读） |
| `tenant_admin` | 本租户 |
| `tenant_manager` | 本租户 |
| `tenant_user` | 本租户 |

### 业务模块 & 数据库 Schema
| 模块 | Schema | 说明 | 阶段 |
|------|--------|------|------|
| 认证/权限 | `auth` | 用户/角色/权限/租户/Session | 第一期 |
| 系统管理 | `system` | 公告/通知/配置/审计日志 | 第一期 |
| B2B 订货 | `ordering` | 产品目录/订单/余额/物流 | 第一期（优先） |
| CRM | `crm` | 客户/商机/合同/工单 | 第一期 |
| 文档知识库 | `docs` | BlockNote 文档/权限/引用 | 第一期 |
| 进销存 | `inventory` | 仓库/库存/SN码/采购/调拨 | 第二期 |
| 培训 LMS | `lms` | 课程/考试/证书 | 第二期 |
| 财务 | `finance` | 收款/付款/发票 | 第三期 |
| OKR | `okr` | OKR/KPI/项目/任务/TodoList | 第三期 |

### WebSocket 事件
| 事件 | 说明 |
|------|------|
| `order:new` | 新订单通知（总部） |
| `order:status_changed` | 订单状态变更 |
| `stock:low` | 库存预警 |
| `workorder:assigned` | 工单指派 |
| `notification:new` | 系统通知 |
| `announcement:new` | 新公告 |

## External Dependencies

### 基础设施 (已部署)
- **PostgreSQL 17**: `192.168.110.246:5433` / DB: `crmall0125`
- **Redis 7**: `192.168.110.246:6379`
- **MinIO**: `192.168.110.246:9000` / Bucket: `crmall0125`

## Important Constraints

### 包管理
- **pnpm 10.x** 是唯一允许的包管理器
- 严禁使用 yarn / npm / bun

### 数据库
- 单实例 PostgreSQL，Multi-Schema 隔离
- 禁止跨 Schema 外键
- 所有业务表必须有 `tenantId` 字段

### 国际化
- 默认语言: `zh-CN` (简体中文)
- 支持: `zh-CN` / `zh-TW` / `en`
- 用户级偏好，存储在 `user.locale` 字段

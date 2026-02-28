## Why

TWCRM 项目已完成 Monorepo 基础设施搭建（pnpm + Turborepo）、数据库设计（9 Schema / 68 表）、Seed 初始化数据、共享包（db/shared/ui）和 Portal 骨架。现在需要实现第一期核心功能：认证登录、RBAC 权限、B2B 订货系统、CRM 基础、公告通知，让系统可以真正跑起来。

## What Changes

- 实现 Auth.js v5 登录/登出，JWT Session 包含 tenantId/roles/permissions/locale
- 实现自建 RBAC 中间件，Server Action 级别权限校验
- 实现 Prisma 多租户 Middleware，自动注入 tenantId 过滤
- 搭建 Dashboard 布局（侧边栏 + 顶部导航 + 面包屑），菜单按权限动态渲染
- 实现 B2B 订货系统全流程（产品目录 → 购物车 → 下单 → 发货 → 收货）
- 实现 CRM 基础（客户列表 CRUD + 商机看板）
- 实现公告发布 + 通知中心（WebSocket 实时推送）
- 实现用户语言偏好切换（zh-CN / zh-TW / en）

### Schema 影响
- `auth` — 读写 User/Role/Permission/Session/Tenant
- `system` — 读写 Announcement/Notification/SystemConfig
- `ordering` — 读写 CatalogProduct/Order/CartItem/TenantAccount/Shipment
- `crm` — 读写 Customer/Opportunity

### 多租户
- 涉及 tenantId 变更：所有业务查询自动注入 tenantId 过滤
- 总部用户 (isPlatform) 跳过过滤

### 权限
- 需要新增权限：已在 Seed 中创建 343 个权限，本期激活使用

### WebSocket
- 新增事件：`notification:new`、`announcement:new`、`order:new`、`order:status_changed`

### i18n
- 需要扩展三语言文件：新增 ordering/crm/settings 命名空间

## Capabilities

### New Capabilities
- `auth-login`: Auth.js v5 登录/登出流程，JWT Session，密码加密验证
- `rbac-middleware`: Server Action 权限校验中间件 + React 权限守卫组件
- `tenant-isolation`: Prisma Middleware 自动 tenantId 过滤
- `dashboard-shell`: 后台布局（响应式侧边栏 + 顶部导航 + 权限菜单 + 面包屑）
- `ordering-catalog`: 产品目录浏览（分类筛选 + 搜索 + 专属价格）
- `ordering-cart`: 购物车（增删改 + MOQ 校验 + 定制备注）
- `ordering-flow`: 订单全流程（下单 → 余额扣款 → 备货 → 发货 → 收货）
- `ordering-admin`: 总部订单管理（产品维护 + 价格管理 + 发货 + 余额充值）
- `crm-customers`: 客户列表 CRUD + 联系人管理
- `crm-opportunities`: 商机看板（阶段拖拽 + 跟进记录）
- `notification-center`: 通知中心 + 公告管理 + WebSocket 实时推送
- `locale-switcher`: 用户语言偏好切换组件

### Modified Capabilities
- `database`: 新增 Prisma Middleware 多租户自动过滤逻辑
- `design-system`: 新增业务组件（StatusBadge / PriorityBadge / CurrencyDisplay / DataTable）
- `i18n`: 扩展翻译文件，新增 ordering/crm/settings 命名空间

## Non-goals

- 不做进销存（inventory）— 第二期
- 不做培训 LMS — 第二期
- 不做财务模块 — 第三期
- 不做 OKR/项目管理 — 第三期
- 不做 BlockNote 文档编辑器 — 第二期
- 不做 Teable 表格集成 — 第二期
- 不做在线支付对接 — 仅预留接口
- 不做电子发票 — 仅预留字段
- 不做 Socket.IO 服务端（本期用 polling 模拟，第二期接入真实 WebSocket）

## Impact

### 代码影响
- `apps/portal/src/` — 新增 features/auth、features/ordering、features/crm、features/notification、components/layout
- `packages/db/src/middleware.ts` — 激活多租户过滤
- `packages/shared/src/` — 可能新增 Zod Schema
- `packages/ui/src/` — 新增业务通用组件

### 依赖
- `bcryptjs` — 密码加密（已安装）
- `next-auth` — 认证（已安装）
- `socket.io-client` — WebSocket 客户端（待安装，第二期真实接入）

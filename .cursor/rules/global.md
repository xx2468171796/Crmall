# TWCRM 全局规则

## 项目信息
- 项目名称: TWCRM (台湾智能家居 CRM)
- 包管理器: pnpm 10.x (严禁使用 yarn/npm/bun)
- 框架: Next.js 16 (App Router + Turbopack)
- 语言: TypeScript 5.7+ 严格模式
- ORM: Prisma 7 (TypeScript 重写版)
- 数据库: PostgreSQL 17 (Multi-Schema)
- 认证: Auth.js v5 (自建，不用 Clerk)
- CSS: Tailwind CSS 4.2 + Shadcn UI
- 状态: Zustand 5 (UI) + Nuqs (URL)
- 实时: Socket.IO + Redis Pub/Sub
- 编辑器: BlockNote (Notion 风格)
- 表格系统: Teable (源码集成)
- i18n: next-intl (zh-CN/zh-TW/en，默认简体中文)

## 详细规范参考
- 编码规范详见: `doc/编码规范.md` (600+ 行，OOP/命名/模块结构/组件通信/错误处理)
- 规则限定详见: `doc/规则限定.md` (250+ 行，架构法则/技术约束/禁止清单)
- 技术架构详见: `doc/技术架构.md` (1000+ 行，完整数据模型/模块设计/阶段规划)

## 架构规则
- 分层架构: Component → Hook → Action → Service → Repository → Entity
- 所有业务逻辑必须在 Service 类中，组件只负责展示
- 数据访问必须通过 Repository 类，不允许组件直接调用 Prisma
- 跨模块通信通过 Server Actions，不直接 import 其他模块 Repository
- 所有业务表必须带 tenantId 字段（行级多租户隔离）

## 可配置化规则（核心）
- 所有业务参数必须从 `system.SystemConfig` 表读取，禁止硬编码
- 配置优先级: 租户级覆盖 (tenantId 有值) > 全局配置 (tenantId=null) > 代码 fallback
- 配置读取必须通过 `ConfigService` 类，禁止直接查 SystemConfig 表
- 可配置参数包括但不限于: MOQ、价格、阈值、状态列表、物流公司、支付方式、主题色、圆角等
- 新增业务参数时，必须同时: 1) 加入 Seed 数据 2) 在 Service 中通过 ConfigService 读取

## DI 容器规则
- Service 类通过工厂函数创建（`src/lib/container.ts`）
- Service 构造函数必须注入: IConfigService + 所需的 IXxxRepository
- 禁止在 Service 中直接 new 依赖，必须通过构造函数注入
- Server Action 中通过工厂函数获取 Service 实例

## 文件命名
- React 组件: kebab-case (order-list.tsx)
- Service: kebab-case.service.ts (order.service.ts)
- Repository: kebab-case.repository.ts (order.repository.ts)
- Hook: use-{name}.ts (use-order.ts)
- Schema: kebab-case.schema.ts (order.schema.ts)
- Server Action: kebab-case.action.ts (order.action.ts)
- WS 事件: kebab-case.events.ts (order.events.ts)
- 接口文件: kebab-case.interface.ts (order.service.interface.ts)

## 命名规则
- 变量/函数: camelCase
- 常量: UPPER_SNAKE_CASE
- 类: PascalCase (OrderService)
- 接口: I + PascalCase (IOrderService)
- 类型: PascalCase (OrderVO)
- DTO: CreateOrderDTO / UpdateOrderDTO
- VO: OrderVO / OrderListVO

## Server Action 规范
- 统一返回 ActionResult<T> = { success, data } | { success, error, code }
- 必须校验 session (await requireAuth())
- 必须校验权限 (await requirePermission('xxx'))
- 必须用 Zod 校验输入
- 变更操作后必须 revalidatePath
- 通过 DI 工厂函数获取 Service: `const service = createOrderService()`

## 组件规范
- 单个组件不超过 150 行
- UI 组件不含业务逻辑
- 使用 Shadcn UI 组件库
- 支持 Light/Dark 主题
- 所有文案走 i18n (useTranslations)

## 数据库规范
- 所有表必须有 id (cuid), createdAt, updatedAt
- 业务表必须有 tenantId (多租户)
- 使用 Multi-Schema: auth / system / crm / ordering / inventory / finance / okr / docs / lms
- 禁止在数据库存冗余计算字段

## WebSocket 规范
- 事件命名: {module}:{action} (order:new, stock:low)
- 房间: platform / tenant:{id} / user:{id}
- 连接时必须校验 Auth.js session token

## 错误处理
- 业务异常继承 AppError 类
- Server Action 用 try/catch 包裹，返回 fail()
- 前端用 toast 展示错误信息

## 禁止事项
- 禁止使用 any 类型
- 禁止在组件中直接写 SQL 或 Prisma 查询
- 禁止硬编码配置值（MOQ、价格、阈值、状态列表、物流公司、支付方式等必须可配置）
- 禁止使用 API Routes（用 Server Actions 替代）
- 禁止跳过权限校验
- 禁止不带 tenantId 查询业务数据（总部除外）
- 禁止 Service 不注入 ConfigService
- 禁止直接 new Service（必须通过 DI 工厂函数）
- 禁止直接查 SystemConfig 表（必须通过 ConfigService）
- 禁止使用 useEffect 获取数据（用 TanStack Query 或 Server Component）
- 禁止将服务端数据存入 Zustand（用 TanStack Query）
- 禁止创建 .css / .scss 文件（用 Tailwind）
- 禁止单个组件超过 150 行

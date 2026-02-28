# Prisma 数据库规则

globs: packages/db/**,prisma/**,*.prisma

## Prisma 7 配置
- 使用 Prisma 7 (TypeScript 重写版)
- 必须指定 output 路径: `../generated/client`
- 必须安装数据库适配器 (`@prisma/adapter-pg`)
- 连接配置在 `prisma.config.ts` 中（Prisma 7 不再支持 schema 中的 url）
- Node.js >= 22

## Schema 规范
- 使用 Multi-Schema: auth / system / crm / ordering / inventory / finance / okr / docs / lms
- 每个 model 必须指定 `@@schema("xxx")`
- 每个 model 必须有: `id` (String @id @default(cuid())), `createdAt`, `updatedAt`
- 业务 model 必须有: `tenantId` (String, 带 @@index)
- 金额字段: `Decimal @db.Decimal(12, 2)`
- 状态字段: `String` + 注释列出所有可能值
- 禁止跨 Schema 外键

## Repository 模式
- 不允许在 Service/Component 中直接使用 prisma client
- 所有数据访问通过 Repository 类
- Repository 自动注入 tenantId WHERE 条件（通过 Prisma Middleware）
- 复杂操作使用 `prisma.$transaction`

## 多租户 Middleware
- 使用 AsyncLocalStorage 注入当前用户的 tenantId
- Middleware 自动为查询/更新/删除操作注入 `WHERE tenantId = ?`
- 总部用户 (isPlatform=true) 跳过过滤
- 需要过滤的模型列表在 `packages/db/src/middleware.ts` 中维护

## SystemConfig 表使用规范

`system.SystemConfig` 是全局配置表，结构：
```
id        String   @id @default(cuid())
tenantId  String?  /// null = 全局配置，有值 = 租户级覆盖
group     String   /// general | email | sms | payment | notification | theme | ordering | crm | inventory
key       String
value     String   /// JSON 字符串
label     String?  /// 配置项中文名
@@unique([tenantId, group, key])
```

### 使用规则
- 禁止在代码中直接查 SystemConfig 表
- 必须通过 `ConfigService` 类读取配置
- ConfigService 实现配置优先级: 租户级 > 全局 > fallback
- 新增配置项时必须同时更新 `seed.ts` 中的默认值
- 配置值统一存为 JSON 字符串（数字存 `"10"`，布尔存 `"true"`，数组存 `'["a","b"]'`）

### 配置分组
| group | 说明 | 示例 key |
|-------|------|----------|
| general | 通用 | app_name, default_locale, timezone |
| theme | 主题 | primary_color, border_radius, logo_url |
| ordering | 订货 | auto_confirm_order, min_order_amount, shipping_carriers |
| crm | CRM | opportunity_stages, customer_levels, customer_sources |
| inventory | 库存 | low_stock_threshold, enable_sn_tracking |
| notification | 通知 | email_enabled, ws_enabled, digest_interval |

## 命名规范
- Model: PascalCase 单数 (Customer, Order, Product)
- 字段: camelCase (tenantId, createdAt)
- 关系: 有意义的名称 (items, shipment, parent/children)
- 索引: `@@index([tenantId])` 必须加在业务表上

## 数据变更流程
1. 修改 `packages/db/prisma/schema.prisma`
2. 运行 `pnpm db:push` 同步到数据库
3. 运行 `pnpm db:generate` 重新生成 Client
4. 如有新配置项，更新 `packages/db/src/seed.ts`
5. 运行 `pnpm db:seed` 初始化数据

# Feature 模块结构规则

globs: src/features/**

## 每个 feature 模块必须遵循以下目录结构

```
src/features/{module}/
├── types/                # DTO / VO / 模块类型
│   └── {name}.types.ts
├── schemas/              # Zod Schema (输入校验)
│   └── {name}.schema.ts
├── repositories/         # 数据访问类 (Prisma 封装)
│   ├── {name}.repository.interface.ts   # 接口定义
│   └── {name}.repository.ts             # 实现
├── services/             # 业务逻辑类 (OOP)
│   ├── {name}.service.interface.ts      # 接口定义
│   └── {name}.service.ts               # 实现
├── actions/              # Server Actions ("use server")
│   └── {name}.action.ts
├── hooks/                # 自定义 Hooks (TanStack Query 封装)
│   └── use-{name}.ts
├── components/           # UI 组件（只负责展示）
│   ├── {name}-list.tsx
│   ├── {name}-form.tsx
│   ├── {name}-detail.tsx
│   └── {name}-card.tsx
├── events/               # WebSocket 事件定义
│   └── {name}.events.ts
├── constants/            # 模块 fallback 常量（仅作为 ConfigService 的默认值）
│   └── {name}.constants.ts
└── utils/                # 模块工具函数
    └── {name}.utils.ts
```

## 创建顺序（必须按此顺序）

1. `types/` — 先定义 DTO (输入) 和 VO (输出) 类型
2. `schemas/` — Zod Schema 校验输入
3. `repositories/` — 先写 interface，再写实现
4. `services/` — 先写 interface，再写实现（注入 ConfigService + Repository）
5. `actions/` — Server Action 调用 Service
6. `hooks/` — TanStack Query 封装 Action
7. `components/` — UI 组件调用 Hook

## Service 类规范

- 必须定义接口 (IXxxService)
- 构造函数必须注入 `IConfigService`（读取可配置业务参数）
- 构造函数注入所需的 `IXxxRepository`
- 不直接使用 Prisma，通过 Repository 访问数据
- 复杂操作使用 Prisma 事务
- 通过 DI 工厂函数创建实例（`src/lib/container.ts`）

### Service 模板

```typescript
// {name}.service.interface.ts
export interface IOrderService {
  createOrder(tenantId: string, dto: CreateOrderDTO): Promise<OrderVO>
  getOrders(tenantId: string, params: ListParams): Promise<PaginatedResult<OrderVO>>
}

// {name}.service.ts
export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly configService: IConfigService,  // 必须注入
  ) {}

  async createOrder(tenantId: string, dto: CreateOrderDTO) {
    // 从 ConfigService 读取业务参数
    const autoConfirm = await this.configService.getBoolean('ordering', 'auto_confirm_order', tenantId)
    // ...
  }
}
```

### 各模块可配置参数（Service 中必须从 ConfigService 读取）

| 模块 | 参数 | ConfigService 调用 |
|------|------|-------------------|
| ordering | 自动确认 | `configService.getBoolean('ordering', 'auto_confirm_order', tenantId)` |
| ordering | 最低金额 | `configService.getNumber('ordering', 'min_order_amount', tenantId)` |
| ordering | 信用下单 | `configService.getBoolean('ordering', 'allow_credit_order', tenantId)` |
| ordering | 物流公司 | `configService.getJson('ordering', 'shipping_carriers', tenantId)` |
| crm | 商机阶段 | `configService.getJson('crm', 'opportunity_stages', tenantId)` |
| crm | 客户等级 | `configService.getJson('crm', 'customer_levels', tenantId)` |
| crm | 客户来源 | `configService.getJson('crm', 'customer_sources', tenantId)` |
| inventory | 低库存阈值 | `configService.getNumber('inventory', 'low_stock_threshold', tenantId)` |

## Repository 类规范

- 必须定义接口 (IXxxRepository)
- 封装所有 Prisma 查询
- tenantId 过滤由 Prisma Middleware 自动注入
- 返回类型化的结果
- 不包含业务逻辑

## Hook 规范

- `use{Entity}` — 单条数据查询 (TanStack Query)
- `use{Entity}List` — 列表查询 (分页/过滤)
- `use{Entity}Mutation` — 增删改操作 (useMutation)
- `use{Entity}Realtime` — WebSocket 实时更新
- `use{Entity}Form` — 表单状态管理 (React Hook Form)

## Server Action 规范

- 文件名: `{entity}.action.ts`
- 函数名: `{verb}{Entity}Action` (createOrderAction)
- 必须返回 `ActionResult<T>`
- 必须校验 auth + permission + zod
- 通过 DI 工厂函数获取 Service: `const service = createOrderService()`
- 变更操作后 `revalidatePath()`

### Action 模板

```typescript
'use server'

import { requirePermission } from '@/lib/rbac'
import { createOrderService } from '@/lib/container'
import { createOrderSchema } from '../schemas/order.schema'
import { ok, fail, type ActionResult } from '@twcrm/shared'
import { AppError } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'

export async function createOrderAction(input: unknown): Promise<ActionResult<OrderVO>> {
  try {
    const user = await requirePermission('ordering:create:order')
    const dto = createOrderSchema.parse(input)
    const service = createOrderService()
    const order = await service.createOrder(user.tenantId, dto)
    revalidatePath('/ordering/orders')
    return ok(order)
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.code)
    throw error
  }
}
```

# OOP 分层架构规则

globs: src/features/**,src/lib/**

## 分层架构（严格遵循，禁止跨层调用）

```
┌─────────────────────────────────────────┐
│  UI Layer (React Components)            │  只负责展示，不含业务逻辑
│  └── 调用 Hooks / Server Actions        │
├─────────────────────────────────────────┤
│  Hook Layer (Custom Hooks)              │  组合逻辑，TanStack Query 封装
│  └── 调用 Server Actions               │
├─────────────────────────────────────────┤
│  Action Layer (Server Actions)          │  入口层，校验 auth + permission + zod
│  └── 通过 DI 工厂获取 Service           │
├─────────────────────────────────────────┤
│  Service Layer (Business Logic)         │  核心业务逻辑，OOP 类
│  └── 注入 ConfigService + Repository    │
├─────────────────────────────────────────┤
│  Repository Layer (Data Access)         │  数据访问，Prisma 封装
│  └── 自动注入 tenantId 过滤            │
├─────────────────────────────────────────┤
│  Entity / DTO / VO Layer               │  数据模型 + Zod Schema
└─────────────────────────────────────────┘
```

## Interface 优先原则

创建任何 Service 或 Repository 时，必须先定义接口：

```typescript
// 1. 先写接口 — order.service.interface.ts
export interface IOrderService {
  createOrder(tenantId: string, dto: CreateOrderDTO): Promise<OrderVO>
  getOrderById(id: string): Promise<OrderVO | null>
  cancelOrder(id: string, reason: string): Promise<void>
}

// 2. 再写实现 — order.service.ts
export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly accountRepo: IAccountRepository,
    private readonly configService: IConfigService,  // 必须注入
  ) {}

  async createOrder(tenantId: string, dto: CreateOrderDTO) {
    // 从配置读取业务参数，不硬编码
    const autoConfirm = await this.configService.getBoolean('ordering', 'auto_confirm_order', tenantId)
    const minAmount = await this.configService.getNumber('ordering', 'min_order_amount', tenantId)

    if (dto.totalAmount < minAmount) {
      throw new BusinessRuleError(`订单金额不能低于 ${minAmount}`)
    }
    // ...业务逻辑
  }
}
```

## DI 容器（工厂函数）

所有 Service 实例通过 `src/lib/container.ts` 工厂函数创建：

```typescript
// src/lib/container.ts
import { prisma } from '@twcrm/db'
import { ConfigService } from './services/config.service'
import { OrderRepository } from '@/features/ordering/repositories/order.repository'
import { AccountRepository } from '@/features/ordering/repositories/account.repository'
import { OrderService } from '@/features/ordering/services/order.service'
import type { IOrderService } from '@/features/ordering/services/order.service.interface'

// ConfigService 单例
let _configService: ConfigService | null = null
function getConfigService(): ConfigService {
  if (!_configService) _configService = new ConfigService(prisma)
  return _configService
}

export function createOrderService(): IOrderService {
  const config = getConfigService()
  const orderRepo = new OrderRepository(prisma)
  const accountRepo = new AccountRepository(prisma)
  return new OrderService(orderRepo, accountRepo, config)
}

// 每个模块一个工厂函数...
export function createCustomerService(): ICustomerService { ... }
export function createNotificationService(): INotificationService { ... }
```

## Server Action 中使用 DI

```typescript
// order.action.ts
'use server'

import { requirePermission } from '@/lib/rbac'
import { createOrderService } from '@/lib/container'
import { createOrderSchema } from '../schemas/order.schema'
import { ok, fail } from '@twcrm/shared'

export async function createOrderAction(input: unknown) {
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

## Repository 基类模板

```typescript
// src/lib/base.repository.ts
export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaClient) {}

  // 子类实现具体查询，tenantId 由 Prisma Middleware 自动注入
}
```

## 禁止事项

- 禁止跨层调用（Component 不能直接调 Repository）
- 禁止在 Component 中写业务逻辑（超过 3 行逻辑必须抽到 Hook/Service）
- 禁止在 Service 中直接使用 Prisma（必须通过 Repository）
- 禁止 Service 不注入 ConfigService（业务参数必须可配置）
- 禁止直接 `new XxxService()`（必须通过 DI 工厂函数）
- 禁止 Repository 包含业务逻辑（只做数据访问）
- 禁止 Hook 直接调用 Repository（必须通过 Server Action → Service）

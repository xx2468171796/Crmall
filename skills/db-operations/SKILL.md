# DB Operations 技能 — 数据库操作

## 技术栈
- Prisma 7.4.x (TypeScript 重写版)
- PostgreSQL 17
- Multi-Schema 隔离
- Repository 模式

## Prisma 7 关键变更（vs v6）
- 移除 Rust 引擎，纯 TypeScript
- 必须指定 output 路径
- 必须安装 @prisma/adapter-pg
- Node.js >= 20.19.0
- import 路径从 node_modules 改为 custom output

## Schema 配置

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth", "crm", "ordering", "inventory", "finance", "okr", "docs", "lms"]
}
```

## Schema 列表

| Schema | 用途 |
|--------|------|
| auth | 用户/角色/权限/租户/Session |
| crm | 客户/商机/合同/联系人/工单 |
| ordering | 产品目录/订单/余额/物流 |
| inventory | 仓库/库存/SN码/采购/调拨 |
| finance | 收款/付款/发票 |
| okr | OKR/KPI/项目/任务/TodoList |
| docs | 文档/权限/引用 |
| lms | 课程/章节/考试/证书/进度 |

## Repository 模式

每个模块必须通过 Repository 访问数据：

```typescript
export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>
  findByTenant(tenantId: string, filters: Filters): Promise<PaginatedResult<Customer>>
  create(data: CreateCustomerDTO): Promise<Customer>
  update(id: string, data: UpdateCustomerDTO): Promise<Customer>
  delete(id: string): Promise<void>
}

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}
  // 实现...
}
```

## 多租户自动过滤

Prisma Middleware 自动注入 tenantId：

```typescript
prisma.$use(async (params, next) => {
  const tenantId = getCurrentTenantId()
  if (tenantId && TENANT_MODELS.includes(params.model)) {
    if (['findMany', 'findFirst', 'count'].includes(params.action)) {
      params.args.where = { ...params.args.where, tenantId }
    }
    if (params.action === 'create') {
      params.args.data.tenantId = tenantId
    }
  }
  return next(params)
})
```

## 事务规范

涉及多表操作必须用事务：

```typescript
await prisma.$transaction(async (tx) => {
  // 所有操作在同一个事务中
})
```

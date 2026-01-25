---
name: db-operations
description: 数据库操作技能。在需要进行数据库查询、创建、更新、删除、迁移等操作时使用此技能。基于 Prisma v6 + PostgreSQL v17 Multi-Schema + Repository 模式 + Zod 验证。
---

# 数据库操作技能 (Database Operations Skill)

执行数据库相关操作时，遵循以下流程和规范。

## 技术栈

- **Prisma v6+** - ORM 框架
- **PostgreSQL v17** - 主数据库
- **Multi-Schema** - 子系统隔离
- **Zod** - 输入验证
- **Repository Pattern** - 数据访问封装

## 数据库连接

```env
# .env
DATABASE_URL="postgres://crmall0125:xx123654@192.168.110.246:5433/crmall0125?sslmode=disable"
```

## Schema 分配

| 子系统 | Schema 名称 |
|--------|-------------|
| Portal/Auth | `auth` |
| CRM | `nocodb` |
| OKR | `plane` |
| Finance | `midday` |
| Inventory | `medusa` |
| Learning | `classroomio` |
| Docs | `appflowy` |
| Admin | `public` |

## Prisma Schema 示例

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth", "nocodb", "plane"]
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@schema("auth")
}

model Customer {
  id        String   @id @default(cuid())
  name      String
  email     String?
  phone     String?
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@schema("nocodb")
}
```

## 数据库操作流程

### 1. Schema 变更

```bash
# 修改 schema.prisma 后
npx prisma migrate dev --name <migration-name>
npx prisma generate
```

### 2. Repository 模式

```typescript
// src/lib/db/repositories/customer.repository.ts
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export class CustomerRepository {
  async findMany(where?: Prisma.CustomerWhereInput) {
    return prisma.customer.findMany({
      where: {
        ...where,
        deletedAt: null, // 默认排除已删除
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
    })
  }

  async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data })
  }

  async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({
      where: { id },
      data,
    })
  }

  async softDelete(id: string) {
    return prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}

export const customerRepository = new CustomerRepository()
```

### 3. Server Action 调用

```typescript
// src/actions/customer/create.ts
"use server"

import { auth } from "@/lib/auth"
import { customerRepository } from "@/lib/db/repositories/customer.repository"
import { createCustomerSchema } from "@/schemas/customer"
import { revalidatePath } from "next/cache"

export async function createCustomer(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const validated = createCustomerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  })

  if (!validated.success) {
    return { error: validated.error.flatten() }
  }

  await customerRepository.create({
    ...validated.data,
    ownerId: session.user.id,
  })

  revalidatePath("/customers")
  return { success: true }
}
```

## Zod Schema 定义

```typescript
// src/schemas/customer.ts
import { z } from "zod"

export const createCustomerSchema = z.object({
  name: z.string().min(1, "客户名称不能为空"),
  email: z.string().email("请输入有效邮箱").optional().or(z.literal("")),
  phone: z.string().optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
```

## 事务处理

```typescript
// 多表操作使用事务
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData })
  
  await tx.orderItem.createMany({
    data: items.map(item => ({
      orderId: order.id,
      ...item,
    })),
  })
  
  await tx.inventory.updateMany({
    where: { productId: { in: productIds } },
    data: { quantity: { decrement: 1 } },
  })
  
  return order
})
```

## 核心规范

1. **Schema First** - 先改 schema.prisma，再生成迁移
2. **Repository 封装** - 禁止在组件中直接使用 Prisma
3. **Zod 验证** - 所有输入必须验证
4. **软删除** - 使用 deletedAt，禁止物理删除
5. **类型安全** - 使用 Prisma 生成的类型

## 禁止事项

- ❌ 直接在组件中调用 prisma
- ❌ 不经过 Zod 验证直接插入数据
- ❌ 物理删除用户数据
- ❌ 硬编码数据库连接字符串
- ❌ 跳过迁移直接修改数据库

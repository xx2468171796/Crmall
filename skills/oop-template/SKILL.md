# OOP 模块脚手架模板技能

## 概述
当创建新的业务模块时使用此技能。按照严格的 OOP 分层架构，生成完整的模块脚手架代码。

## 使用场景
- 创建新的 feature 模块（如 ordering、crm、inventory）
- 在现有模块中新增实体（如在 crm 中新增 WorkOrder）

## 创建步骤（必须按此顺序）

### Step 1: 定义类型 (types/)

```typescript
// src/features/{module}/types/{entity}.types.ts

/** 创建 DTO — 输入 */
export interface Create{Entity}DTO {
  // 从 Zod Schema 推导，这里只做类型声明
}

/** 更新 DTO — 输入 */
export interface Update{Entity}DTO {
  // 部分字段可选
}

/** VO — 输出（返回给前端） */
export interface {Entity}VO {
  id: string
  // ...展示字段
  createdAt: string
  updatedAt: string
}

/** 列表过滤参数 */
export interface {Entity}Filters {
  search?: string
  status?: string
  page?: number
  perPage?: number
}
```

### Step 2: 定义 Zod Schema (schemas/)

```typescript
// src/features/{module}/schemas/{entity}.schema.ts
import { z } from 'zod'

export const create{Entity}Schema = z.object({
  // 字段校验
})

export const update{Entity}Schema = z.object({
  // 部分字段可选
})

export type Create{Entity}Input = z.infer<typeof create{Entity}Schema>
export type Update{Entity}Input = z.infer<typeof update{Entity}Schema>
```

### Step 3: Repository 接口 + 实现 (repositories/)

```typescript
// src/features/{module}/repositories/{entity}.repository.interface.ts
import type { PaginatedResult } from '@twcrm/shared'
import type { {Entity}VO, {Entity}Filters } from '../types/{entity}.types'

export interface I{Entity}Repository {
  findById(id: string): Promise<{Entity}VO | null>
  findMany(tenantId: string, filters: {Entity}Filters): Promise<PaginatedResult<{Entity}VO>>
  create(data: any): Promise<{Entity}VO>
  update(id: string, data: any): Promise<{Entity}VO>
  delete(id: string): Promise<void>
}
```

```typescript
// src/features/{module}/repositories/{entity}.repository.ts
import type { PrismaClient } from '@twcrm/db'
import type { I{Entity}Repository } from './{entity}.repository.interface'
import type { PaginatedResult } from '@twcrm/shared'
import type { {Entity}VO, {Entity}Filters } from '../types/{entity}.types'

export class {Entity}Repository implements I{Entity}Repository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<{Entity}VO | null> {
    const record = await this.prisma.{entity}.findUnique({ where: { id } })
    return record ? this.toVO(record) : null
  }

  async findMany(tenantId: string, filters: {Entity}Filters): Promise<PaginatedResult<{Entity}VO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where = { tenantId, ...this.buildWhere(filters) }

    const [items, total] = await Promise.all([
      this.prisma.{entity}.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.{entity}.count({ where }),
    ])

    return {
      items: items.map(this.toVO),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(data: any): Promise<{Entity}VO> {
    const record = await this.prisma.{entity}.create({ data })
    return this.toVO(record)
  }

  async update(id: string, data: any): Promise<{Entity}VO> {
    const record = await this.prisma.{entity}.update({ where: { id }, data })
    return this.toVO(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.{entity}.delete({ where: { id } })
  }

  private buildWhere(filters: {Entity}Filters) {
    const where: any = {}
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.status) where.status = filters.status
    return where
  }

  private toVO(record: any): {Entity}VO {
    return {
      id: record.id,
      // ...映射字段
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }
  }
}
```

### Step 4: Service 接口 + 实现 (services/)

```typescript
// src/features/{module}/services/{entity}.service.interface.ts
import type { PaginatedResult, ActionResult } from '@twcrm/shared'
import type { {Entity}VO, {Entity}Filters, Create{Entity}DTO, Update{Entity}DTO } from '../types/{entity}.types'

export interface I{Entity}Service {
  getById(id: string): Promise<{Entity}VO | null>
  getList(tenantId: string, filters: {Entity}Filters): Promise<PaginatedResult<{Entity}VO>>
  create(tenantId: string, dto: Create{Entity}DTO): Promise<{Entity}VO>
  update(id: string, dto: Update{Entity}DTO): Promise<{Entity}VO>
  delete(id: string): Promise<void>
}
```

```typescript
// src/features/{module}/services/{entity}.service.ts
import type { I{Entity}Service } from './{entity}.service.interface'
import type { I{Entity}Repository } from '../repositories/{entity}.repository.interface'
import type { IConfigService } from '@/lib/services/config.service.interface'
import type { PaginatedResult } from '@twcrm/shared'
import type { {Entity}VO, {Entity}Filters, Create{Entity}DTO, Update{Entity}DTO } from '../types/{entity}.types'

export class {Entity}Service implements I{Entity}Service {
  constructor(
    private readonly repo: I{Entity}Repository,
    private readonly configService: IConfigService,  // 必须注入
  ) {}

  async getById(id: string): Promise<{Entity}VO | null> {
    return this.repo.findById(id)
  }

  async getList(tenantId: string, filters: {Entity}Filters): Promise<PaginatedResult<{Entity}VO>> {
    return this.repo.findMany(tenantId, filters)
  }

  async create(tenantId: string, dto: Create{Entity}DTO): Promise<{Entity}VO> {
    // 从 ConfigService 读取可配置参数
    // const someConfig = await this.configService.getBoolean('{module}', 'some_key', tenantId)
    return this.repo.create({ ...dto, tenantId })
  }

  async update(id: string, dto: Update{Entity}DTO): Promise<{Entity}VO> {
    return this.repo.update(id, dto)
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
```

### Step 5: 注册 DI 工厂 (src/lib/container.ts)

```typescript
// 在 src/lib/container.ts 中添加
import { {Entity}Repository } from '@/features/{module}/repositories/{entity}.repository'
import { {Entity}Service } from '@/features/{module}/services/{entity}.service'
import type { I{Entity}Service } from '@/features/{module}/services/{entity}.service.interface'

export function create{Entity}Service(): I{Entity}Service {
  const config = getConfigService()
  const repo = new {Entity}Repository(prisma)
  return new {Entity}Service(repo, config)
}
```

### Step 6: Server Action (actions/)

```typescript
// src/features/{module}/actions/{entity}.action.ts
'use server'

import { requirePermission } from '@/lib/rbac'
import { create{Entity}Service } from '@/lib/container'
import { create{Entity}Schema, update{Entity}Schema } from '../schemas/{entity}.schema'
import { ok, fail, type ActionResult } from '@twcrm/shared'
import { AppError } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type { {Entity}VO } from '../types/{entity}.types'

export async function get{Entity}ListAction(filters: unknown): Promise<ActionResult<PaginatedResult<{Entity}VO>>> {
  try {
    const user = await requirePermission('{module}:read:{entity}')
    const service = create{Entity}Service()
    const result = await service.getList(user.tenantId, filters as any)
    return ok(result)
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.code)
    throw error
  }
}

export async function create{Entity}Action(input: unknown): Promise<ActionResult<{Entity}VO>> {
  try {
    const user = await requirePermission('{module}:create:{entity}')
    const dto = create{Entity}Schema.parse(input)
    const service = create{Entity}Service()
    const result = await service.create(user.tenantId, dto)
    revalidatePath('/{module}')
    return ok(result)
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.code)
    throw error
  }
}
```

### Step 7: Hook (hooks/)

```typescript
// src/features/{module}/hooks/use-{entity}.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get{Entity}ListAction, create{Entity}Action } from '../actions/{entity}.action'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function use{Entity}List(filters: any) {
  return useQuery({
    queryKey: ['{entity}', 'list', filters],
    queryFn: () => get{Entity}ListAction(filters),
  })
}

export function useCreate{Entity}() {
  const queryClient = useQueryClient()
  const t = useTranslations('common')

  return useMutation({
    mutationFn: create{Entity}Action,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('save_success'))
        queryClient.invalidateQueries({ queryKey: ['{entity}'] })
      } else {
        toast.error(result.error)
      }
    },
  })
}
```

### Step 8: Component (components/)

```typescript
// src/features/{module}/components/{entity}-list.tsx
'use client'

import { useTranslations } from 'next-intl'
import { use{Entity}List } from '../hooks/use-{entity}'
// 使用 Shadcn UI 组件
// 单个组件不超过 150 行
// 只负责展示，不含业务逻辑
```

## 检查清单

创建新模块后，确认以下事项：
- [ ] 所有 Service/Repository 都有对应的 interface
- [ ] Service 构造函数注入了 ConfigService
- [ ] DI 工厂函数已注册到 container.ts
- [ ] Server Action 校验了 auth + permission + zod
- [ ] Server Action 返回 ActionResult<T>
- [ ] Hook 使用 TanStack Query
- [ ] 组件使用 useTranslations (i18n)
- [ ] 组件不超过 150 行
- [ ] 可配置参数已加入 seed.ts

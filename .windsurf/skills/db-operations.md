---
description: 数据库操作技能。在需要进行数据库查询、创建、更新、删除、迁移等操作时使用此技能。基于 Prisma v6 + PostgreSQL v17 Multi-Schema + Repository 模式 + Zod 验证。
---

# 数据库操作技能

阅读 `skills/db-operations/SKILL.md` 获取完整指南。

## 快速参考

### 数据库连接
```env
DATABASE_URL="postgres://crmall0125:xx123654@192.168.110.246:5433/crmall0125"
```

### Schema 分配
| 子系统 | Schema |
|--------|--------|
| Portal/Auth | `auth` |
| CRM | `nocodb` |
| OKR | `plane` |
| Finance | `midday` |

### 操作流程
```bash
# 1. 修改 schema.prisma
# 2. 生成迁移
npx prisma migrate dev --name <name>
# 3. 更新 Client
npx prisma generate
```

### Repository 模式
```typescript
// src/lib/db/repositories/customer.repository.ts
export class CustomerRepository {
  async findMany(where?) { ... }
  async create(data) { ... }
  async softDelete(id) { ... }
}
```

### 约束
- ✅ Schema First - 先改 prisma，再迁移
- ✅ Repository 封装 - 禁止组件直接用 Prisma
- ✅ Zod 验证 - 所有输入必须验证
- ✅ 软删除 - 禁止物理删除

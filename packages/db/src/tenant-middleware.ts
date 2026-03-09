// ============================================
// 多租户 Prisma Extension (Defense-in-Depth)
// 自动注入 tenantId 过滤条件
// ============================================
//
// 使用 Prisma $extends API（Prisma 7 推荐方式）
// 替代旧版 $use middleware
//
// 用法:
//   const user = await requirePermission('crm:read:customer')
//   const db = withTenant(prisma, user.tenantId, user.isPlatform)
//   // 所有 tenant model 的查询自动带 tenantId 过滤
//

import type { PrismaClient } from '../generated/client'

/**
 * 需要自动注入 tenantId 的模型列表
 * 对应 schema.prisma 中带有 tenantId 字段的业务模型
 */
const TENANT_MODELS: readonly string[] = [
  // CRM
  'Customer', 'Contact', 'Opportunity', 'Contract', 'WorkOrder', 'FollowUp',
  // Ordering
  'CartItem', 'Order',
  // Finance
  'Payment', 'Disbursement', 'Invoice', 'Expense',
  // OKR / Project
  'Project', 'Task', 'TodoItem',
  // System
  'Notification',
]

function isTenantModel(model: string | undefined): boolean {
  if (!model) return false
  return TENANT_MODELS.includes(model)
}

/**
 * 创建租户隔离的 Prisma Client（通过 $extends）
 *
 * 这是一个 defense-in-depth 层。Repository 仍然手动传 tenantId（belt and suspenders），
 * 此 extension 捕获任何遗漏的情况，防止数据跨租户泄漏。
 *
 * @param prisma - PrismaClient 实例
 * @param tenantId - 当前用户的租户 ID
 * @param isPlatform - 是否为总部用户（总部用户可查看所有数据）
 * @returns 带有自动 tenantId 过滤的 PrismaClient
 *
 * @example
 * ```typescript
 * // Server Action 中使用
 * const user = await requirePermission('crm:read:customer')
 * const db = withTenant(prisma, user.tenantId, user.isPlatform)
 * const customers = await db.customer.findMany() // 自动按 tenantId 过滤
 * ```
 */
export function withTenant(
  prisma: PrismaClient,
  tenantId: string,
  isPlatform: boolean = false,
) {
  // 总部（平台）用户可以查看所有租户数据，不注入过滤
  if (isPlatform) return prisma

  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async findFirst({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async findUnique({ args, query }) {
          // findUnique 使用唯一字段定位，无法直接添加 tenantId 到 where
          // 数据安全由 Repository 层的手动 tenantId 检查保障
          return query(args)
        },
        async count({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async create({ model, args, query }) {
          if (isTenantModel(model)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma union types require cast
            args.data = { ...(args.data as Record<string, unknown>), tenantId } as typeof args.data
          }
          return query(args)
        },
        async update({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async updateMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async delete({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
        async deleteMany({ model, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, tenantId }
          }
          return query(args)
        },
      },
    },
  })
}

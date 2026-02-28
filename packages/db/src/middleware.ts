// ============================================
// 多租户 Prisma Middleware
// 自动注入 tenantId 过滤条件
// ============================================

import { PrismaClient } from '../generated/client'

// 需要 tenantId 过滤的模型列表
const TENANT_MODELS = [
  'Customer', 'Contact', 'Opportunity', 'Contract', 'WorkOrder', 'FollowUp',
  'Order', 'CartItem',
  'Warehouse', 'Product', 'PurchaseOrder', 'Supplier',
  'Payment', 'Disbursement', 'Invoice', 'Expense',
  'Objective', 'Project', 'Task', 'TodoItem',
  'Document', 'DocSpace',
  'Notification',
]

// 不需要过滤的操作
const SKIP_ACTIONS = ['createMany', 'create', 'upsert']

export function applyTenantMiddleware(prisma: PrismaClient) {
  prisma.$use(async (params, next) => {
    // 从 AsyncLocalStorage 或 context 获取当前用户信息
    // 这里预留接口，实际实现在 apps/portal 中注入
    const context = (params as any).__tenantContext as {
      tenantId?: string
      isPlatform?: boolean
    } | undefined

    if (!context || context.isPlatform || !context.tenantId) {
      return next(params)
    }

    const model = params.model
    if (!model || !TENANT_MODELS.includes(model)) {
      return next(params)
    }

    const action = params.action
    if (SKIP_ACTIONS.includes(action)) {
      return next(params)
    }

    // 读操作自动注入 tenantId
    if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy'].includes(action)) {
      if (!params.args) params.args = {}
      if (!params.args.where) params.args.where = {}
      params.args.where.tenantId = context.tenantId
    }

    // 更新/删除操作自动注入 tenantId
    if (['update', 'updateMany', 'delete', 'deleteMany'].includes(action)) {
      if (!params.args) params.args = {}
      if (!params.args.where) params.args.where = {}
      params.args.where.tenantId = context.tenantId
    }

    return next(params)
  })
}

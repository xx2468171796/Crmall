// ============================================
// 数据范围过滤 — 将 dataScope 转为 Prisma WHERE 条件
// ============================================

import type { DataScope } from './constants'

/**
 * 数据范围上下文（从 SessionUser 中提取）
 */
export interface DataScopeContext {
  userId: string
  tenantId: string
  departmentId: string | null
}

/**
 * 数据范围过滤条件（合并到 Prisma WHERE 子句）
 */
export interface DataScopeFilter {
  createdBy?: string
  departmentId?: string
  // empty = no additional filter (scope=all)
}

/**
 * 根据数据范围生成过滤条件
 * - all: 租户内所有数据（不加额外 WHERE）
 * - department: 仅本部门数据（WHERE departmentId = ?）
 *   若用户无部门，回退到 own 策略
 * - own: 仅自己创建的数据（WHERE createdBy = ?）
 */
export function buildDataScopeFilter(
  scope: DataScope | string,
  ctx: DataScopeContext,
): DataScopeFilter {
  switch (scope) {
    case 'department':
      return ctx.departmentId ? { departmentId: ctx.departmentId } : { createdBy: ctx.userId }
    case 'own':
      return { createdBy: ctx.userId }
    case 'all':
    default:
      return {}
  }
}

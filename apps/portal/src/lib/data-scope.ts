// ============================================
// 数据范围过滤 — Server 端快捷方法
// 从当前用户 session 构建 Prisma WHERE 过滤条件
// ============================================

import { getDataScope } from '@/lib/rbac'
import { buildDataScopeFilter } from '@twcrm/shared'
import type { SessionUser } from '@twcrm/shared'
import type { DataScopeFilter, DataScopeContext } from '@twcrm/shared'

/**
 * 从当前用户 session 构建数据范围过滤条件
 * 用法: const filter = getDataScopeFilter(user, 'crm:read:customer')
 * 然后在 repository 查询中: where: { ...filter, ...otherConditions }
 */
export function getDataScopeFilter(
  user: SessionUser,
  permission: string,
): DataScopeFilter {
  const scope = getDataScope(user, permission)
  const ctx: DataScopeContext = {
    userId: user.id,
    tenantId: user.tenantId,
    departmentId: user.departmentId,
  }
  return buildDataScopeFilter(scope, ctx)
}

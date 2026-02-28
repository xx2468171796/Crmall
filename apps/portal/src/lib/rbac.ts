// ============================================
// RBAC 快捷方法 — 转发到 DI 容器
// 保持向后兼容，新代码请直接用 container.ts
// ============================================

export {
  requireAuth,
  requirePermission,
  requireAnyPermission,
  requirePlatform,
} from './container'

// 纯函数保留（组件中使用）
import { ROLES } from '@twcrm/shared'
import type { SessionUser } from '@twcrm/shared'

export function hasPermission(user: SessionUser, permission: string): boolean {
  if (user.roles.includes(ROLES.PLATFORM_ADMIN)) return true
  return user.permissions.includes(permission)
}

export function hasRole(user: SessionUser, role: string): boolean {
  return user.roles.includes(role)
}

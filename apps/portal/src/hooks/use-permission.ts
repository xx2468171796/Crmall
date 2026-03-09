'use client'

import { useSession } from 'next-auth/react'
import { ROLES } from '@twcrm/shared'
import type { SessionUser } from '@twcrm/shared'

/**
 * 权限检查 Hook — 客户端使用
 */
export function usePermission() {
  const { data: session } = useSession()
  const user = session?.user as unknown as SessionUser | undefined

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.roles.includes(ROLES.PLATFORM_ADMIN)) return true
    return user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false
    if (user.roles.includes(ROLES.PLATFORM_ADMIN)) return true
    return permissions.some((p) => user.permissions.includes(p))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false
    if (user.roles.includes(ROLES.PLATFORM_ADMIN)) return true
    return permissions.every((p) => user.permissions.includes(p))
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.roles.includes(role)
  }

  const isPlatform = user?.isPlatform ?? false

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isPlatform,
    isAuthenticated: !!user,
  }
}

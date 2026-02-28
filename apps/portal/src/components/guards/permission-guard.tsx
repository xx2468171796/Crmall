'use client'

import { useSession } from 'next-auth/react'
import type { SessionUser } from '@twcrm/shared'
import type { ReactNode } from 'react'

/**
 * 权限守卫组件 — 无权限时不渲染子组件
 */
export function PermissionGuard({
  permission,
  fallback = null,
  children,
}: {
  permission: string | string[]
  fallback?: ReactNode
  children: ReactNode
}) {
  const { data: session } = useSession()
  const user = session?.user as unknown as SessionUser | undefined

  if (!user) return fallback

  const perms = Array.isArray(permission) ? permission : [permission]
  const hasAccess =
    user.roles.includes('platform_admin') ||
    perms.some((p) => user.permissions.includes(p))

  if (!hasAccess) return fallback
  return <>{children}</>
}

/**
 * 角色守卫组件
 */
export function RoleGuard({
  role,
  fallback = null,
  children,
}: {
  role: string | string[]
  fallback?: ReactNode
  children: ReactNode
}) {
  const { data: session } = useSession()
  const user = session?.user as unknown as SessionUser | undefined

  if (!user) return fallback

  const roles = Array.isArray(role) ? role : [role]
  const hasAccess = roles.some((r) => user.roles.includes(r))

  if (!hasAccess) return fallback
  return <>{children}</>
}

/**
 * 总部守卫组件
 */
export function PlatformGuard({
  fallback = null,
  children,
}: {
  fallback?: ReactNode
  children: ReactNode
}) {
  const { data: session } = useSession()
  const user = session?.user as unknown as SessionUser | undefined

  if (!user?.isPlatform) return fallback
  return <>{children}</>
}

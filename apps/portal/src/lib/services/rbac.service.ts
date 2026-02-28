// ============================================
// RbacService — 权限检查服务 (OOP)
// ============================================

import { auth } from '@/lib/auth'
import {
  UnauthorizedError,
  ForbiddenError,
  ROLES,
} from '@twcrm/shared'
import type { SessionUser } from '@twcrm/shared'

export interface IRbacService {
  requireAuth(): Promise<SessionUser>
  requirePermission(permission: string): Promise<SessionUser>
  requireAnyPermission(permissions: string[]): Promise<SessionUser>
  requirePlatform(): Promise<SessionUser>
  requireRole(role: string): Promise<SessionUser>
  hasPermission(user: SessionUser, permission: string): boolean
  hasRole(user: SessionUser, role: string): boolean
}

export class RbacService implements IRbacService {
  async requireAuth(): Promise<SessionUser> {
    const session = await auth()
    if (!session?.user) {
      throw new UnauthorizedError()
    }
    return session.user as unknown as SessionUser
  }

  async requirePermission(permission: string): Promise<SessionUser> {
    const user = await this.requireAuth()
    if (!this.hasPermission(user, permission)) {
      throw new ForbiddenError(`缺少权限: ${permission}`)
    }
    return user
  }

  async requireAnyPermission(permissions: string[]): Promise<SessionUser> {
    const user = await this.requireAuth()
    const has = permissions.some((p) => this.hasPermission(user, p))
    if (!has) {
      throw new ForbiddenError(`缺少权限: ${permissions.join(' | ')}`)
    }
    return user
  }

  async requirePlatform(): Promise<SessionUser> {
    const user = await this.requireAuth()
    if (!user.isPlatform) {
      throw new ForbiddenError('仅总部可访问')
    }
    return user
  }

  async requireRole(role: string): Promise<SessionUser> {
    const user = await this.requireAuth()
    if (!this.hasRole(user, role)) {
      throw new ForbiddenError(`缺少角色: ${role}`)
    }
    return user
  }

  hasPermission(user: SessionUser, permission: string): boolean {
    if (user.roles.includes(ROLES.PLATFORM_ADMIN)) return true
    return user.permissions.includes(permission)
  }

  hasRole(user: SessionUser, role: string): boolean {
    return user.roles.includes(role)
  }
}

'use server'

import { requirePermission } from '@/lib/container'
import { createRbacManagementService } from '@/lib/container'
import {
  createRoleSchema, updateRoleSchema, assignPermissionsSchema, assignUserRolesSchema,
} from '../schemas/rbac.schema'
import { withAction, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type {
  RoleVO, RoleDetailVO, RoleFilters,
  PermissionGroupVO,
  UserRoleVO, UserFilters,
} from '../types/rbac.types'

// ---- 角色管理 ----

export function getRolesAction(
  filters: RoleFilters
): Promise<ActionResult<PaginatedResult<RoleVO>>> {
  return withAction(async () => {
    const user = await requirePermission('platform:read:role')
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    return service.getRoles(filters)
  })
}

export function getRoleDetailAction(
  id: string
): Promise<ActionResult<RoleDetailVO>> {
  return withAction(async () => {
    const user = await requirePermission('platform:read:role')
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    return service.getRoleById(id)
  })
}

export function createRoleAction(
  input: unknown
): Promise<ActionResult<RoleVO>> {
  return withAction(async () => {
    const user = await requirePermission('platform:create:role')
    const dto = createRoleSchema.parse(input)
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    const result = await service.createRole(dto, user.tenantId)
    revalidatePath('/platform/roles')
    return result
  })
}

export function updateRoleAction(
  id: string,
  input: unknown
): Promise<ActionResult<RoleVO>> {
  return withAction(async () => {
    const user = await requirePermission('platform:update:role')
    const dto = updateRoleSchema.parse(input)
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    const result = await service.updateRole(id, dto)
    revalidatePath('/platform/roles')
    return result
  })
}

export function deleteRoleAction(
  id: string
): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('platform:delete:role')
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    await service.deleteRole(id)
    revalidatePath('/platform/roles')
    return null
  })
}

// ---- 权限管理 ----

export function getPermissionsAction(): Promise<ActionResult<PermissionGroupVO[]>> {
  return withAction(async () => {
    const user = await requirePermission('platform:read:permission')
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    return service.getPermissionsByModule()
  })
}

export function assignPermissionsAction(
  input: unknown
): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('platform:update:role')
    const dto = assignPermissionsSchema.parse(input)
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    await service.assignPermissions(dto)
    revalidatePath('/platform/roles')
    return null
  })
}

// ---- 用户角色管理 ----

export function getUsersWithRolesAction(
  filters: UserFilters
): Promise<ActionResult<PaginatedResult<UserRoleVO>>> {
  return withAction(async () => {
    const user = await requirePermission('platform:read:user')
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    return service.getUsersWithRoles(filters)
  })
}

export function assignUserRolesAction(
  input: unknown
): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('platform:update:user')
    const dto = assignUserRolesSchema.parse(input)
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    await service.assignUserRoles(dto, user.roles)
    revalidatePath('/platform/users')
    return null
  })
}

export function removeUserRoleAction(
  userId: string,
  roleId: string
): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('platform:update:user')
    const service = createRbacManagementService(user.tenantId, user.isPlatform)
    await service.removeUserRole(userId, roleId)
    revalidatePath('/platform/users')
    return null
  })
}

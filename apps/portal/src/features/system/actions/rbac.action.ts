'use server'

import { requirePermission } from '@/lib/container'
import { createRbacManagementService } from '@/lib/container'
import {
  createRoleSchema, updateRoleSchema, assignPermissionsSchema, assignUserRolesSchema,
} from '../schemas/rbac.schema'
import { ok, fail, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { AppError } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type {
  RoleVO, RoleDetailVO, RoleFilters,
  PermissionGroupVO,
  UserRoleVO, UserFilters,
} from '../types/rbac.types'

// ---- 角色管理 ----

export async function getRolesAction(
  filters: RoleFilters
): Promise<ActionResult<PaginatedResult<RoleVO>>> {
  try {
    await requirePermission('platform:read:role')
    const service = createRbacManagementService()
    const result = await service.getRoles(filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getRoleDetailAction(
  id: string
): Promise<ActionResult<RoleDetailVO>> {
  try {
    await requirePermission('platform:read:role')
    const service = createRbacManagementService()
    const result = await service.getRoleById(id)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createRoleAction(
  input: unknown
): Promise<ActionResult<RoleVO>> {
  try {
    await requirePermission('platform:create:role')
    const dto = createRoleSchema.parse(input)
    const service = createRbacManagementService()
    const result = await service.createRole(dto)
    revalidatePath('/platform/roles')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function updateRoleAction(
  id: string,
  input: unknown
): Promise<ActionResult<RoleVO>> {
  try {
    await requirePermission('platform:update:role')
    const dto = updateRoleSchema.parse(input)
    const service = createRbacManagementService()
    const result = await service.updateRole(id, dto)
    revalidatePath('/platform/roles')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function deleteRoleAction(
  id: string
): Promise<ActionResult<null>> {
  try {
    await requirePermission('platform:delete:role')
    const service = createRbacManagementService()
    await service.deleteRole(id)
    revalidatePath('/platform/roles')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 权限管理 ----

export async function getPermissionsAction(): Promise<ActionResult<PermissionGroupVO[]>> {
  try {
    await requirePermission('platform:read:permission')
    const service = createRbacManagementService()
    const result = await service.getPermissionsByModule()
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function assignPermissionsAction(
  input: unknown
): Promise<ActionResult<null>> {
  try {
    await requirePermission('platform:update:role')
    const dto = assignPermissionsSchema.parse(input)
    const service = createRbacManagementService()
    await service.assignPermissions(dto)
    revalidatePath('/platform/roles')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 用户角色管理 ----

export async function getUsersWithRolesAction(
  filters: UserFilters
): Promise<ActionResult<PaginatedResult<UserRoleVO>>> {
  try {
    await requirePermission('platform:read:user')
    const service = createRbacManagementService()
    const result = await service.getUsersWithRoles(filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function assignUserRolesAction(
  input: unknown
): Promise<ActionResult<null>> {
  try {
    await requirePermission('platform:update:user')
    const dto = assignUserRolesSchema.parse(input)
    const service = createRbacManagementService()
    await service.assignUserRoles(dto)
    revalidatePath('/platform/users')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function removeUserRoleAction(
  userId: string,
  roleId: string
): Promise<ActionResult<null>> {
  try {
    await requirePermission('platform:update:user')
    const service = createRbacManagementService()
    await service.removeUserRole(userId, roleId)
    revalidatePath('/platform/users')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

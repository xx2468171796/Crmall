import type {
  RoleVO, RoleDetailVO, RoleFilters,
  PermissionVO, PermissionGroupVO,
  UserRoleVO, UserFilters,
  CreateRoleDTO, UpdateRoleDTO,
  AssignPermissionsDTO, AssignUserRolesDTO,
} from '../types/rbac.types'
import type { PaginatedResult } from '@twcrm/shared'

export interface IRbacRepository {
  // Role CRUD
  getRoles(filters: RoleFilters): Promise<PaginatedResult<RoleVO>>
  getRoleById(id: string): Promise<RoleDetailVO | null>
  getRoleByName(name: string, tenantId?: string): Promise<RoleVO | null>
  createRole(dto: CreateRoleDTO, tenantId?: string): Promise<RoleVO>
  updateRole(id: string, dto: UpdateRoleDTO): Promise<RoleVO>
  deleteRole(id: string): Promise<void>

  // Permissions
  getAllPermissions(): Promise<PermissionVO[]>
  getPermissionsByModule(): Promise<PermissionGroupVO[]>
  getPermissionsByIds(ids: string[]): Promise<PermissionVO[]>

  // Role-Permission
  assignPermissions(dto: AssignPermissionsDTO): Promise<void>
  getRolePermissions(roleId: string): Promise<{ permissionId: string; dataScope: string }[]>

  // User-Role
  getUsersWithRoles(filters: UserFilters): Promise<PaginatedResult<UserRoleVO>>
  assignUserRoles(dto: AssignUserRolesDTO): Promise<void>
  removeUserRole(userId: string, roleId: string): Promise<void>
}

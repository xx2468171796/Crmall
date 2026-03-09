import type {
  RoleVO, RoleDetailVO, RoleFilters,
  PermissionGroupVO,
  UserRoleVO, UserFilters,
  CreateRoleDTO, UpdateRoleDTO,
  AssignPermissionsDTO, AssignUserRolesDTO,
} from '../types/rbac.types'
import type { PaginatedResult } from '@twcrm/shared'

export interface IRbacManagementService {
  // Roles
  getRoles(filters: RoleFilters): Promise<PaginatedResult<RoleVO>>
  getRoleById(id: string): Promise<RoleDetailVO>
  createRole(dto: CreateRoleDTO): Promise<RoleVO>
  updateRole(id: string, dto: UpdateRoleDTO): Promise<RoleVO>
  deleteRole(id: string): Promise<void>

  // Permissions
  getPermissionsByModule(): Promise<PermissionGroupVO[]>
  assignPermissions(dto: AssignPermissionsDTO): Promise<void>

  // User-Role
  getUsersWithRoles(filters: UserFilters): Promise<PaginatedResult<UserRoleVO>>
  assignUserRoles(dto: AssignUserRolesDTO): Promise<void>
  removeUserRole(userId: string, roleId: string): Promise<void>
}

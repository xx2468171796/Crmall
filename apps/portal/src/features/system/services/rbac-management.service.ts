// ============================================
// RBAC 管理 — Service 实现
// ============================================

import type { IConfigService, PaginatedResult } from '@twcrm/shared'
import { NotFoundError, DuplicateError, BusinessRuleError, ForbiddenError } from '@twcrm/shared'
import type { IRbacManagementService } from './rbac-management.service.interface'
import type { IRbacRepository } from '../repositories/rbac.repository.interface'
import type {
  RoleVO, RoleDetailVO, RoleFilters,
  PermissionGroupVO,
  UserRoleVO, UserFilters,
  CreateRoleDTO, UpdateRoleDTO,
  AssignPermissionsDTO, AssignUserRolesDTO,
} from '../types/rbac.types'

export class RbacManagementService implements IRbacManagementService {
  constructor(
    private readonly rbacRepo: IRbacRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getRoles(filters: RoleFilters): Promise<PaginatedResult<RoleVO>> {
    return this.rbacRepo.getRoles(filters)
  }

  async getRoleById(id: string): Promise<RoleDetailVO> {
    const role = await this.rbacRepo.getRoleById(id)
    if (!role) throw new NotFoundError('角色', id)
    return role
  }

  async createRole(dto: CreateRoleDTO, tenantId?: string): Promise<RoleVO> {
    const existing = await this.rbacRepo.getRoleByName(dto.name, tenantId)
    if (existing) throw new DuplicateError('角色', 'name')
    return this.rbacRepo.createRole(dto, tenantId)
  }

  async updateRole(id: string, dto: UpdateRoleDTO): Promise<RoleVO> {
    const role = await this.rbacRepo.getRoleById(id)
    if (!role) throw new NotFoundError('角色', id)
    if (role.isSystem) throw new BusinessRuleError('系统内置角色不可修改')
    return this.rbacRepo.updateRole(id, dto)
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.rbacRepo.getRoleById(id)
    if (!role) throw new NotFoundError('角色', id)
    if (role.isSystem) throw new BusinessRuleError('系统内置角色不可删除')
    if (role.userCount > 0) throw new BusinessRuleError('该角色下还有用户，请先移除用户')
    await this.rbacRepo.deleteRole(id)
  }

  async getPermissionsByModule(): Promise<PermissionGroupVO[]> {
    return this.rbacRepo.getPermissionsByModule()
  }

  async assignPermissions(dto: AssignPermissionsDTO): Promise<void> {
    const role = await this.rbacRepo.getRoleById(dto.roleId)
    if (!role) throw new NotFoundError('角色', dto.roleId)
    if (role.isSystem) throw new BusinessRuleError('系统内置角色权限不可修改')
    await this.rbacRepo.assignPermissions(dto)
  }

  async getUsersWithRoles(filters: UserFilters): Promise<PaginatedResult<UserRoleVO>> {
    return this.rbacRepo.getUsersWithRoles(filters)
  }

  async assignUserRoles(dto: AssignUserRolesDTO, assignerRoles: string[]): Promise<void> {
    // Determine the assigner's minimum role level (lower level = higher privilege)
    const assignerLevels = await Promise.all(
      assignerRoles.map(async (name) => {
        const role = await this.rbacRepo.getRoleByName(name)
        return role?.level ?? 999
      })
    )
    const assignerMinLevel = assignerLevels.length > 0 ? Math.min(...assignerLevels) : 999

    // Platform admin (level 0) can assign anything; skip checks
    if (assignerMinLevel > 0) {
      for (const roleId of dto.roleIds) {
        const role = await this.rbacRepo.getRoleById(roleId)
        if (!role) throw new NotFoundError('角色', roleId)
        if (role.level <= assignerMinLevel) {
          throw new ForbiddenError('Cannot assign roles at or above your own privilege level')
        }
      }
    }

    await this.rbacRepo.assignUserRoles(dto)
  }

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    await this.rbacRepo.removeUserRole(userId, roleId)
  }
}

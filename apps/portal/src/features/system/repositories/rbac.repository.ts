// ============================================
// RBAC 模块 — Repository 实现
// ============================================

import type { PrismaClient } from '@twcrm/db'

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
import { clampPagination } from '@twcrm/shared'
import type { PaginatedResult } from '@twcrm/shared'
import type { IRbacRepository } from './rbac.repository.interface'
import type {
  RoleVO, RoleDetailVO, RoleFilters,
  PermissionVO, PermissionGroupVO,
  UserRoleVO, UserFilters,
  CreateRoleDTO, UpdateRoleDTO,
  AssignPermissionsDTO, AssignUserRolesDTO,
} from '../types/rbac.types'

// ---- Row types for Prisma query results ----

interface RoleRow {
  id: string
  tenantId: string | null
  name: string
  displayName: string
  description: string | null
  level: number
  isSystem: boolean
  createdAt: Date
  _count: { permissions: number; users: number }
}

interface RoleDetailRow extends Omit<RoleRow, '_count'> {
  permissions: Array<{
    id: string
    permissionId: string
    dataScope: string
    permission: {
      module: string
      action: string
      resource: string
      description: string | null
    }
  }>
  _count: { users: number }
}

interface UserRow {
  id: string
  name: string
  email: string
  tenant: { name: string }
  roles: Array<{
    role: { id: string; name: string; displayName: string }
  }>
}

const PERMISSION_MODULE_LABELS: Record<string, string> = {
  crm: 'CRM 客户管理',
  ordering: '订货管理',
  inventory: '库存管理',
  finance: '财务管理',
  okr: 'OKR 目标管理',
  docs: '文档管理',
  lms: '培训管理',
  system: '系统管理',
  platform: '平台管理',
}

function toRoleVO(r: RoleRow): RoleVO {
  return {
    id: r.id,
    tenantId: r.tenantId,
    name: r.name,
    displayName: r.displayName,
    description: r.description,
    level: r.level,
    isSystem: r.isSystem,
    permissionCount: r._count.permissions,
    userCount: r._count.users,
    createdAt: r.createdAt.toISOString(),
  }
}

function toPermissionVO(p: { id: string; module: string; action: string; resource: string; description: string | null }): PermissionVO {
  return {
    id: p.id,
    module: p.module,
    action: p.action,
    resource: p.resource,
    description: p.description,
    code: `${p.module}:${p.action}:${p.resource}`,
  }
}

export class RbacRepository implements IRbacRepository {
  constructor(private readonly db: PrismaClient) {}

  async getRoles(filters: RoleFilters): Promise<PaginatedResult<RoleVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = {}
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { displayName: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.isSystem !== undefined) where.isSystem = filters.isSystem

    const [items, total] = await Promise.all([
      this.db.role.findMany({
        where,
        include: {
          _count: { select: { permissions: true, users: true } },
        },
        orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.db.role.count({ where }),
    ])

    return {
      items: (items as unknown as RoleRow[]).map(toRoleVO),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async getRoleById(id: string): Promise<RoleDetailVO | null> {
    const role = await this.db.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    })
    if (!role) return null
    const r = role as unknown as RoleDetailRow
    return {
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      level: r.level,
      isSystem: r.isSystem,
      permissionCount: r.permissions.length,
      userCount: r._count.users,
      createdAt: r.createdAt.toISOString(),
      permissions: r.permissions.map((rp) => ({
        id: rp.id,
        permissionId: rp.permissionId,
        module: rp.permission.module,
        action: rp.permission.action,
        resource: rp.permission.resource,
        description: rp.permission.description,
        dataScope: rp.dataScope,
      })),
    }
  }

  async getRoleByName(name: string, tenantId?: string): Promise<RoleVO | null> {
    const role = await this.db.role.findFirst({
      where: { name, tenantId: tenantId ?? null },
      include: { _count: { select: { permissions: true, users: true } } },
    })
    if (!role) return null
    return toRoleVO(role as unknown as RoleRow)
  }

  async createRole(dto: CreateRoleDTO, tenantId?: string): Promise<RoleVO> {
    const role = await this.db.role.create({
      data: {
        tenantId: tenantId ?? null,
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        level: dto.level ?? 50,
        isSystem: false,
        permissions: dto.permissions?.length ? {
          create: dto.permissions.map((p) => ({
            permissionId: p.permissionId,
            dataScope: p.dataScope ?? 'all',
          })),
        } : undefined,
      },
      include: { _count: { select: { permissions: true, users: true } } },
    })
    return toRoleVO(role as unknown as RoleRow)
  }

  async updateRole(id: string, dto: UpdateRoleDTO): Promise<RoleVO> {
    const role = await this.db.role.update({
      where: { id },
      data: {
        displayName: dto.displayName,
        description: dto.description,
        level: dto.level,
      },
      include: { _count: { select: { permissions: true, users: true } } },
    })
    return toRoleVO(role as unknown as RoleRow)
  }

  async deleteRole(id: string): Promise<void> {
    await this.db.role.delete({ where: { id } })
  }

  async getAllPermissions(): Promise<PermissionVO[]> {
    const perms = await this.db.permission.findMany({
      orderBy: [{ module: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
    })
    return perms.map(toPermissionVO)
  }

  async getPermissionsByModule(): Promise<PermissionGroupVO[]> {
    const perms = await this.getAllPermissions()
    const grouped = new Map<string, PermissionVO[]>()
    for (const p of perms) {
      const arr = grouped.get(p.module) ?? []
      arr.push(p)
      grouped.set(p.module, arr)
    }
    return Array.from(grouped.entries()).map(([module, permissions]) => ({
      module,
      label: PERMISSION_MODULE_LABELS[module] ?? module,
      permissions,
    }))
  }

  async getPermissionsByIds(ids: string[]): Promise<PermissionVO[]> {
    const perms = await this.db.permission.findMany({ where: { id: { in: ids } } })
    return perms.map(toPermissionVO)
  }

  async assignPermissions(dto: AssignPermissionsDTO): Promise<void> {
    await this.db.$transaction(async (tx: TransactionClient) => {
      await tx.rolePermission.deleteMany({ where: { roleId: dto.roleId } })
      if (dto.permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: dto.permissions.map((p) => ({
            roleId: dto.roleId,
            permissionId: p.permissionId,
            dataScope: p.dataScope,
          })),
        })
      }
    })
  }

  async getRolePermissions(roleId: string): Promise<{ permissionId: string; dataScope: string }[]> {
    const rps = await this.db.rolePermission.findMany({
      where: { roleId },
      select: { permissionId: true, dataScope: true },
    })
    return rps
  }

  async getUsersWithRoles(filters: UserFilters): Promise<PaginatedResult<UserRoleVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = {}
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.tenantId) where.tenantId = filters.tenantId
    if (filters.status) where.status = filters.status
    if (filters.roleId) {
      where.roles = { some: { roleId: filters.roleId } }
    }

    const [items, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: {
          tenant: { select: { name: true } },
          roles: { include: { role: { select: { id: true, name: true, displayName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.db.user.count({ where }),
    ])

    return {
      items: (items as unknown as UserRow[]).map((u) => ({
        userId: u.id,
        userName: u.name,
        email: u.email,
        tenantName: u.tenant.name,
        roles: u.roles.map((r) => ({
          id: r.role.id,
          name: r.role.name,
          displayName: r.role.displayName,
        })),
      })),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async assignUserRoles(dto: AssignUserRolesDTO): Promise<void> {
    await this.db.$transaction(async (tx: TransactionClient) => {
      await tx.userRole.deleteMany({ where: { userId: dto.userId } })
      await tx.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({
          userId: dto.userId,
          roleId,
        })),
      })
    })
  }

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    await this.db.userRole.deleteMany({
      where: { userId, roleId },
    })
  }
}

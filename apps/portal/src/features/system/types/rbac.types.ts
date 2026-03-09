// ============================================
// RBAC 模块 — 类型定义（角色/权限/用户管理）
// ============================================

// ---- 角色 ----

export interface RoleVO {
  id: string
  name: string
  displayName: string
  description: string | null
  level: number
  isSystem: boolean
  permissionCount: number
  userCount: number
  createdAt: string
}

export interface RoleDetailVO extends RoleVO {
  permissions: RolePermissionVO[]
}

export interface RolePermissionVO {
  id: string
  permissionId: string
  module: string
  action: string
  resource: string
  description: string | null
}

export interface CreateRoleDTO {
  name: string
  displayName: string
  description?: string
  level?: number
  permissions?: { permissionId: string }[]
}

export interface UpdateRoleDTO {
  displayName?: string
  description?: string
  level?: number
}

export interface AssignPermissionsDTO {
  roleId: string
  permissions: { permissionId: string }[]
}

export interface RoleFilters {
  search?: string
  isSystem?: boolean
  page?: number
  perPage?: number
}

// ---- 权限 ----

export interface PermissionVO {
  id: string
  module: string
  action: string
  resource: string
  description: string | null
  code: string  // 组合码: module:action:resource
}

export interface PermissionGroupVO {
  module: string
  label: string
  permissions: PermissionVO[]
}

// ---- 用户角色 ----

export interface UserRoleVO {
  userId: string
  userName: string
  email: string
  tenantName: string
  roles: { id: string; name: string; displayName: string }[]
}

export interface AssignUserRolesDTO {
  userId: string
  roleIds: string[]
}

export interface UserFilters {
  search?: string
  tenantId?: string
  roleId?: string
  status?: string
  page?: number
  perPage?: number
}

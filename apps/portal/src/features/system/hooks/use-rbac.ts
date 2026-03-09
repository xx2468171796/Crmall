'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRolesAction, getRoleDetailAction, createRoleAction,
  updateRoleAction, deleteRoleAction,
  getPermissionsAction, assignPermissionsAction,
  getUsersWithRolesAction, assignUserRolesAction, removeUserRoleAction,
} from '../actions/rbac.action'
import type { RoleFilters, UserFilters } from '../types/rbac.types'

// ---- 角色查询 ----

export function useRoles(filters: RoleFilters = {}) {
  return useQuery({
    queryKey: ['roles', filters],
    queryFn: async () => {
      const result = await getRolesAction(filters)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useRoleDetail(id: string | null) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: async () => {
      if (!id) return null
      const result = await getRoleDetailAction(id)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: !!id,
  })
}

// ---- 角色操作 ----

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const result = await createRoleAction(input)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const result = await updateRoleAction(id, data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteRoleAction(id)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

// ---- 权限查询 ----

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const result = await getPermissionsAction()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 权限列表不常变，5分钟缓存
  })
}

export function useAssignPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const result = await assignPermissionsAction(input)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['role'] })
    },
  })
}

// ---- 用户角色 ----

export function useUsersWithRoles(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users-roles', filters],
    queryFn: async () => {
      const result = await getUsersWithRolesAction(filters)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useAssignUserRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const result = await assignUserRolesAction(input)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users-roles'] }),
  })
}

export function useRemoveUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const result = await removeUserRoleAction(userId, roleId)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users-roles'] }),
  })
}

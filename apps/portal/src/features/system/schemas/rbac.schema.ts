import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-z][a-z0-9_]*$/, '角色名只允许小写字母、数字和下划线'),
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  level: z.number().int().min(0).max(100).optional().default(50),
  permissions: z.array(z.object({
    permissionId: z.string().min(1),
  })).optional().default([]),
})

export const updateRoleSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  level: z.number().int().min(0).max(100).optional(),
})

export const assignPermissionsSchema = z.object({
  roleId: z.string().min(1),
  permissions: z.array(z.object({
    permissionId: z.string().min(1),
  })),
})

export const assignUserRolesSchema = z.object({
  userId: z.string().min(1),
  roleIds: z.array(z.string().min(1)).min(1),
})

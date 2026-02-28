import { z } from 'zod'

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  type: z.enum(['info', 'warning', 'urgent', 'maintenance']).optional().default('info'),
  priority: z.number().int().min(0).max(2).optional().default(0),
  isTop: z.boolean().optional().default(false),
  targetType: z.enum(['all', 'tenant', 'role', 'user']).optional().default('all'),
  targetIds: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
})

export const updateConfigSchema = z.object({
  group: z.string().min(1),
  key: z.string().min(1),
  value: z.string(),
  tenantId: z.string().optional(),
  label: z.string().optional(),
})

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>

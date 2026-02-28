// ============================================
// CRM 模块 — Zod 校验 Schema
// ============================================

import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['company', 'individual']).optional().default('company'),
  industry: z.string().max(50).optional(),
  source: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(200).optional(),
  city: z.string().max(50).optional(),
  region: z.string().max(50).optional(),
  level: z.string().optional().default('normal'),
  ownerId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  remark: z.string().max(1000).optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export const createOpportunitySchema = z.object({
  customerId: z.string().min(1),
  title: z.string().min(1).max(200),
  amount: z.number().min(0),
  currency: z.string().optional().default('TWD'),
  stage: z.string().optional().default('lead'),
  probability: z.number().min(0).max(100).optional().default(10),
  expectedDate: z.string().optional(),
  source: z.string().optional(),
  ownerId: z.string().min(1),
  tags: z.array(z.string()).optional(),
  remark: z.string().max(1000).optional(),
})

export const updateOpportunitySchema = createOpportunitySchema.partial()

export const createFollowUpSchema = z.object({
  customerId: z.string().optional(),
  opportunityId: z.string().optional(),
  type: z.string().min(1),
  content: z.string().min(1).max(2000),
  nextDate: z.string().optional(),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>

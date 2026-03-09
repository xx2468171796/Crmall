// ============================================
// 财务模块 — Zod 校验 Schema
// ============================================

import { z } from 'zod'

export const createPaymentSchema = z.object({
  contractId: z.string().min(1).optional(),
  orderId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  amount: z.number().positive(),
  currency: z.string().min(1).default('TWD'),
  paidAt: z.string().min(1),
  method: z.enum(['cash', 'transfer', 'check', 'credit_card', 'online', 'balance']),
  bankRef: z.string().max(100).optional(),
  note: z.string().max(1000).optional(),
})

export const createDisbursementSchema = z.object({
  supplierId: z.string().min(1),
  purchaseId: z.string().min(1).optional(),
  amount: z.number().positive(),
  currency: z.string().min(1).default('TWD'),
  method: z.enum(['transfer', 'check', 'cash']),
  bankRef: z.string().max(100).optional(),
  note: z.string().max(1000).optional(),
})

export const createInvoiceSchema = z.object({
  type: z.enum(['issued', 'received']),
  counterpart: z.string().min(1).max(200),
  amount: z.number().positive(),
  taxRate: z.number().min(0).max(1).optional(),
  orderId: z.string().min(1).optional(),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1).optional(),
  refType: z.enum(['contract', 'purchase', 'order']).optional(),
  refId: z.string().min(1).optional(),
  note: z.string().max(1000).optional(),
})

export const createExpenseSchema = z.object({
  category: z.enum(['travel', 'office', 'entertainment', 'transport', 'other']),
  amount: z.number().positive(),
  currency: z.string().min(1).default('TWD'),
  description: z.string().min(1).max(1000),
  receiptUrl: z.string().url().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type CreateDisbursementInput = z.infer<typeof createDisbursementSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

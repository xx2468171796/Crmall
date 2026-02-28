// ============================================
// B2B 订货模块 — Zod 校验 Schema
// ============================================

import { z } from 'zod'

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  remark: z.string().max(500).optional(),
})

export const updateCartSchema = z.object({
  quantity: z.number().int().min(1),
  remark: z.string().max(500).optional(),
})

export const createOrderSchema = z.object({
  paymentMethod: z.string().optional(),
  remark: z.string().max(1000).optional(),
})

export const shipOrderSchema = z.object({
  carrier: z.string().min(1),
  trackingNo: z.string().min(1),
  remark: z.string().max(500).optional(),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartInput = z.infer<typeof updateCartSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type ShipOrderInput = z.infer<typeof shipOrderSchema>

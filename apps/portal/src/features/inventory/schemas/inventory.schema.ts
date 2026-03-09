// ============================================
// 进销存模块 — Zod 校验 Schema
// ============================================

import { z } from 'zod'

// ---- 仓库 ----

export const createWarehouseSchema = z.object({
  name: z.string().min(1, '仓库名称不能为空').max(100),
  code: z.string().min(1, '仓库编码不能为空').max(50),
  address: z.string().max(500).optional(),
  contact: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  isMain: z.boolean().optional(),
})

export const updateWarehouseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().max(500).optional(),
  contact: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  isMain: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// ---- SN 码 ----

export const createSnCodeSchema = z.object({
  sn: z.string().min(1, 'SN 码不能为空').max(100),
  variantId: z.string().min(1),
  warehouseId: z.string().optional(),
  status: z.string().optional(),
})

export const updateSnCodeSchema = z.object({
  warehouseId: z.string().optional(),
  status: z.enum(['in_stock', 'allocated', 'shipped', 'installed', 'returned', 'scrapped']).optional(),
  customerId: z.string().optional(),
  workOrderId: z.string().optional(),
  installedAt: z.string().datetime().optional(),
  warrantyEnd: z.string().datetime().optional(),
})

// ---- 供应商 ----

export const createSupplierSchema = z.object({
  name: z.string().min(1, '供应商名称不能为空').max(200),
  contact: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  bankInfo: z.record(z.string(), z.unknown()).optional(),
})

export const updateSupplierSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contact: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  bankInfo: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// ---- 采购单 ----

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1),
  warehouseId: z.string().min(1),
  currency: z.string().optional(),
  expectedDate: z.string().datetime().optional(),
  remark: z.string().max(1000).optional(),
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().min(1, '数量必须大于 0'),
    unitPrice: z.number().min(0, '单价不能为负'),
  })).min(1, '采购明细不能为空'),
})

export const receivePurchaseSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().min(1),
    receivedQty: z.number().int().min(1, '收货数量必须大于 0'),
  })).min(1, '收货明细不能为空'),
})

// ---- 调拨单 ----

export const createTransferOrderSchema = z.object({
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  remark: z.string().max(1000).optional(),
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().min(1, '数量必须大于 0'),
  })).min(1, '调拨明细不能为空'),
})

export const receiveTransferSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().min(1),
    receivedQty: z.number().int().min(1, '收货数量必须大于 0'),
  })).min(1, '收货明细不能为空'),
})

// ---- 库存调整 ----

export const stockAdjustSchema = z.object({
  variantId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.number().int(), // 正数增加，负数减少
  remark: z.string().max(500).optional(),
})

// ---- 导出 infer 类型 ----

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>
export type CreateSnCodeInput = z.infer<typeof createSnCodeSchema>
export type UpdateSnCodeInput = z.infer<typeof updateSnCodeSchema>
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>
export type ReceivePurchaseInput = z.infer<typeof receivePurchaseSchema>
export type CreateTransferOrderInput = z.infer<typeof createTransferOrderSchema>
export type ReceiveTransferInput = z.infer<typeof receiveTransferSchema>
export type StockAdjustInput = z.infer<typeof stockAdjustSchema>

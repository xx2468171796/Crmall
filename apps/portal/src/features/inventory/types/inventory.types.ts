// ============================================
// 进销存模块 — 类型定义
// ============================================

// ---- 仓库 ----

export interface WarehouseVO {
  id: string
  tenantId: string | null
  name: string
  code: string
  address: string | null
  contact: string | null
  phone: string | null
  isMain: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export interface CreateWarehouseDTO {
  name: string
  code: string
  address?: string
  contact?: string
  phone?: string
  isMain?: boolean
}

export interface UpdateWarehouseDTO {
  name?: string
  address?: string
  contact?: string
  phone?: string
  isMain?: boolean
  status?: string
}

// ---- 库存 ----

export interface StockVO {
  id: string
  variantId: string
  variantSku: string
  variantName: string | null
  productName: string
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  quantity: number
  lockedQty: number
  availableQty: number
  updatedAt: string
}

export interface StockFilters {
  warehouseId?: string
  variantId?: string
  search?: string
  lowStock?: boolean
  page?: number
  perPage?: number
  createdBy?: string
  departmentId?: string
}

export interface StockAdjustDTO {
  variantId: string
  warehouseId: string
  quantity: number
  remark?: string
}

// ---- SN 码 ----

export interface SnCodeVO {
  id: string
  sn: string
  variantId: string
  variantSku: string
  variantName: string | null
  productName: string
  warehouseId: string | null
  warehouseName: string | null
  status: string
  customerId: string | null
  workOrderId: string | null
  installedAt: string | null
  warrantyEnd: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSnCodeDTO {
  sn: string
  variantId: string
  warehouseId?: string
  status?: string
}

export interface UpdateSnCodeDTO {
  warehouseId?: string
  status?: string
  customerId?: string
  workOrderId?: string
  installedAt?: string
  warrantyEnd?: string
}

export interface SnFilters {
  variantId?: string
  warehouseId?: string
  status?: string
  search?: string
  page?: number
  perPage?: number
}

// ---- 供应商 ----

export interface SupplierVO {
  id: string
  tenantId: string | null
  name: string
  contact: string | null
  phone: string | null
  email: string | null
  address: string | null
  bankInfo: Record<string, unknown> | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierDTO {
  name: string
  contact?: string
  phone?: string
  email?: string
  address?: string
  bankInfo?: Record<string, unknown>
}

export interface UpdateSupplierDTO {
  name?: string
  contact?: string
  phone?: string
  email?: string
  address?: string
  bankInfo?: Record<string, unknown>
  status?: string
}

// ---- 采购单 ----

export interface PurchaseOrderItemVO {
  id: string
  purchaseOrderId: string
  variantId: string
  variantSku: string
  variantName: string | null
  productName: string
  quantity: number
  unitPrice: number
  receivedQty: number
  subtotal: number
}

export interface PurchaseOrderVO {
  id: string
  tenantId: string | null
  poNo: string
  supplierId: string
  supplierName: string
  warehouseId: string
  totalAmount: number
  currency: string
  status: string
  expectedDate: string | null
  remark: string | null
  createdBy: string
  approvedBy: string | null
  createdAt: string
  updatedAt: string
  items: PurchaseOrderItemVO[]
}

export interface CreatePurchaseOrderDTO {
  supplierId: string
  warehouseId: string
  currency?: string
  expectedDate?: string
  remark?: string
  items: Array<{
    variantId: string
    quantity: number
    unitPrice: number
  }>
}

export interface PurchaseOrderFilters {
  search?: string
  status?: string
  supplierId?: string
  page?: number
  perPage?: number
  createdBy?: string
  departmentId?: string
}

export interface ReceivePurchaseItemDTO {
  itemId: string
  receivedQty: number
}

// ---- 调拨单 ----

export interface TransferOrderItemVO {
  id: string
  transferOrderId: string
  variantId: string
  variantSku: string
  variantName: string | null
  productName: string
  quantity: number
  receivedQty: number
}

export interface TransferOrderVO {
  id: string
  transferNo: string
  fromWarehouseId: string
  fromWarehouseName: string
  toWarehouseId: string
  toWarehouseName: string
  status: string
  requestedBy: string
  approvedBy: string | null
  remark: string | null
  createdAt: string
  updatedAt: string
  items: TransferOrderItemVO[]
}

export interface CreateTransferOrderDTO {
  fromWarehouseId: string
  toWarehouseId: string
  remark?: string
  items: Array<{
    variantId: string
    quantity: number
  }>
}

export interface TransferOrderFilters {
  search?: string
  status?: string
  fromWarehouseId?: string
  toWarehouseId?: string
  page?: number
  perPage?: number
  createdBy?: string
  departmentId?: string
}

export interface ReceiveTransferItemDTO {
  itemId: string
  receivedQty: number
}

// ---- 库存变动 ----

export interface StockMovementVO {
  id: string
  variantId: string
  variantSku: string
  variantName: string | null
  productName: string
  warehouseId: string
  warehouseName: string
  type: string
  quantity: number
  refType: string | null
  refId: string | null
  snCodeId: string | null
  remark: string | null
  createdBy: string
  createdAt: string
}

export interface StockMovementFilters {
  variantId?: string
  warehouseId?: string
  type?: string
  refType?: string
  page?: number
  perPage?: number
  createdBy?: string
  departmentId?: string
}

export interface SupplierFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
  createdBy?: string
  departmentId?: string
}

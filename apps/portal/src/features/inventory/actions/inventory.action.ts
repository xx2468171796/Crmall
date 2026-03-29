'use server'

import { requirePermission } from '@/lib/container'
import {
  createWarehouseService, createStockService, createSnCodeService,
  createSupplierService, createPurchaseOrderService,
  createTransferOrderService, createStockMovementService,
} from '@/lib/container'
import {
  createWarehouseSchema, updateWarehouseSchema,
  createSnCodeSchema, updateSnCodeSchema,
  createSupplierSchema, updateSupplierSchema,
  createPurchaseOrderSchema, receivePurchaseSchema,
  createTransferOrderSchema, receiveTransferSchema,
  stockAdjustSchema,
} from '../schemas/inventory.schema'
import { withAction, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { getDataScopeFilter } from '@/lib/data-scope'
import { revalidatePath } from 'next/cache'
import type {
  WarehouseVO,
  StockVO, StockFilters,
  SnCodeVO, SnFilters,
  SupplierVO, SupplierFilters,
  PurchaseOrderVO, PurchaseOrderFilters,
  TransferOrderVO, TransferOrderFilters,
  StockMovementVO, StockMovementFilters,
} from '../types/inventory.types'

// ---- 仓库 ----

export function getWarehousesAction(): Promise<ActionResult<WarehouseVO[]>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:warehouse')
    const service = createWarehouseService(user.tenantId, user.isPlatform)
    return service.getWarehouses(user.isPlatform ? null : user.tenantId)
  })
}

export function getWarehouseByIdAction(id: string): Promise<ActionResult<WarehouseVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:warehouse')
    const service = createWarehouseService(user.tenantId, user.isPlatform)
    return service.getWarehouseById(id)
  })
}

export function createWarehouseAction(input: unknown): Promise<ActionResult<WarehouseVO>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:create:warehouse')
    const dto = createWarehouseSchema.parse(input)
    const service = createWarehouseService(user.tenantId, user.isPlatform)
    const result = await service.createWarehouse(user.isPlatform ? null : user.tenantId, dto)
    revalidatePath('/inventory/warehouses')
    return result
  })
}

export function updateWarehouseAction(id: string, input: unknown): Promise<ActionResult<WarehouseVO>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:update:warehouse')
    const dto = updateWarehouseSchema.parse(input)
    const service = createWarehouseService(user.tenantId, user.isPlatform)
    const result = await service.updateWarehouse(id, dto)
    revalidatePath('/inventory/warehouses')
    return result
  })
}

export function deleteWarehouseAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:delete:warehouse')
    const service = createWarehouseService(user.tenantId, user.isPlatform)
    await service.deleteWarehouse(id)
    revalidatePath('/inventory/warehouses')
    return null
  })
}

// ---- 库存 ----

export function getStockAction(filters: StockFilters): Promise<ActionResult<PaginatedResult<StockVO>>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:stock')
    const scopeFilter = getDataScopeFilter(user, 'inventory:read:stock')
    const service = createStockService(user.tenantId, user.isPlatform)
    return service.getAllStock({ ...filters, ...scopeFilter })
  })
}

export function getStockByWarehouseAction(
  warehouseId: string,
  filters: StockFilters
): Promise<ActionResult<PaginatedResult<StockVO>>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:stock')
    const service = createStockService(user.tenantId, user.isPlatform)
    return service.getStockByWarehouse(warehouseId, filters)
  })
}

export function getStockByVariantAction(variantId: string): Promise<ActionResult<StockVO[]>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:stock')
    const service = createStockService(user.tenantId, user.isPlatform)
    return service.getStockByVariant(variantId)
  })
}

export function adjustStockAction(input: unknown): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:update:stock')
    const dto = stockAdjustSchema.parse(input)
    const service = createStockService(user.tenantId, user.isPlatform)
    await service.adjustStock(dto, user.id)
    revalidatePath('/inventory/stock')
    return null
  })
}

// ---- SN 码 ----

export function getSnCodesAction(filters: SnFilters): Promise<ActionResult<PaginatedResult<SnCodeVO>>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:sn')
    const service = createSnCodeService(user.tenantId, user.isPlatform)
    return service.getSnCodes(filters)
  })
}

export function getSnCodeByIdAction(id: string): Promise<ActionResult<SnCodeVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:sn')
    const service = createSnCodeService(user.tenantId, user.isPlatform)
    return service.getSnCodeById(id)
  })
}

export function getSnCodeBySnAction(sn: string): Promise<ActionResult<SnCodeVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:sn')
    const service = createSnCodeService(user.tenantId, user.isPlatform)
    return service.getSnCodeBySn(sn)
  })
}

export function createSnCodeAction(input: unknown): Promise<ActionResult<SnCodeVO>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:create:sn')
    const dto = createSnCodeSchema.parse(input)
    const service = createSnCodeService(user.tenantId, user.isPlatform)
    const result = await service.createSnCode(dto)
    revalidatePath('/inventory/sn-codes')
    return result
  })
}

export function updateSnCodeAction(id: string, input: unknown): Promise<ActionResult<SnCodeVO>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:update:sn')
    const dto = updateSnCodeSchema.parse(input)
    const service = createSnCodeService(user.tenantId, user.isPlatform)
    const result = await service.updateSnCode(id, dto)
    revalidatePath('/inventory/sn-codes')
    return result
  })
}

export function deleteSnCodeAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:delete:sn')
    const service = createSnCodeService(user.tenantId, user.isPlatform)
    await service.deleteSnCode(id)
    revalidatePath('/inventory/sn-codes')
    return null
  })
}

// ---- 供应商 ----

export function getSuppliersAction(
  filters: SupplierFilters
): Promise<ActionResult<PaginatedResult<SupplierVO>>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:supplier')
    const scopeFilter = getDataScopeFilter(user, 'inventory:read:supplier')
    const service = createSupplierService(user.tenantId, user.isPlatform)
    return service.getSuppliers(user.isPlatform ? null : user.tenantId, { ...filters, ...scopeFilter })
  })
}

export function getSupplierByIdAction(id: string): Promise<ActionResult<SupplierVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:supplier')
    const service = createSupplierService(user.tenantId, user.isPlatform)
    return service.getSupplierById(id)
  })
}

export function createSupplierAction(input: unknown): Promise<ActionResult<SupplierVO>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:create:supplier')
    const dto = createSupplierSchema.parse(input)
    const service = createSupplierService(user.tenantId, user.isPlatform)
    const result = await service.createSupplier(user.isPlatform ? null : user.tenantId, dto)
    revalidatePath('/inventory/suppliers')
    return result
  })
}

export function updateSupplierAction(id: string, input: unknown): Promise<ActionResult<SupplierVO>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:update:supplier')
    const dto = updateSupplierSchema.parse(input)
    const service = createSupplierService(user.tenantId, user.isPlatform)
    const result = await service.updateSupplier(id, dto)
    revalidatePath('/inventory/suppliers')
    return result
  })
}

export function deleteSupplierAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:delete:supplier')
    const service = createSupplierService(user.tenantId, user.isPlatform)
    await service.deleteSupplier(id)
    revalidatePath('/inventory/suppliers')
    return null
  })
}

// ---- 采购单 ----

export function getPurchaseOrdersAction(
  filters: PurchaseOrderFilters
): Promise<ActionResult<PaginatedResult<PurchaseOrderVO>>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:purchase')
    const scopeFilter = getDataScopeFilter(user, 'inventory:read:purchase')
    const service = createPurchaseOrderService(user.tenantId, user.isPlatform)
    return service.getPurchaseOrders(user.isPlatform ? null : user.tenantId, { ...filters, ...scopeFilter })
  })
}

export function getPurchaseOrderByIdAction(id: string): Promise<ActionResult<PurchaseOrderVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:purchase')
    const service = createPurchaseOrderService(user.tenantId, user.isPlatform)
    return service.getPurchaseOrderById(id)
  })
}

export function createPurchaseOrderAction(input: unknown): Promise<ActionResult<PurchaseOrderVO>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:create:purchase')
    const dto = createPurchaseOrderSchema.parse(input)
    const service = createPurchaseOrderService(user.tenantId, user.isPlatform)
    const result = await service.createPurchaseOrder(user.isPlatform ? null : user.tenantId, user.id, dto)
    revalidatePath('/inventory/purchase-orders')
    return result
  })
}

export function approvePurchaseOrderAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:approve:purchase')
    const service = createPurchaseOrderService(user.tenantId, user.isPlatform)
    await service.approvePurchaseOrder(id, user.id)
    revalidatePath('/inventory/purchase-orders')
    return null
  })
}

export function receivePurchaseOrderAction(id: string, input: unknown): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:update:purchase')
    const data = receivePurchaseSchema.parse(input)
    const service = createPurchaseOrderService(user.tenantId, user.isPlatform)
    await service.receivePurchaseOrder(id, data.items, user.id)
    revalidatePath('/inventory/purchase-orders')
    revalidatePath('/inventory/stock')
    return null
  })
}

export function deletePurchaseOrderAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:delete:purchase')
    const service = createPurchaseOrderService(user.tenantId, user.isPlatform)
    await service.deletePurchaseOrder(id)
    revalidatePath('/inventory/purchase-orders')
    return null
  })
}

// ---- 调拨单 ----

export function getTransferOrdersAction(
  filters: TransferOrderFilters
): Promise<ActionResult<PaginatedResult<TransferOrderVO>>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:transfer')
    const scopeFilter = getDataScopeFilter(user, 'inventory:read:transfer')
    const service = createTransferOrderService(user.tenantId, user.isPlatform)
    return service.getTransferOrders({ ...filters, ...scopeFilter })
  })
}

export function getTransferOrderByIdAction(id: string): Promise<ActionResult<TransferOrderVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:transfer')
    const service = createTransferOrderService(user.tenantId, user.isPlatform)
    return service.getTransferOrderById(id)
  })
}

export function createTransferOrderAction(input: unknown): Promise<ActionResult<TransferOrderVO>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:create:transfer')
    const dto = createTransferOrderSchema.parse(input)
    const service = createTransferOrderService(user.tenantId, user.isPlatform)
    const result = await service.createTransferOrder(user.id, dto)
    revalidatePath('/inventory/transfer-orders')
    return result
  })
}

export function approveTransferOrderAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:approve:transfer')
    const service = createTransferOrderService(user.tenantId, user.isPlatform)
    await service.approveTransferOrder(id, user.id)
    revalidatePath('/inventory/transfer-orders')
    return null
  })
}

export function shipTransferOrderAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:update:transfer')
    const service = createTransferOrderService(user.tenantId, user.isPlatform)
    await service.shipTransferOrder(id)
    revalidatePath('/inventory/transfer-orders')
    return null
  })
}

export function receiveTransferOrderAction(id: string, input: unknown): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:update:transfer')
    const data = receiveTransferSchema.parse(input)
    const service = createTransferOrderService(user.tenantId, user.isPlatform)
    await service.receiveTransferOrder(id, data.items, user.id)
    revalidatePath('/inventory/transfer-orders')
    revalidatePath('/inventory/stock')
    return null
  })
}

export function deleteTransferOrderAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:delete:transfer')
    const service = createTransferOrderService(user.tenantId, user.isPlatform)
    await service.deleteTransferOrder(id)
    revalidatePath('/inventory/transfer-orders')
    return null
  })
}

// ---- 库存变动 ----

export function getStockMovementsAction(
  filters: StockMovementFilters
): Promise<ActionResult<PaginatedResult<StockMovementVO>>> {
  return withAction(async () => {
    const user = await requirePermission('inventory:read:stock')
    const scopeFilter = getDataScopeFilter(user, 'inventory:read:stock')
    const service = createStockMovementService(user.tenantId, user.isPlatform)
    return service.getMovements({ ...filters, ...scopeFilter })
  })
}

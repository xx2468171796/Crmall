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
import { ok, fail, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { AppError } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type {
  WarehouseVO,
  StockVO, StockFilters,
  SnCodeVO, SnFilters,
  SupplierVO,
  PurchaseOrderVO, PurchaseOrderFilters,
  TransferOrderVO, TransferOrderFilters,
  StockMovementVO, StockMovementFilters,
} from '../types/inventory.types'

// ---- 仓库 ----

export async function getWarehousesAction(): Promise<ActionResult<WarehouseVO[]>> {
  try {
    const user = await requirePermission('inventory:read:warehouse')
    const service = createWarehouseService()
    const result = await service.getWarehouses(user.isPlatform ? null : user.tenantId)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getWarehouseByIdAction(id: string): Promise<ActionResult<WarehouseVO | null>> {
  try {
    await requirePermission('inventory:read:warehouse')
    const service = createWarehouseService()
    const result = await service.getWarehouseById(id)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createWarehouseAction(input: unknown): Promise<ActionResult<WarehouseVO>> {
  try {
    const user = await requirePermission('inventory:create:warehouse')
    const dto = createWarehouseSchema.parse(input)
    const service = createWarehouseService()
    const result = await service.createWarehouse(user.isPlatform ? null : user.tenantId, dto)
    revalidatePath('/inventory/warehouses')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function updateWarehouseAction(id: string, input: unknown): Promise<ActionResult<WarehouseVO>> {
  try {
    await requirePermission('inventory:update:warehouse')
    const dto = updateWarehouseSchema.parse(input)
    const service = createWarehouseService()
    const result = await service.updateWarehouse(id, dto)
    revalidatePath('/inventory/warehouses')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function deleteWarehouseAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('inventory:delete:warehouse')
    const service = createWarehouseService()
    await service.deleteWarehouse(id)
    revalidatePath('/inventory/warehouses')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 库存 ----

export async function getStockAction(filters: StockFilters): Promise<ActionResult<PaginatedResult<StockVO>>> {
  try {
    await requirePermission('inventory:read:stock')
    const service = createStockService()
    const result = await service.getAllStock(filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getStockByWarehouseAction(
  warehouseId: string,
  filters: StockFilters
): Promise<ActionResult<PaginatedResult<StockVO>>> {
  try {
    await requirePermission('inventory:read:stock')
    const service = createStockService()
    const result = await service.getStockByWarehouse(warehouseId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getStockByVariantAction(variantId: string): Promise<ActionResult<StockVO[]>> {
  try {
    await requirePermission('inventory:read:stock')
    const service = createStockService()
    const result = await service.getStockByVariant(variantId)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function adjustStockAction(input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requirePermission('inventory:update:stock')
    const dto = stockAdjustSchema.parse(input)
    const service = createStockService()
    await service.adjustStock(dto, user.id)
    revalidatePath('/inventory/stock')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- SN 码 ----

export async function getSnCodesAction(filters: SnFilters): Promise<ActionResult<PaginatedResult<SnCodeVO>>> {
  try {
    await requirePermission('inventory:read:sn')
    const service = createSnCodeService()
    const result = await service.getSnCodes(filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getSnCodeByIdAction(id: string): Promise<ActionResult<SnCodeVO | null>> {
  try {
    await requirePermission('inventory:read:sn')
    const service = createSnCodeService()
    const result = await service.getSnCodeById(id)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getSnCodeBySnAction(sn: string): Promise<ActionResult<SnCodeVO | null>> {
  try {
    await requirePermission('inventory:read:sn')
    const service = createSnCodeService()
    const result = await service.getSnCodeBySn(sn)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createSnCodeAction(input: unknown): Promise<ActionResult<SnCodeVO>> {
  try {
    await requirePermission('inventory:create:sn')
    const dto = createSnCodeSchema.parse(input)
    const service = createSnCodeService()
    const result = await service.createSnCode(dto)
    revalidatePath('/inventory/sn-codes')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function updateSnCodeAction(id: string, input: unknown): Promise<ActionResult<SnCodeVO>> {
  try {
    await requirePermission('inventory:update:sn')
    const dto = updateSnCodeSchema.parse(input)
    const service = createSnCodeService()
    const result = await service.updateSnCode(id, dto)
    revalidatePath('/inventory/sn-codes')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function deleteSnCodeAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('inventory:delete:sn')
    const service = createSnCodeService()
    await service.deleteSnCode(id)
    revalidatePath('/inventory/sn-codes')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 供应商 ----

export async function getSuppliersAction(
  filters: { search?: string; status?: string; page?: number; perPage?: number }
): Promise<ActionResult<PaginatedResult<SupplierVO>>> {
  try {
    const user = await requirePermission('inventory:read:supplier')
    const service = createSupplierService()
    const result = await service.getSuppliers(user.isPlatform ? null : user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getSupplierByIdAction(id: string): Promise<ActionResult<SupplierVO | null>> {
  try {
    await requirePermission('inventory:read:supplier')
    const service = createSupplierService()
    const result = await service.getSupplierById(id)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createSupplierAction(input: unknown): Promise<ActionResult<SupplierVO>> {
  try {
    const user = await requirePermission('inventory:create:supplier')
    const dto = createSupplierSchema.parse(input)
    const service = createSupplierService()
    const result = await service.createSupplier(user.isPlatform ? null : user.tenantId, dto)
    revalidatePath('/inventory/suppliers')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function updateSupplierAction(id: string, input: unknown): Promise<ActionResult<SupplierVO>> {
  try {
    await requirePermission('inventory:update:supplier')
    const dto = updateSupplierSchema.parse(input)
    const service = createSupplierService()
    const result = await service.updateSupplier(id, dto)
    revalidatePath('/inventory/suppliers')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function deleteSupplierAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('inventory:delete:supplier')
    const service = createSupplierService()
    await service.deleteSupplier(id)
    revalidatePath('/inventory/suppliers')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 采购单 ----

export async function getPurchaseOrdersAction(
  filters: PurchaseOrderFilters
): Promise<ActionResult<PaginatedResult<PurchaseOrderVO>>> {
  try {
    const user = await requirePermission('inventory:read:purchase')
    const service = createPurchaseOrderService()
    const result = await service.getPurchaseOrders(user.isPlatform ? null : user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getPurchaseOrderByIdAction(id: string): Promise<ActionResult<PurchaseOrderVO | null>> {
  try {
    await requirePermission('inventory:read:purchase')
    const service = createPurchaseOrderService()
    const result = await service.getPurchaseOrderById(id)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createPurchaseOrderAction(input: unknown): Promise<ActionResult<PurchaseOrderVO>> {
  try {
    const user = await requirePermission('inventory:create:purchase')
    const dto = createPurchaseOrderSchema.parse(input)
    const service = createPurchaseOrderService()
    const result = await service.createPurchaseOrder(user.isPlatform ? null : user.tenantId, user.id, dto)
    revalidatePath('/inventory/purchase-orders')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function approvePurchaseOrderAction(id: string): Promise<ActionResult<null>> {
  try {
    const user = await requirePermission('inventory:approve:purchase')
    const service = createPurchaseOrderService()
    await service.approvePurchaseOrder(id, user.id)
    revalidatePath('/inventory/purchase-orders')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function receivePurchaseOrderAction(id: string, input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requirePermission('inventory:update:purchase')
    const data = receivePurchaseSchema.parse(input)
    const service = createPurchaseOrderService()
    await service.receivePurchaseOrder(id, data.items, user.id)
    revalidatePath('/inventory/purchase-orders')
    revalidatePath('/inventory/stock')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function deletePurchaseOrderAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('inventory:delete:purchase')
    const service = createPurchaseOrderService()
    await service.deletePurchaseOrder(id)
    revalidatePath('/inventory/purchase-orders')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 调拨单 ----

export async function getTransferOrdersAction(
  filters: TransferOrderFilters
): Promise<ActionResult<PaginatedResult<TransferOrderVO>>> {
  try {
    await requirePermission('inventory:read:transfer')
    const service = createTransferOrderService()
    const result = await service.getTransferOrders(filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getTransferOrderByIdAction(id: string): Promise<ActionResult<TransferOrderVO | null>> {
  try {
    await requirePermission('inventory:read:transfer')
    const service = createTransferOrderService()
    const result = await service.getTransferOrderById(id)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createTransferOrderAction(input: unknown): Promise<ActionResult<TransferOrderVO>> {
  try {
    const user = await requirePermission('inventory:create:transfer')
    const dto = createTransferOrderSchema.parse(input)
    const service = createTransferOrderService()
    const result = await service.createTransferOrder(user.id, dto)
    revalidatePath('/inventory/transfer-orders')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function approveTransferOrderAction(id: string): Promise<ActionResult<null>> {
  try {
    const user = await requirePermission('inventory:approve:transfer')
    const service = createTransferOrderService()
    await service.approveTransferOrder(id, user.id)
    revalidatePath('/inventory/transfer-orders')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function shipTransferOrderAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('inventory:update:transfer')
    const service = createTransferOrderService()
    await service.shipTransferOrder(id)
    revalidatePath('/inventory/transfer-orders')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function receiveTransferOrderAction(id: string, input: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requirePermission('inventory:update:transfer')
    const data = receiveTransferSchema.parse(input)
    const service = createTransferOrderService()
    await service.receiveTransferOrder(id, data.items, user.id)
    revalidatePath('/inventory/transfer-orders')
    revalidatePath('/inventory/stock')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function deleteTransferOrderAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('inventory:delete:transfer')
    const service = createTransferOrderService()
    await service.deleteTransferOrder(id)
    revalidatePath('/inventory/transfer-orders')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 库存变动 ----

export async function getStockMovementsAction(
  filters: StockMovementFilters
): Promise<ActionResult<PaginatedResult<StockMovementVO>>> {
  try {
    await requirePermission('inventory:read:stock')
    const service = createStockMovementService()
    const result = await service.getMovements(filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

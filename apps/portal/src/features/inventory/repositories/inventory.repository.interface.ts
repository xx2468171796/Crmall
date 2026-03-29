// ============================================
// 进销存 — Repository 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  WarehouseVO, CreateWarehouseDTO, UpdateWarehouseDTO,
  StockVO, StockFilters,
  SnCodeVO, CreateSnCodeDTO, UpdateSnCodeDTO, SnFilters,
  SupplierVO, CreateSupplierDTO, UpdateSupplierDTO, SupplierFilters,
  PurchaseOrderVO, CreatePurchaseOrderDTO, PurchaseOrderFilters,
  TransferOrderVO, CreateTransferOrderDTO, TransferOrderFilters,
  StockMovementVO, StockMovementFilters,
} from '../types/inventory.types'

export interface IWarehouseRepository {
  findById(id: string): Promise<WarehouseVO | null>
  findByCode(code: string): Promise<WarehouseVO | null>
  findByTenant(tenantId: string | null): Promise<WarehouseVO[]>
  create(tenantId: string | null, dto: CreateWarehouseDTO): Promise<WarehouseVO>
  update(id: string, dto: UpdateWarehouseDTO): Promise<WarehouseVO>
  delete(id: string): Promise<void>
}

export interface IStockRepository {
  findByWarehouse(warehouseId: string, filters: StockFilters): Promise<PaginatedResult<StockVO>>
  findByVariant(variantId: string): Promise<StockVO[]>
  findByVariantAndWarehouse(variantId: string, warehouseId: string): Promise<StockVO | null>
  adjustStock(variantId: string, warehouseId: string, quantity: number): Promise<void>
  lockStock(variantId: string, warehouseId: string, quantity: number): Promise<void>
  unlockStock(variantId: string, warehouseId: string, quantity: number): Promise<void>
  findAll(filters: StockFilters): Promise<PaginatedResult<StockVO>>
}

export interface ISnCodeRepository {
  findById(id: string): Promise<SnCodeVO | null>
  findBySn(sn: string): Promise<SnCodeVO | null>
  findByVariant(variantId: string, filters: SnFilters): Promise<PaginatedResult<SnCodeVO>>
  findAll(filters: SnFilters): Promise<PaginatedResult<SnCodeVO>>
  create(dto: CreateSnCodeDTO): Promise<SnCodeVO>
  update(id: string, dto: UpdateSnCodeDTO): Promise<SnCodeVO>
  updateStatus(id: string, status: string): Promise<void>
  delete(id: string): Promise<void>
}

export interface ISupplierRepository {
  findById(id: string): Promise<SupplierVO | null>
  findAll(tenantId: string | null, filters: SupplierFilters): Promise<PaginatedResult<SupplierVO>>
  create(tenantId: string | null, dto: CreateSupplierDTO): Promise<SupplierVO>
  update(id: string, dto: UpdateSupplierDTO): Promise<SupplierVO>
  delete(id: string): Promise<void>
}

export interface IPurchaseOrderRepository {
  findById(id: string): Promise<PurchaseOrderVO | null>
  findByTenant(tenantId: string | null, filters: PurchaseOrderFilters): Promise<PaginatedResult<PurchaseOrderVO>>
  create(tenantId: string | null, createdBy: string, dto: CreatePurchaseOrderDTO): Promise<PurchaseOrderVO>
  updateStatus(id: string, status: string, approvedBy?: string): Promise<void>
  updateItemReceivedQty(itemId: string, receivedQty: number): Promise<void>
  delete(id: string): Promise<void>
}

export interface ITransferOrderRepository {
  findById(id: string): Promise<TransferOrderVO | null>
  findAll(filters: TransferOrderFilters): Promise<PaginatedResult<TransferOrderVO>>
  create(requestedBy: string, dto: CreateTransferOrderDTO): Promise<TransferOrderVO>
  updateStatus(id: string, status: string, approvedBy?: string): Promise<void>
  updateItemReceivedQty(itemId: string, receivedQty: number): Promise<void>
  delete(id: string): Promise<void>
}

export interface IStockMovementRepository {
  create(data: {
    variantId: string
    warehouseId: string
    type: string
    quantity: number
    refType?: string
    refId?: string
    snCodeId?: string
    remark?: string
    createdBy: string
  }): Promise<StockMovementVO>
  findByVariant(variantId: string, filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>>
  findByWarehouse(warehouseId: string, filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>>
  findAll(filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>>
}

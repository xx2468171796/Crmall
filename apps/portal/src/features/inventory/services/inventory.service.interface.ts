// ============================================
// 进销存 — Service 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  WarehouseVO, CreateWarehouseDTO, UpdateWarehouseDTO,
  StockVO, StockFilters, StockAdjustDTO,
  SnCodeVO, CreateSnCodeDTO, UpdateSnCodeDTO, SnFilters,
  SupplierVO, CreateSupplierDTO, UpdateSupplierDTO, SupplierFilters,
  PurchaseOrderVO, CreatePurchaseOrderDTO, PurchaseOrderFilters, ReceivePurchaseItemDTO,
  TransferOrderVO, CreateTransferOrderDTO, TransferOrderFilters, ReceiveTransferItemDTO,
  StockMovementVO, StockMovementFilters,
} from '../types/inventory.types'

export interface IWarehouseService {
  getWarehouses(tenantId: string | null): Promise<WarehouseVO[]>
  getWarehouseById(id: string): Promise<WarehouseVO | null>
  createWarehouse(tenantId: string | null, dto: CreateWarehouseDTO): Promise<WarehouseVO>
  updateWarehouse(id: string, dto: UpdateWarehouseDTO): Promise<WarehouseVO>
  deleteWarehouse(id: string): Promise<void>
}

export interface IStockService {
  getStockByWarehouse(warehouseId: string, filters: StockFilters): Promise<PaginatedResult<StockVO>>
  getStockByVariant(variantId: string): Promise<StockVO[]>
  getAllStock(filters: StockFilters): Promise<PaginatedResult<StockVO>>
  adjustStock(dto: StockAdjustDTO, userId: string): Promise<void>
}

export interface ISnCodeService {
  getSnCodes(filters: SnFilters): Promise<PaginatedResult<SnCodeVO>>
  getSnCodeById(id: string): Promise<SnCodeVO | null>
  getSnCodeBySn(sn: string): Promise<SnCodeVO | null>
  createSnCode(dto: CreateSnCodeDTO): Promise<SnCodeVO>
  updateSnCode(id: string, dto: UpdateSnCodeDTO): Promise<SnCodeVO>
  deleteSnCode(id: string): Promise<void>
}

export interface ISupplierService {
  getSuppliers(tenantId: string | null, filters: SupplierFilters): Promise<PaginatedResult<SupplierVO>>
  getSupplierById(id: string): Promise<SupplierVO | null>
  createSupplier(tenantId: string | null, dto: CreateSupplierDTO): Promise<SupplierVO>
  updateSupplier(id: string, dto: UpdateSupplierDTO): Promise<SupplierVO>
  deleteSupplier(id: string): Promise<void>
}

export interface IPurchaseOrderService {
  getPurchaseOrders(tenantId: string | null, filters: PurchaseOrderFilters): Promise<PaginatedResult<PurchaseOrderVO>>
  getPurchaseOrderById(id: string): Promise<PurchaseOrderVO | null>
  createPurchaseOrder(tenantId: string | null, userId: string, dto: CreatePurchaseOrderDTO): Promise<PurchaseOrderVO>
  approvePurchaseOrder(id: string, userId: string): Promise<void>
  receivePurchaseOrder(id: string, items: ReceivePurchaseItemDTO[], userId: string): Promise<void>
  deletePurchaseOrder(id: string): Promise<void>
}

export interface ITransferOrderService {
  getTransferOrders(filters: TransferOrderFilters): Promise<PaginatedResult<TransferOrderVO>>
  getTransferOrderById(id: string): Promise<TransferOrderVO | null>
  createTransferOrder(userId: string, dto: CreateTransferOrderDTO): Promise<TransferOrderVO>
  approveTransferOrder(id: string, userId: string): Promise<void>
  shipTransferOrder(id: string): Promise<void>
  receiveTransferOrder(id: string, items: ReceiveTransferItemDTO[], userId: string): Promise<void>
  deleteTransferOrder(id: string): Promise<void>
}

export interface IStockMovementService {
  getMovements(filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>>
  getMovementsByVariant(variantId: string, filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>>
  getMovementsByWarehouse(warehouseId: string, filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>>
}

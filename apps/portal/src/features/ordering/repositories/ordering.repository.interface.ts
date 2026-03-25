// ============================================
// B2B 订货 — Repository 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  CatalogProductVO, CatalogFilters,
  CartItemVO, AddToCartDTO, UpdateCartDTO,
  OrderVO, OrderFilters,
  ShipmentVO,
  TenantAccountVO, AccountTransactionVO,
} from '../types/ordering.types'

export interface ICatalogRepository {
  findProducts(tenantId: string, filters: CatalogFilters): Promise<PaginatedResult<CatalogProductVO>>
  findProductById(id: string, tenantId: string): Promise<CatalogProductVO | null>
}

export interface ICartRepository {
  findByUser(tenantId: string, userId: string): Promise<CartItemVO[]>
  addItem(tenantId: string, userId: string, dto: AddToCartDTO, price: number): Promise<CartItemVO>
  updateItem(id: string, dto: UpdateCartDTO): Promise<CartItemVO>
  removeItem(id: string): Promise<void>
  clearCart(tenantId: string, userId: string): Promise<void>
}

export interface IOrderRepository {
  findById(id: string): Promise<OrderVO | null>
  findByTenant(tenantId: string, filters: OrderFilters): Promise<PaginatedResult<OrderVO>>
  findAll(filters: OrderFilters): Promise<PaginatedResult<OrderVO>>
  create(data: {
    orderNo: string
    tenantId: string
    totalAmount: number
    currency: string
    status: string
    paymentMethod: string
    remark?: string
    createdBy: string
    items: Array<{
      productId: string
      variantId?: string
      sku: string
      name: string
      variantName?: string
      image?: string
      specs?: Record<string, string>
      price: number
      quantity: number
      subtotal: number
      remark?: string
    }>
  }): Promise<OrderVO>
  updateStatus(id: string, status: string): Promise<void>
  setCancelReason(id: string, reason: string): Promise<void>
}

export interface IShipmentRepository {
  findByOrderId(orderId: string): Promise<ShipmentVO[]>
  create(data: {
    shipmentNo: string
    orderId: string
    carrier: string
    trackingNo: string
    remark?: string
    items: Array<{ orderItemId: string; quantity: number }>
  }): Promise<ShipmentVO>
  updateStatus(id: string, status: string, field?: string): Promise<void>
}

export interface IAccountRepository {
  findByTenantId(tenantId: string): Promise<TenantAccountVO | null>
  findTransactions(tenantId: string, page?: number, perPage?: number): Promise<{ items: AccountTransactionVO[]; total: number }>
  deduct(tenantId: string, amount: number, orderId: string, createdBy: string): Promise<void>
  refund(tenantId: string, amount: number, orderId: string, createdBy: string): Promise<void>
}

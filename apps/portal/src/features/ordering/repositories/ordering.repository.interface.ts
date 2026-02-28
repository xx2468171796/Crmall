// ============================================
// B2B 订货 — Repository 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  CatalogProductVO, CatalogFilters,
  CartItemVO, AddToCartDTO, UpdateCartDTO,
  OrderVO, OrderFilters,
  ShipmentVO, ShipOrderDTO,
  TenantAccountVO,
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
      sku: string
      name: string
      image?: string
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
  findByOrderId(orderId: string): Promise<ShipmentVO | null>
  create(orderId: string, dto: ShipOrderDTO): Promise<ShipmentVO>
  updateStatus(id: string, status: string, field?: string): Promise<void>
}

export interface IAccountRepository {
  findByTenantId(tenantId: string): Promise<TenantAccountVO | null>
  deduct(tenantId: string, amount: number, orderId: string, createdBy: string): Promise<void>
  refund(tenantId: string, amount: number, orderId: string, createdBy: string): Promise<void>
}

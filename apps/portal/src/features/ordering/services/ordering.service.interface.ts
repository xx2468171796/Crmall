// ============================================
// B2B 订货 — Service 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  CatalogProductVO, CatalogFilters,
  CartItemVO, AddToCartDTO, UpdateCartDTO,
  OrderVO, OrderFilters, CreateOrderDTO,
  ShipOrderDTO, TenantAccountVO,
} from '../types/ordering.types'

export interface ICatalogService {
  getProducts(tenantId: string, filters: CatalogFilters): Promise<PaginatedResult<CatalogProductVO>>
  getProductById(id: string, tenantId: string): Promise<CatalogProductVO | null>
}

export interface ICartService {
  getCart(tenantId: string, userId: string): Promise<CartItemVO[]>
  addToCart(tenantId: string, userId: string, dto: AddToCartDTO): Promise<CartItemVO>
  updateCartItem(id: string, dto: UpdateCartDTO): Promise<CartItemVO>
  removeCartItem(id: string): Promise<void>
}

export interface IOrderService {
  createOrder(tenantId: string, userId: string, dto: CreateOrderDTO): Promise<OrderVO>
  getOrders(tenantId: string, filters: OrderFilters): Promise<PaginatedResult<OrderVO>>
  getAllOrders(filters: OrderFilters): Promise<PaginatedResult<OrderVO>>
  getOrderById(id: string): Promise<OrderVO | null>
  confirmOrder(id: string): Promise<void>
  cancelOrder(id: string, reason: string, userId: string): Promise<void>
  shipOrder(id: string, dto: ShipOrderDTO): Promise<void>
  confirmReceive(id: string): Promise<void>
}

export interface IAccountService {
  getAccount(tenantId: string): Promise<TenantAccountVO | null>
}

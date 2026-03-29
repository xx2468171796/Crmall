'use server'

import { requirePermission, requirePlatform } from '@/lib/container'
import {
  createCatalogService, createCartService,
  createOrderService, createAccountService,
} from '@/lib/container'
import { getDataScopeFilter } from '@/lib/data-scope'
import {
  addToCartSchema, updateCartSchema,
  createOrderSchema, shipOrderSchema,
} from '../schemas/order.schema'
import { withAction, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type {
  CatalogProductVO, CatalogFilters,
  CartItemVO, OrderVO, OrderFilters,
  ShipmentVO, TenantAccountVO, AccountTransactionVO,
} from '../types/ordering.types'

// ---- 产品目录 ----

export function getCatalogAction(
  filters: CatalogFilters
): Promise<ActionResult<PaginatedResult<CatalogProductVO>>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:read:catalog')
    const service = createCatalogService(user.tenantId, user.isPlatform)
    return service.getProducts(user.tenantId, filters)
  })
}

export function getCatalogProductAction(
  id: string
): Promise<ActionResult<CatalogProductVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:read:catalog')
    const service = createCatalogService(user.tenantId, user.isPlatform)
    return service.getProductById(id, user.tenantId)
  })
}

// ---- 购物车 ----

export function getCartAction(): Promise<ActionResult<CartItemVO[]>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:read:cart')
    const service = createCartService(user.tenantId, user.isPlatform)
    return service.getCart(user.tenantId, user.id)
  })
}

export function addToCartAction(input: unknown): Promise<ActionResult<CartItemVO>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:create:cart')
    const dto = addToCartSchema.parse(input)
    const service = createCartService(user.tenantId, user.isPlatform)
    const result = await service.addToCart(user.tenantId, user.id, dto)
    revalidatePath('/ordering/cart')
    return result
  })
}

export function updateCartItemAction(
  id: string,
  input: unknown
): Promise<ActionResult<CartItemVO>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:update:cart')
    const dto = updateCartSchema.parse(input)
    const service = createCartService(user.tenantId, user.isPlatform)
    const result = await service.updateCartItem(id, dto)
    revalidatePath('/ordering/cart')
    return result
  })
}

export function removeCartItemAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:delete:cart')
    const service = createCartService(user.tenantId, user.isPlatform)
    await service.removeCartItem(id)
    revalidatePath('/ordering/cart')
    return null
  })
}

// ---- 订单 ----

export function createOrderAction(input: unknown): Promise<ActionResult<OrderVO>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:create:order')
    const dto = createOrderSchema.parse(input)
    const service = createOrderService(user.tenantId, user.isPlatform)
    const result = await service.createOrder(user.tenantId, user.id, dto)
    revalidatePath('/ordering/orders')
    return result
  })
}

export function getOrdersAction(
  filters: OrderFilters
): Promise<ActionResult<PaginatedResult<OrderVO>>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:read:order')
    const service = createOrderService(user.tenantId, user.isPlatform)
    const scopeFilter = getDataScopeFilter(user, 'ordering:read:order')
    const scopedFilters = { ...filters, ...scopeFilter }
    return user.isPlatform
      ? service.getAllOrders(filters)
      : service.getOrders(user.tenantId, scopedFilters)
  })
}

export function getOrderByIdAction(id: string): Promise<ActionResult<OrderVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:read:order')
    const service = createOrderService(user.tenantId, user.isPlatform)
    return service.getOrderById(id)
  })
}

export function confirmOrderAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePlatform()
    const service = createOrderService(user.tenantId, user.isPlatform)
    await service.confirmOrder(id)
    revalidatePath('/ordering/orders')
    return null
  })
}

export function cancelOrderAction(
  id: string,
  reason: string
): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:update:order')
    const service = createOrderService(user.tenantId, user.isPlatform)
    await service.cancelOrder(id, reason, user.id)
    revalidatePath('/ordering/orders')
    return null
  })
}

export function shipOrderAction(
  orderId: string,
  input: unknown
): Promise<ActionResult<ShipmentVO>> {
  return withAction(async () => {
    const user = await requirePlatform()
    const dto = shipOrderSchema.parse(input)
    const service = createOrderService(user.tenantId, user.isPlatform)
    const shipment = await service.shipOrder(orderId, dto)
    revalidatePath('/ordering/orders')
    revalidatePath('/platform/orders')
    return shipment
  })
}

export function confirmReceiveAction(shipmentId: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:update:order')
    const service = createOrderService(user.tenantId, user.isPlatform)
    await service.confirmReceive(shipmentId)
    revalidatePath('/ordering/orders')
    return null
  })
}

// ---- 账户 ----

export function getAccountAction(): Promise<ActionResult<TenantAccountVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:read:account')
    const service = createAccountService(user.tenantId, user.isPlatform)
    return service.getAccount(user.tenantId)
  })
}

export function getTransactionsAction(
  page?: number, perPage?: number
): Promise<ActionResult<{ items: AccountTransactionVO[]; total: number }>> {
  return withAction(async () => {
    const user = await requirePermission('ordering:read:account')
    const service = createAccountService(user.tenantId, user.isPlatform)
    return service.getTransactions(user.tenantId, page, perPage)
  })
}

'use server'

import { requirePermission, requirePlatform } from '@/lib/container'
import {
  createCatalogService, createCartService,
  createOrderService, createAccountService,
} from '@/lib/container'
import {
  addToCartSchema, updateCartSchema,
  createOrderSchema,
} from '../schemas/order.schema'
import { ok, fail, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { AppError } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type {
  CatalogProductVO, CatalogFilters,
  CartItemVO, OrderVO, OrderFilters,
  TenantAccountVO,
} from '../types/ordering.types'

// ---- 产品目录 ----

export async function getCatalogAction(
  filters: CatalogFilters
): Promise<ActionResult<PaginatedResult<CatalogProductVO>>> {
  try {
    const user = await requirePermission('ordering:read:catalog')
    const service = createCatalogService()
    const result = await service.getProducts(user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getCatalogProductAction(
  id: string
): Promise<ActionResult<CatalogProductVO | null>> {
  try {
    const user = await requirePermission('ordering:read:catalog')
    const service = createCatalogService()
    const result = await service.getProductById(id, user.tenantId)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 购物车 ----

export async function getCartAction(): Promise<ActionResult<CartItemVO[]>> {
  try {
    const user = await requirePermission('ordering:read:cart')
    const service = createCartService()
    const result = await service.getCart(user.tenantId, user.id)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function addToCartAction(input: unknown): Promise<ActionResult<CartItemVO>> {
  try {
    const user = await requirePermission('ordering:create:cart')
    const dto = addToCartSchema.parse(input)
    const service = createCartService()
    const result = await service.addToCart(user.tenantId, user.id, dto)
    revalidatePath('/ordering/cart')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function updateCartItemAction(
  id: string,
  input: unknown
): Promise<ActionResult<CartItemVO>> {
  try {
    await requirePermission('ordering:update:cart')
    const dto = updateCartSchema.parse(input)
    const service = createCartService()
    const result = await service.updateCartItem(id, dto)
    revalidatePath('/ordering/cart')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function removeCartItemAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('ordering:delete:cart')
    const service = createCartService()
    await service.removeCartItem(id)
    revalidatePath('/ordering/cart')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 订单 ----

export async function createOrderAction(input: unknown): Promise<ActionResult<OrderVO>> {
  try {
    const user = await requirePermission('ordering:create:order')
    const dto = createOrderSchema.parse(input)
    const service = createOrderService()
    const result = await service.createOrder(user.tenantId, user.id, dto)
    revalidatePath('/ordering/orders')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getOrdersAction(
  filters: OrderFilters
): Promise<ActionResult<PaginatedResult<OrderVO>>> {
  try {
    const user = await requirePermission('ordering:read:order')
    const service = createOrderService()
    const result = user.isPlatform
      ? await service.getAllOrders(filters)
      : await service.getOrders(user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getOrderByIdAction(id: string): Promise<ActionResult<OrderVO | null>> {
  try {
    await requirePermission('ordering:read:order')
    const service = createOrderService()
    const result = await service.getOrderById(id)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function confirmOrderAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePlatform()
    const service = createOrderService()
    await service.confirmOrder(id)
    revalidatePath('/ordering/orders')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function cancelOrderAction(
  id: string,
  reason: string
): Promise<ActionResult<null>> {
  try {
    const user = await requirePermission('ordering:update:order')
    const service = createOrderService()
    await service.cancelOrder(id, reason, user.id)
    revalidatePath('/ordering/orders')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function confirmReceiveAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('ordering:update:order')
    const service = createOrderService()
    await service.confirmReceive(id)
    revalidatePath('/ordering/orders')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 账户 ----

export async function getAccountAction(): Promise<ActionResult<TenantAccountVO | null>> {
  try {
    const user = await requirePermission('ordering:read:account')
    const service = createAccountService()
    const result = await service.getAccount(user.tenantId)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

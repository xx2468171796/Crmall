// ============================================
// B2B 订货 — Repository 实现
// ============================================

import type { PrismaClient } from '@twcrm/db'
import type { PaginatedResult } from '@twcrm/shared'
import type {
  ICatalogRepository, ICartRepository, IOrderRepository,
  IAccountRepository,
} from './ordering.repository.interface'
import type {
  CatalogProductVO, CatalogFilters,
  CartItemVO, AddToCartDTO, UpdateCartDTO,
  OrderVO, OrderFilters,
  TenantAccountVO,
} from '../types/ordering.types'

// ---- 产品目录 ----

export class CatalogRepository implements ICatalogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findProducts(tenantId: string, filters: CatalogFilters): Promise<PaginatedResult<CatalogProductVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: any = { status: filters.status ?? 'active' }
    if (filters.categoryId) where.categoryId = filters.categoryId
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { sortOrder: 'asc' },
        include: {
          category: true,
          prices: { where: { tenantId } },
        },
      }),
      this.prisma.catalogProduct.count({ where }),
    ])

    return {
      items: items.map((p) => this.toVO(p, tenantId)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async findProductById(id: string, tenantId: string): Promise<CatalogProductVO | null> {
    const p = await this.prisma.catalogProduct.findUnique({
      where: { id },
      include: {
        category: true,
        prices: { where: { tenantId } },
      },
    })
    return p ? this.toVO(p, tenantId) : null
  }

  private toVO(p: any, _tenantId: string): CatalogProductVO {
    const tenantPrice = p.prices?.[0]?.price
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description,
      images: p.images ?? [],
      specs: p.specs as Record<string, unknown> | null,
      basePrice: Number(p.basePrice),
      tenantPrice: tenantPrice ? Number(tenantPrice) : null,
      currency: p.currency,
      moq: p.moq,
      stock: p.stock,
      isCustom: p.isCustom,
      customNote: p.customNote,
      status: p.status,
      categoryId: p.categoryId,
      categoryName: p.category?.name ?? '',
    }
  }
}

// ---- 购物车 ----

export class CartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUser(tenantId: string, userId: string): Promise<CartItemVO[]> {
    const items = await this.prisma.cartItem.findMany({
      where: { tenantId, userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })
    return items.map((i) => this.toVO(i))
  }

  async addItem(tenantId: string, userId: string, dto: AddToCartDTO, _price: number): Promise<CartItemVO> {
    const item = await this.prisma.cartItem.upsert({
      where: { tenantId_userId_productId: { tenantId, userId, productId: dto.productId } },
      update: { quantity: { increment: dto.quantity }, remark: dto.remark },
      create: { tenantId, userId, productId: dto.productId, quantity: dto.quantity, remark: dto.remark },
      include: { product: true },
    })
    return this.toVO(item)
  }

  async updateItem(id: string, dto: UpdateCartDTO): Promise<CartItemVO> {
    const item = await this.prisma.cartItem.update({
      where: { id },
      data: { quantity: dto.quantity, remark: dto.remark },
      include: { product: true },
    })
    return this.toVO(item)
  }

  async removeItem(id: string): Promise<void> {
    await this.prisma.cartItem.delete({ where: { id } })
  }

  async clearCart(tenantId: string, userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { tenantId, userId } })
  }

  private toVO(i: any): CartItemVO {
    return {
      id: i.id,
      productId: i.productId,
      productName: i.product.name,
      productSku: i.product.sku,
      productImage: i.product.images?.[0] ?? null,
      price: Number(i.product.basePrice),
      quantity: i.quantity,
      subtotal: Number(i.product.basePrice) * i.quantity,
      moq: i.product.moq,
      stock: i.product.stock,
      remark: i.remark,
    }
  }
}

// ---- 订单 ----

export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<OrderVO | null> {
    const o = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, shipment: true },
    })
    return o ? this.toVO(o) : null
  }

  async findByTenant(tenantId: string, filters: OrderFilters): Promise<PaginatedResult<OrderVO>> {
    return this.query({ ...filters, tenantId })
  }

  async findAll(filters: OrderFilters): Promise<PaginatedResult<OrderVO>> {
    return this.query(filters)
  }

  async create(data: any): Promise<OrderVO> {
    const o = await this.prisma.order.create({
      data: {
        orderNo: data.orderNo,
        tenantId: data.tenantId,
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: data.status,
        paymentMethod: data.paymentMethod,
        remark: data.remark,
        createdBy: data.createdBy,
        items: { create: data.items },
      },
      include: { items: true, shipment: true },
    })
    return this.toVO(o)
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const data: any = { status }
    if (status === 'confirmed') data.confirmedAt = new Date()
    await this.prisma.order.update({ where: { id }, data })
  }

  async setCancelReason(id: string, reason: string): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: { status: 'cancelled', cancelReason: reason },
    })
  }

  private async query(filters: any): Promise<PaginatedResult<OrderVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: any = {}
    if (filters.tenantId) where.tenantId = filters.tenantId
    if (filters.status) where.status = filters.status
    if (filters.search) {
      where.OR = [{ orderNo: { contains: filters.search, mode: 'insensitive' } }]
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: { items: true, shipment: true },
      }),
      this.prisma.order.count({ where }),
    ])

    return {
      items: items.map((o) => this.toVO(o)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  private toVO(o: any): OrderVO {
    return {
      id: o.id,
      orderNo: o.orderNo,
      tenantId: o.tenantId,
      totalAmount: Number(o.totalAmount),
      currency: o.currency,
      status: o.status,
      paymentMethod: o.paymentMethod,
      remark: o.remark,
      cancelReason: o.cancelReason,
      createdBy: o.createdBy,
      confirmedAt: o.confirmedAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      items: (o.items ?? []).map((i: any) => ({
        id: i.id,
        productId: i.productId,
        sku: i.sku,
        name: i.name,
        image: i.image,
        price: Number(i.price),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
        remark: i.remark,
      })),
      shipment: o.shipment ? {
        id: o.shipment.id,
        orderId: o.shipment.orderId,
        carrier: o.shipment.carrier,
        trackingNo: o.shipment.trackingNo,
        shippedAt: o.shipment.shippedAt?.toISOString() ?? null,
        deliveredAt: o.shipment.deliveredAt?.toISOString() ?? null,
        receivedAt: o.shipment.receivedAt?.toISOString() ?? null,
        status: o.shipment.status,
        remark: o.shipment.remark,
      } : null,
    }
  }
}

// ---- 账户 ----

export class AccountRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByTenantId(tenantId: string): Promise<TenantAccountVO | null> {
    const a = await this.prisma.tenantAccount.findUnique({ where: { tenantId } })
    return a ? { id: a.id, tenantId: a.tenantId, balance: Number(a.balance), creditLimit: Number(a.creditLimit), currency: a.currency } : null
  }

  async deduct(tenantId: string, amount: number, orderId: string, createdBy: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const account = await tx.tenantAccount.update({
        where: { tenantId },
        data: { balance: { decrement: amount } },
      })
      await tx.accountTransaction.create({
        data: {
          accountId: account.id,
          type: 'deduct',
          amount: -amount,
          balanceAfter: account.balance,
          orderId,
          note: `订单扣款 ${orderId}`,
          createdBy,
        },
      })
    })
  }

  async refund(tenantId: string, amount: number, orderId: string, createdBy: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const account = await tx.tenantAccount.update({
        where: { tenantId },
        data: { balance: { increment: amount } },
      })
      await tx.accountTransaction.create({
        data: {
          accountId: account.id,
          type: 'refund',
          amount,
          balanceAfter: account.balance,
          orderId,
          note: `订单退款 ${orderId}`,
          createdBy,
        },
      })
    })
  }
}

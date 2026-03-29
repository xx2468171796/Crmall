// ============================================
// B2B 订货 — Repository 实现
// ============================================

import type { PrismaClient } from '@twcrm/db'
import { clampPagination } from '@twcrm/shared'
import type { PaginatedResult } from '@twcrm/shared'
import type {
  ICatalogRepository, ICartRepository, IOrderRepository,
  IShipmentRepository, IAccountRepository,
} from './ordering.repository.interface'
import type {
  CatalogProductVO, CatalogFilters, ProductVariantVO,
  CartItemVO, AddToCartDTO, UpdateCartDTO,
  OrderVO, OrderFilters, ShipmentVO,
  TenantAccountVO, AccountTransactionVO,
} from '../types/ordering.types'

// ---- Row types for Prisma query results ----

interface VariantAttributeValueRow {
  attributeValue: {
    value: string
    attribute: { name: string }
  }
}

interface VariantRow {
  id: string
  sku: string
  name: string | null
  images: string[]
  basePrice: { toNumber(): number } | number | null
  stock: number
  moq: number | null
  status: string
  sortOrder: number
  attributeValues: VariantAttributeValueRow[]
  tenantPrices?: Array<{ tenantId: string; price: { toNumber(): number } | number }>
}

interface CatalogProductRow {
  id: string
  sku: string
  name: string
  brand: string | null
  description: string | null
  images: string[]
  specs: unknown
  unit: string
  basePrice: { toNumber(): number } | number
  currency: string
  moq: number
  stock: number
  isCustom: boolean
  customNote: string | null
  status: string
  sortOrder: number
  categoryId: string
  category: { name: string }
  variants: VariantRow[]
  prices?: Array<{ variantId: string | null; tenantId: string; price: { toNumber(): number } | number }>
}

interface CartItemRow {
  id: string
  productId: string
  variantId: string
  product: {
    name: string
    sku: string
    images: string[]
    basePrice: { toNumber(): number } | number
    moq: number
    stock: number
  }
  variant: {
    sku: string
    name: string | null
    images: string[]
    basePrice: { toNumber(): number } | number | null
    stock: number
    moq: number | null
    attributeValues: VariantAttributeValueRow[]
    tenantPrices?: Array<{ price: { toNumber(): number } | number }>
  }
  quantity: number
  remark: string | null
}

interface OrderItemRow {
  id: string
  productId: string
  variantId: string | null
  sku: string
  name: string
  variantName: string | null
  image: string | null
  specs: unknown
  price: { toNumber(): number } | number
  quantity: number
  subtotal: { toNumber(): number } | number
  remark: string | null
}

interface ShipmentItemRow {
  id: string
  orderItemId: string
  quantity: number
  orderItem: {
    name: string
    sku: string
    image: string | null
  }
}

interface ShipmentRow {
  id: string
  shipmentNo: string
  orderId: string
  carrier: string | null
  trackingNo: string | null
  shippedAt: Date | null
  deliveredAt: Date | null
  receivedAt: Date | null
  status: string
  remark: string | null
  items: ShipmentItemRow[]
}

interface OrderRow {
  id: string
  orderNo: string
  tenantId: string
  totalAmount: { toNumber(): number } | number
  currency: string
  status: string
  paymentMethod: string
  remark: string | null
  cancelReason: string | null
  createdBy: string
  confirmedAt: Date | null
  createdAt: Date
  updatedAt: Date
  items: OrderItemRow[]
  shipments: ShipmentRow[]
}

interface CreateOrderData {
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
}

interface OrderQueryFilters extends OrderFilters {
  tenantId?: string
}

// ---- 辅助: Decimal → number ----

function toNum(val: { toNumber(): number } | number | null | undefined): number | null {
  if (val == null) return null
  return typeof val === 'number' ? val : val.toNumber()
}

// ---- 产品目录 ----

export class CatalogRepository implements ICatalogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findProducts(tenantId: string, filters: CatalogFilters): Promise<PaginatedResult<CatalogProductVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = { status: filters.status ?? 'active' }
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
          variants: {
            where: { status: 'active' },
            orderBy: { sortOrder: 'asc' },
            include: {
              attributeValues: {
                include: {
                  attributeValue: { include: { attribute: true } },
                },
              },
              tenantPrices: { where: { tenantId } },
            },
          },
        },
      }),
      this.prisma.catalogProduct.count({ where }),
    ])

    return {
      items: items.map((p) => this.toVO(p as unknown as CatalogProductRow, tenantId)),
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
        variants: {
          where: { status: 'active' },
          orderBy: { sortOrder: 'asc' },
          include: {
            attributeValues: {
              include: {
                attributeValue: { include: { attribute: true } },
              },
            },
            tenantPrices: { where: { tenantId } },
          },
        },
      },
    })
    return p ? this.toVO(p as unknown as CatalogProductRow, tenantId) : null
  }

  private toVO(p: CatalogProductRow, _tenantId: string): CatalogProductVO {
    // SPU 级租户价格 (variantId 为 null)
    const spuTenantPrice = p.prices?.find((tp) => tp.variantId === null)
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description,
      images: p.images ?? [],
      specs: p.specs as Record<string, unknown> | null,
      brand: p.brand,
      unit: p.unit,
      basePrice: Number(p.basePrice),
      tenantPrice: spuTenantPrice ? Number(spuTenantPrice.price) : null,
      currency: p.currency,
      moq: p.moq,
      stock: p.stock,
      isCustom: p.isCustom,
      customNote: p.customNote,
      status: p.status,
      categoryId: p.categoryId,
      categoryName: p.category?.name ?? '',
      variants: (p.variants ?? []).map((v) => this.toVariantVO(v, p)),
    }
  }

  /** 变体 VO 映射，含 4 级价格解析 */
  private toVariantVO(v: VariantRow, p: CatalogProductRow): ProductVariantVO {
    // 属性映射: { "颜色": "白色", "版本": "Zigbee" }
    const attributes: Record<string, string> = {}
    for (const av of v.attributeValues ?? []) {
      attributes[av.attributeValue.attribute.name] = av.attributeValue.value
    }

    // 4 级价格: variantTenantPrice > spuTenantPrice > variantBasePrice > spuBasePrice
    const variantTenantPrice = v.tenantPrices?.[0]?.price
    const spuTenantPrice = p.prices?.find((tp) => tp.variantId === null)?.price
    const variantBasePrice = v.basePrice

    let resolvedTenantPrice: number | null = null
    if (variantTenantPrice != null) {
      resolvedTenantPrice = Number(variantTenantPrice)
    } else if (spuTenantPrice != null) {
      resolvedTenantPrice = Number(spuTenantPrice)
    }

    return {
      id: v.id,
      sku: v.sku,
      name: v.name,
      images: v.images ?? [],
      basePrice: toNum(variantBasePrice),
      stock: v.stock,
      moq: v.moq,
      status: v.status,
      attributes,
      tenantPrice: resolvedTenantPrice,
    }
  }
}

// ---- 购物车 ----

export class CartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private static readonly cartInclude = {
    product: true,
    variant: {
      include: {
        attributeValues: {
          include: {
            attributeValue: { include: { attribute: true } },
          },
        },
        tenantPrices: true,
      },
    },
  } as const

  async findByUser(tenantId: string, userId: string): Promise<CartItemVO[]> {
    const items = await this.prisma.cartItem.findMany({
      where: { tenantId, userId },
      include: CartRepository.cartInclude,
      orderBy: { createdAt: 'desc' },
    })
    return items.map((i) => this.toVO(i as unknown as CartItemRow))
  }

  async addItem(tenantId: string, userId: string, dto: AddToCartDTO, _price: number): Promise<CartItemVO> {
    const item = await this.prisma.cartItem.upsert({
      where: { tenantId_userId_variantId: { tenantId, userId, variantId: dto.variantId } },
      update: { quantity: { increment: dto.quantity }, remark: dto.remark },
      create: {
        tenantId,
        userId,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,
        remark: dto.remark,
      },
      include: CartRepository.cartInclude,
    })
    return this.toVO(item as unknown as CartItemRow)
  }

  async updateItem(id: string, dto: UpdateCartDTO): Promise<CartItemVO> {
    const item = await this.prisma.cartItem.update({
      where: { id },
      data: { quantity: dto.quantity, remark: dto.remark },
      include: CartRepository.cartInclude,
    })
    return this.toVO(item as unknown as CartItemRow)
  }

  async removeItem(id: string): Promise<void> {
    await this.prisma.cartItem.delete({ where: { id } })
  }

  async clearCart(tenantId: string, userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { tenantId, userId } })
  }

  private toVO(i: CartItemRow): CartItemVO {
    // 属性映射
    const specs: Record<string, string> = {}
    for (const av of i.variant.attributeValues ?? []) {
      specs[av.attributeValue.attribute.name] = av.attributeValue.value
    }

    // 4 级价格: variantTenantPrice > spuTenantPrice(N/A in cart) > variantBasePrice > spuBasePrice
    // 购物车中只有 variant.tenantPrices 和 variant.basePrice、product.basePrice 可用
    const variantTenantPrice = i.variant.tenantPrices?.[0]?.price
    const variantBasePrice = i.variant.basePrice
    const spuBasePrice = i.product.basePrice

    let price: number
    if (variantTenantPrice != null) {
      price = Number(variantTenantPrice)
    } else if (variantBasePrice != null) {
      price = Number(variantBasePrice)
    } else {
      price = Number(spuBasePrice)
    }

    // MOQ: 变体级 > SPU 级
    const moq = i.variant.moq ?? i.product.moq

    return {
      id: i.id,
      productId: i.productId,
      productName: i.product.name,
      productSku: i.product.sku,
      productImage: i.product.images?.[0] ?? null,
      variantId: i.variantId,
      variantName: i.variant.name,
      variantSku: i.variant.sku,
      specs: Object.keys(specs).length > 0 ? specs : null,
      price,
      quantity: i.quantity,
      subtotal: price * i.quantity,
      moq,
      stock: i.variant.stock,
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
      include: { items: true, shipments: { include: { items: { include: { orderItem: true } } } } },
    })
    return o ? this.toVO(o as unknown as OrderRow) : null
  }

  async findByTenant(tenantId: string, filters: OrderFilters): Promise<PaginatedResult<OrderVO>> {
    return this.query({ ...filters, tenantId })
  }

  async findAll(filters: OrderFilters): Promise<PaginatedResult<OrderVO>> {
    return this.query(filters)
  }

  async create(data: CreateOrderData): Promise<OrderVO> {
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
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            name: item.name,
            variantName: item.variantName,
            image: item.image,
            specs: item.specs ?? undefined,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            remark: item.remark,
          })),
        },
      },
      include: { items: true, shipments: { include: { items: { include: { orderItem: true } } } } },
    })
    return this.toVO(o as unknown as OrderRow)
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const data: Record<string, unknown> = { status }
    if (status === 'confirmed') data.confirmedAt = new Date()
    await this.prisma.order.update({ where: { id }, data })
  }

  async setCancelReason(id: string, reason: string): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: { status: 'cancelled', cancelReason: reason },
    })
  }

  private async query(filters: OrderQueryFilters): Promise<PaginatedResult<OrderVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = {}
    if (filters.tenantId) where.tenantId = filters.tenantId
    if (filters.status) where.status = filters.status
    if (filters.createdBy) where.createdBy = filters.createdBy
    if (filters.departmentId) where.departmentId = filters.departmentId
    if (filters.search) {
      where.OR = [{ orderNo: { contains: filters.search, mode: 'insensitive' } }]
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: { items: true, shipments: { include: { items: { include: { orderItem: true } } } } },
      }),
      this.prisma.order.count({ where }),
    ])

    return {
      items: items.map((o) => this.toVO(o as unknown as OrderRow)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  private toVO(o: OrderRow): OrderVO {
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
      items: (o.items ?? []).map((i: OrderItemRow) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        sku: i.sku,
        name: i.name,
        variantName: i.variantName,
        image: i.image,
        specs: i.specs as Record<string, string> | null,
        price: Number(i.price),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
        remark: i.remark,
      })),
      shipments: (o.shipments ?? []).map((s: ShipmentRow) => ({
        id: s.id,
        shipmentNo: s.shipmentNo,
        orderId: s.orderId,
        carrier: s.carrier,
        trackingNo: s.trackingNo,
        shippedAt: s.shippedAt?.toISOString() ?? null,
        deliveredAt: s.deliveredAt?.toISOString() ?? null,
        receivedAt: s.receivedAt?.toISOString() ?? null,
        status: s.status,
        remark: s.remark,
        items: (s.items ?? []).map((si: ShipmentItemRow) => ({
          id: si.id,
          orderItemId: si.orderItemId,
          quantity: si.quantity,
          name: si.orderItem.name,
          sku: si.orderItem.sku,
          image: si.orderItem.image,
        })),
      })),
    }
  }
}

// ---- 物流 ----

export class ShipmentRepository implements IShipmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByOrderId(orderId: string): Promise<ShipmentVO[]> {
    const shipments = await this.prisma.shipment.findMany({
      where: { orderId },
      include: { items: { include: { orderItem: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return shipments.map((s) => this.toVO(s as unknown as ShipmentRow))
  }

  async create(data: {
    shipmentNo: string
    orderId: string
    carrier: string
    trackingNo: string
    remark?: string
    items: Array<{ orderItemId: string; quantity: number }>
  }): Promise<ShipmentVO> {
    const s = await this.prisma.shipment.create({
      data: {
        shipmentNo: data.shipmentNo,
        orderId: data.orderId,
        carrier: data.carrier,
        trackingNo: data.trackingNo,
        remark: data.remark,
        status: 'shipped',
        shippedAt: new Date(),
        items: {
          create: data.items.map((i) => ({
            orderItemId: i.orderItemId,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: { include: { orderItem: true } } },
    })
    return this.toVO(s as unknown as ShipmentRow)
  }

  async updateStatus(id: string, status: string, field?: string): Promise<void> {
    const data: Record<string, unknown> = { status }
    if (field) data[field] = new Date()
    await this.prisma.shipment.update({ where: { id }, data })
  }

  private toVO(s: ShipmentRow): ShipmentVO {
    return {
      id: s.id,
      shipmentNo: s.shipmentNo,
      orderId: s.orderId,
      carrier: s.carrier,
      trackingNo: s.trackingNo,
      shippedAt: s.shippedAt?.toISOString() ?? null,
      deliveredAt: s.deliveredAt?.toISOString() ?? null,
      receivedAt: s.receivedAt?.toISOString() ?? null,
      status: s.status,
      remark: s.remark,
      items: (s.items ?? []).map((si: ShipmentItemRow) => ({
        id: si.id,
        orderItemId: si.orderItemId,
        quantity: si.quantity,
        name: si.orderItem.name,
        sku: si.orderItem.sku,
        image: si.orderItem.image,
      })),
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

  async findTransactions(tenantId: string, rawPage = 1, rawPerPage = 20): Promise<{ items: AccountTransactionVO[]; total: number }> {
    const { page, perPage } = clampPagination(rawPage, rawPerPage)
    const account = await this.prisma.tenantAccount.findUnique({ where: { tenantId } })
    if (!account) return { items: [], total: 0 }

    const [items, total] = await Promise.all([
      this.prisma.accountTransaction.findMany({
        where: { accountId: account.id },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.accountTransaction.count({ where: { accountId: account.id } }),
    ])

    return {
      items: items.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceAfter: Number(t.balanceAfter),
        orderId: t.orderId,
        note: t.note,
        createdBy: t.createdBy,
        createdAt: t.createdAt.toISOString(),
      })),
      total,
    }
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

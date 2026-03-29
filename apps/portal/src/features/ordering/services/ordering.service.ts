// ============================================
// B2B 订货 — Service 实现
// 所有业务参数从 ConfigService 读取，禁止硬编码
// ============================================

import type { IConfigService, PaginatedResult } from '@twcrm/shared'
import {
  BusinessRuleError,
  generateDocumentNo,
  InsufficientBalanceError,
  InsufficientStockError,
  NotFoundError,
} from '@twcrm/shared'
import type { PrismaClient } from '@twcrm/db'
import {
  OrderRepository,
  CartRepository,
  AccountRepository,
} from '../repositories/ordering.repository'
import type {
  ICatalogRepository, ICartRepository, IOrderRepository, IShipmentRepository, IAccountRepository,
} from '../repositories/ordering.repository.interface'
import type { ICatalogService, ICartService, IOrderService, IAccountService } from './ordering.service.interface'
import type {
  CatalogProductVO, CatalogFilters,
  CartItemVO, AddToCartDTO, UpdateCartDTO,
  OrderVO, OrderFilters, CreateOrderDTO,
  ShipOrderDTO, ShipmentVO, TenantAccountVO,
} from '../types/ordering.types'

// ---- 产品目录 ----

export class CatalogService implements ICatalogService {
  constructor(
    private readonly catalogRepo: ICatalogRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getProducts(tenantId: string, filters: CatalogFilters): Promise<PaginatedResult<CatalogProductVO>> {
    return this.catalogRepo.findProducts(tenantId, filters)
  }

  async getProductById(id: string, tenantId: string): Promise<CatalogProductVO | null> {
    return this.catalogRepo.findProductById(id, tenantId)
  }
}

// ---- 购物车 ----

export class CartService implements ICartService {
  constructor(
    private readonly cartRepo: ICartRepository,
    private readonly catalogRepo: ICatalogRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getCart(tenantId: string, userId: string): Promise<CartItemVO[]> {
    return this.cartRepo.findByUser(tenantId, userId)
  }

  async addToCart(tenantId: string, userId: string, dto: AddToCartDTO): Promise<CartItemVO> {
    const product = await this.catalogRepo.findProductById(dto.productId, tenantId)
    if (!product) throw new NotFoundError('产品', dto.productId)
    if (product.status !== 'active') throw new BusinessRuleError('该产品已下架')

    // 查找变体并校验
    const variant = product.variants.find((v) => v.id === dto.variantId)
    if (!variant) throw new NotFoundError('产品变体', dto.variantId)
    if (variant.status !== 'active') throw new BusinessRuleError('该变体已下架')

    // MOQ: 变体级 > SPU 级
    const moq = variant.moq ?? product.moq
    if (dto.quantity < moq) throw new BusinessRuleError(`最小起订量为 ${moq}`)
    if (dto.quantity > variant.stock) throw new InsufficientStockError(product.name, variant.stock, dto.quantity)

    // 4 级价格: variantTenantPrice > spuTenantPrice > variantBasePrice > spuBasePrice
    const price = variant.tenantPrice ?? product.tenantPrice ?? variant.basePrice ?? product.basePrice
    return this.cartRepo.addItem(tenantId, userId, dto, price)
  }

  async updateCartItem(id: string, dto: UpdateCartDTO): Promise<CartItemVO> {
    return this.cartRepo.updateItem(id, dto)
  }

  async removeCartItem(id: string): Promise<void> {
    return this.cartRepo.removeItem(id)
  }
}

// ---- 订单 ----

export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly cartRepo: ICartRepository,
    protected readonly catalogRepo: ICatalogRepository,
    private readonly accountRepo: IAccountRepository,
    private readonly shipmentRepo: IShipmentRepository,
    private readonly configService: IConfigService,
  ) {}

  async createOrder(tenantId: string, userId: string, dto: CreateOrderDTO): Promise<OrderVO> {
    // 从 ConfigService 读取可配置参数
    const autoConfirm = await this.configService.getBoolean('ordering', 'auto_confirm_order', tenantId)
    const minAmount = await this.configService.getNumber('ordering', 'min_order_amount', tenantId, 0)
    const allowCredit = await this.configService.getBoolean('ordering', 'allow_credit_order', tenantId, false)
    const defaultCurrency = await this.configService.get('ordering', 'default_currency', tenantId) ?? 'TWD'
    const paymentMethods = await this.configService.getJson<string[]>('ordering', 'payment_methods', tenantId, ['balance', 'bank_transfer'])

    // 获取购物车
    const cartItems = await this.cartRepo.findByUser(tenantId, userId)
    if (cartItems.length === 0) throw new BusinessRuleError('购物车为空')

    // 计算总金额
    const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
    if (totalAmount < minAmount) throw new BusinessRuleError(`订单金额不能低于 ${minAmount}`)

    // 校验支付方式
    const paymentMethod = dto.paymentMethod ?? 'balance'
    if (!paymentMethods.includes(paymentMethod)) {
      throw new BusinessRuleError(`不支持的支付方式: ${paymentMethod}`)
    }

    // 余额校验
    if (paymentMethod === 'balance') {
      const account = await this.accountRepo.findByTenantId(tenantId)
      if (!account) throw new BusinessRuleError('账户不存在，请联系总部')
      const available = account.balance + (allowCredit ? account.creditLimit : 0)
      if (available < totalAmount) {
        throw new InsufficientBalanceError(account.balance, totalAmount)
      }
    }

    // 生成订单号
    const orderNo = generateDocumentNo('ORD')

    // 在事务中执行: 创建订单 + 扣款 + 清空购物车，保证原子性
    // 延迟导入 prisma 避免在测试环境中触发 DATABASE_URL 校验
    const { prisma } = await import('@twcrm/db')
    const status = autoConfirm ? 'confirmed' : 'pending'
    return prisma.$transaction(async (tx) => {
      const txClient = tx as unknown as PrismaClient
      const txOrderRepo = new OrderRepository(txClient)
      const txAccountRepo = new AccountRepository(txClient)
      const txCartRepo = new CartRepository(txClient)

      // 1. 创建订单
      const order = await txOrderRepo.create({
        orderNo,
        tenantId,
        totalAmount,
        currency: defaultCurrency,
        status,
        paymentMethod,
        remark: dto.remark,
        createdBy: userId,
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? undefined,
          sku: item.variantSku ?? item.productSku,
          name: item.productName,
          variantName: item.variantName ?? undefined,
          image: item.productImage ?? undefined,
          specs: item.specs ?? undefined,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          remark: item.remark ?? undefined,
        })),
      })

      // 2. 余额扣款
      if (paymentMethod === 'balance') {
        await txAccountRepo.deduct(tenantId, totalAmount, order.id, userId)
      }

      // 3. 清空购物车
      await txCartRepo.clearCart(tenantId, userId)

      return order
    })
  }

  async getOrders(tenantId: string, filters: OrderFilters): Promise<PaginatedResult<OrderVO>> {
    return this.orderRepo.findByTenant(tenantId, filters)
  }

  async getAllOrders(filters: OrderFilters): Promise<PaginatedResult<OrderVO>> {
    return this.orderRepo.findAll(filters)
  }

  async getOrderById(id: string): Promise<OrderVO | null> {
    return this.orderRepo.findById(id)
  }

  async confirmOrder(id: string): Promise<void> {
    const order = await this.orderRepo.findById(id)
    if (!order) throw new NotFoundError('订单', id)
    if (order.status !== 'pending') throw new BusinessRuleError('只能确认待处理的订单')
    await this.orderRepo.updateStatus(id, 'confirmed')
  }

  async cancelOrder(id: string, reason: string, userId: string): Promise<void> {
    const order = await this.orderRepo.findById(id)
    if (!order) throw new NotFoundError('订单', id)
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new BusinessRuleError('该订单状态不允许取消')
    }
    await this.orderRepo.setCancelReason(id, reason)

    // 退款
    if (order.paymentMethod === 'balance' && order.status === 'confirmed') {
      await this.accountRepo.refund(order.tenantId, order.totalAmount, id, userId)
    }
  }

  async shipOrder(id: string, dto: ShipOrderDTO): Promise<ShipmentVO> {
    const order = await this.orderRepo.findById(id)
    if (!order) throw new NotFoundError('订单', id)
    if (!['confirmed', 'shipped'].includes(order.status)) {
      throw new BusinessRuleError('只能发货已确认或部分发货的订单')
    }

    // 校验发货项：每项的 orderItemId 必须属于该订单，数量不能超过剩余可发数量
    const orderItemMap = new Map(order.items.map((i) => [i.id, i]))
    for (const shipItem of dto.items) {
      const orderItem = orderItemMap.get(shipItem.orderItemId)
      if (!orderItem) throw new BusinessRuleError(`订单项 ${shipItem.orderItemId} 不属于该订单`)

      // 计算已发货数量
      const shippedQty = order.shipments
        .flatMap((s) => s.items)
        .filter((si) => si.orderItemId === shipItem.orderItemId)
        .reduce((sum, si) => sum + si.quantity, 0)

      const remaining = orderItem.quantity - shippedQty
      if (shipItem.quantity > remaining) {
        throw new BusinessRuleError(`${orderItem.name} 剩余可发数量为 ${remaining}，不能发 ${shipItem.quantity}`)
      }
    }

    // 生成物流批次号
    const shipmentNo = generateDocumentNo('SHP')

    const shipment = await this.shipmentRepo.create({
      shipmentNo,
      orderId: id,
      carrier: dto.carrier,
      trackingNo: dto.trackingNo,
      remark: dto.remark,
      items: dto.items,
    })

    // 判断是否全部发货完成，更新订单状态
    const allShipments = await this.shipmentRepo.findByOrderId(id)
    const totalShipped = new Map<string, number>()
    for (const s of allShipments) {
      for (const si of s.items) {
        totalShipped.set(si.orderItemId, (totalShipped.get(si.orderItemId) ?? 0) + si.quantity)
      }
    }
    const allItemsFullyShipped = order.items.every((item) =>
      (totalShipped.get(item.id) ?? 0) >= item.quantity
    )

    if (allItemsFullyShipped) {
      await this.orderRepo.updateStatus(id, 'shipped')
    } else if (order.status === 'confirmed') {
      // 部分发货，标记为 shipping（处理中）
      await this.orderRepo.updateStatus(id, 'shipping')
    }

    return shipment
  }

  async confirmReceive(shipmentId: string): Promise<void> {
    await this.shipmentRepo.updateStatus(shipmentId, 'received', 'receivedAt')
  }

  async getShipments(orderId: string): Promise<ShipmentVO[]> {
    return this.shipmentRepo.findByOrderId(orderId)
  }
}

// ---- 账户 ----

export class AccountService implements IAccountService {
  constructor(
    private readonly accountRepo: IAccountRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getAccount(tenantId: string): Promise<TenantAccountVO | null> {
    return this.accountRepo.findByTenantId(tenantId)
  }

  async getTransactions(tenantId: string, page?: number, perPage?: number) {
    return this.accountRepo.findTransactions(tenantId, page, perPage)
  }
}

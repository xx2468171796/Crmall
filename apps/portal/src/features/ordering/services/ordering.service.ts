// ============================================
// B2B 订货 — Service 实现
// 所有业务参数从 ConfigService 读取，禁止硬编码
// ============================================

import type { IConfigService, PaginatedResult } from '@twcrm/shared'
import {
  BusinessRuleError,
  InsufficientBalanceError,
  InsufficientStockError,
  NotFoundError,
} from '@twcrm/shared'
import type {
  ICatalogRepository, ICartRepository, IOrderRepository, IAccountRepository,
} from '../repositories/ordering.repository.interface'
import type { ICatalogService, ICartService, IOrderService, IAccountService } from './ordering.service.interface'
import type {
  CatalogProductVO, CatalogFilters,
  CartItemVO, AddToCartDTO, UpdateCartDTO,
  OrderVO, OrderFilters, CreateOrderDTO,
  ShipOrderDTO, TenantAccountVO,
} from '../types/ordering.types'

// ---- 产品目录 ----

export class CatalogService implements ICatalogService {
  constructor(
    private readonly catalogRepo: ICatalogRepository,
    private readonly configService: IConfigService,
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
    private readonly configService: IConfigService,
  ) {}

  async getCart(tenantId: string, userId: string): Promise<CartItemVO[]> {
    return this.cartRepo.findByUser(tenantId, userId)
  }

  async addToCart(tenantId: string, userId: string, dto: AddToCartDTO): Promise<CartItemVO> {
    const product = await this.catalogRepo.findProductById(dto.productId, tenantId)
    if (!product) throw new NotFoundError('产品', dto.productId)
    if (product.status !== 'active') throw new BusinessRuleError('该产品已下架')
    if (dto.quantity < product.moq) throw new BusinessRuleError(`最小起订量为 ${product.moq}`)
    if (dto.quantity > product.stock) throw new InsufficientStockError(product.name, product.stock, dto.quantity)

    const price = product.tenantPrice ?? product.basePrice
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
    private readonly catalogRepo: ICatalogRepository,
    private readonly accountRepo: IAccountRepository,
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
    const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    // 创建订单
    const status = autoConfirm ? 'confirmed' : 'pending'
    const order = await this.orderRepo.create({
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
        sku: item.productSku,
        name: item.productName,
        image: item.productImage ?? undefined,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        remark: item.remark ?? undefined,
      })),
    })

    // 余额扣款
    if (paymentMethod === 'balance') {
      await this.accountRepo.deduct(tenantId, totalAmount, order.id, userId)
    }

    // 清空购物车
    await this.cartRepo.clearCart(tenantId, userId)

    return order
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

  async shipOrder(id: string, dto: ShipOrderDTO): Promise<void> {
    const order = await this.orderRepo.findById(id)
    if (!order) throw new NotFoundError('订单', id)
    if (order.status !== 'confirmed') throw new BusinessRuleError('只能发货已确认的订单')
    await this.orderRepo.updateStatus(id, 'shipped')
    // shipment 创建由 action 层处理
  }

  async confirmReceive(id: string): Promise<void> {
    const order = await this.orderRepo.findById(id)
    if (!order) throw new NotFoundError('订单', id)
    if (order.status !== 'shipped') throw new BusinessRuleError('只能确认收货已发货的订单')
    await this.orderRepo.updateStatus(id, 'completed')
  }
}

// ---- 账户 ----

export class AccountService implements IAccountService {
  constructor(
    private readonly accountRepo: IAccountRepository,
    private readonly configService: IConfigService,
  ) {}

  async getAccount(tenantId: string): Promise<TenantAccountVO | null> {
    return this.accountRepo.findByTenantId(tenantId)
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderService } from '../ordering.service'
import type { IOrderRepository, ICartRepository, ICatalogRepository, IShipmentRepository, IAccountRepository } from '../../repositories/ordering.repository.interface'
import type { IConfigService } from '@twcrm/shared'
import { BusinessRuleError, InsufficientBalanceError } from '@twcrm/shared'
import type { CartItemVO, OrderVO } from '../../types/ordering.types'

// ---- Module mocks ----
// Hoisted refs let the vi.mock factories below close over the live mock instances
// that are replaced in beforeEach, so $transaction delegates to the correct mocks.
const hoisted = vi.hoisted(() => ({
  txOrderCreate: vi.fn(),
  txAccountDeduct: vi.fn(),
  txCartClearCart: vi.fn(),
}))

vi.mock('@twcrm/db', () => ({
  prisma: {
    $transaction: vi.fn((cb: (tx: unknown) => unknown) => cb({})),
  },
}))

vi.mock('../../repositories/ordering.repository', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OrderRepository: vi.fn(function (this: any) { this.create = hoisted.txOrderCreate }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AccountRepository: vi.fn(function (this: any) { this.deduct = hoisted.txAccountDeduct }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CartRepository: vi.fn(function (this: any) { this.clearCart = hoisted.txCartClearCart }),
}))

// ---- Helpers ----

function makeCartItem(overrides: Partial<CartItemVO> = {}): CartItemVO {
  return {
    id: 'cart-1',
    productId: 'prod-1',
    productName: 'Test Product',
    productSku: 'SKU-001',
    productImage: null,
    variantId: 'var-1',
    variantName: '白色',
    variantSku: 'SKU-001-WHT',
    specs: { '颜色': '白色' },
    price: 100,
    quantity: 10,
    subtotal: 1000,
    moq: 1,
    stock: 100,
    remark: null,
    ...overrides,
  }
}

function makeOrderVO(overrides: Partial<OrderVO> = {}): OrderVO {
  return {
    id: 'order-1',
    orderNo: 'ORD-123',
    tenantId: 'tenant-1',
    totalAmount: 1000,
    currency: 'TWD',
    status: 'pending',
    paymentMethod: 'balance',
    remark: null,
    cancelReason: null,
    createdBy: 'user-1',
    confirmedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    items: [],
    shipments: [],
    ...overrides,
  }
}

// ---- Test Suite ----

describe('OrderService', () => {
  let service: OrderService
  let mockOrderRepo: {
    create: ReturnType<typeof vi.fn>
    findById: ReturnType<typeof vi.fn>
    findByTenant: ReturnType<typeof vi.fn>
    findAll: ReturnType<typeof vi.fn>
    updateStatus: ReturnType<typeof vi.fn>
    setCancelReason: ReturnType<typeof vi.fn>
  }
  let mockCartRepo: {
    findByUser: ReturnType<typeof vi.fn>
    addItem: ReturnType<typeof vi.fn>
    updateItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clearCart: ReturnType<typeof vi.fn>
  }
  let mockCatalogRepo: {
    findProducts: ReturnType<typeof vi.fn>
    findProductById: ReturnType<typeof vi.fn>
  }
  let mockAccountRepo: {
    findByTenantId: ReturnType<typeof vi.fn>
    deduct: ReturnType<typeof vi.fn>
    refund: ReturnType<typeof vi.fn>
  }
  let mockShipmentRepo: {
    findByOrderId: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    updateStatus: ReturnType<typeof vi.fn>
  }
  let mockConfig: {
    get: ReturnType<typeof vi.fn>
    getNumber: ReturnType<typeof vi.fn>
    getBoolean: ReturnType<typeof vi.fn>
    getJson: ReturnType<typeof vi.fn>
    getGroup: ReturnType<typeof vi.fn>
    set: ReturnType<typeof vi.fn>
    invalidateCache: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Reset hoisted tx mocks so they are fresh each test
    hoisted.txOrderCreate.mockReset()
    hoisted.txAccountDeduct.mockReset()
    hoisted.txCartClearCart.mockReset()

    mockOrderRepo = {
      // Wire the DI-injected repo's create to the same fn used inside the transaction
      create: hoisted.txOrderCreate,
      findById: vi.fn(),
      findByTenant: vi.fn(),
      findAll: vi.fn(),
      updateStatus: vi.fn(),
      setCancelReason: vi.fn(),
    }
    mockCartRepo = {
      findByUser: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      // Wire clearCart to the same fn used inside the transaction
      clearCart: hoisted.txCartClearCart,
    }
    mockCatalogRepo = {
      findProducts: vi.fn(),
      findProductById: vi.fn(),
    }
    mockAccountRepo = {
      findByTenantId: vi.fn(),
      // Wire deduct to the same fn used inside the transaction
      deduct: hoisted.txAccountDeduct,
      refund: vi.fn(),
    }
    mockShipmentRepo = {
      findByOrderId: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
    }
    mockConfig = {
      get: vi.fn(),
      getNumber: vi.fn(),
      getBoolean: vi.fn(),
      getJson: vi.fn(),
      getGroup: vi.fn(),
      set: vi.fn(),
      invalidateCache: vi.fn(),
    }

    service = new OrderService(
      mockOrderRepo as unknown as IOrderRepository,
      mockCartRepo as unknown as ICartRepository,
      mockCatalogRepo as unknown as ICatalogRepository,
      mockAccountRepo as unknown as IAccountRepository,
      mockShipmentRepo as unknown as IShipmentRepository,
      mockConfig as unknown as IConfigService,
    )
  })

  // ---- Default config setup ----

  function setupDefaultConfig() {
    mockConfig.getBoolean.mockImplementation(
      (_group: string, key: string) => {
        if (key === 'auto_confirm_order') return Promise.resolve(false)
        if (key === 'allow_credit_order') return Promise.resolve(false)
        return Promise.resolve(false)
      },
    )
    mockConfig.getNumber.mockResolvedValue(0) // min_order_amount = 0
    mockConfig.get.mockResolvedValue('TWD')
    mockConfig.getJson.mockResolvedValue(['balance', 'bank_transfer'])
  }

  // ---- createOrder ----

  describe('createOrder', () => {
    it('should create order from cart items successfully', async () => {
      setupDefaultConfig()
      const cartItems = [makeCartItem()]
      mockCartRepo.findByUser.mockResolvedValue(cartItems)
      mockAccountRepo.findByTenantId.mockResolvedValue({
        id: 'acc-1',
        tenantId: 'tenant-1',
        balance: 5000,
        creditLimit: 0,
        currency: 'TWD',
      })
      const createdOrder = makeOrderVO()
      mockOrderRepo.create.mockResolvedValue(createdOrder)

      const result = await service.createOrder('tenant-1', 'user-1', {})

      expect(result).toEqual(createdOrder)
      expect(mockOrderRepo.create).toHaveBeenCalledOnce()
      expect(mockAccountRepo.deduct).toHaveBeenCalledWith('tenant-1', 1000, 'order-1', 'user-1')
      expect(mockCartRepo.clearCart).toHaveBeenCalledWith('tenant-1', 'user-1')
    })

    it('should throw BusinessRuleError when cart is empty', async () => {
      setupDefaultConfig()
      mockCartRepo.findByUser.mockResolvedValue([])

      await expect(
        service.createOrder('tenant-1', 'user-1', {}),
      ).rejects.toThrow(BusinessRuleError)

      await expect(
        service.createOrder('tenant-1', 'user-1', {}),
      ).rejects.toThrow('购物车为空')
    })

    it('should enforce minimum order amount from config', async () => {
      setupDefaultConfig()
      mockConfig.getNumber.mockResolvedValue(2000) // min amount = 2000
      const cartItems = [makeCartItem({ subtotal: 500 })] // total = 500 < 2000
      mockCartRepo.findByUser.mockResolvedValue(cartItems)

      await expect(
        service.createOrder('tenant-1', 'user-1', {}),
      ).rejects.toThrow(BusinessRuleError)

      await expect(
        service.createOrder('tenant-1', 'user-1', {}),
      ).rejects.toThrow('订单金额不能低于 2000')
    })

    it('should validate payment method against config', async () => {
      setupDefaultConfig()
      mockConfig.getJson.mockResolvedValue(['balance']) // only balance allowed
      const cartItems = [makeCartItem()]
      mockCartRepo.findByUser.mockResolvedValue(cartItems)

      await expect(
        service.createOrder('tenant-1', 'user-1', { paymentMethod: 'bank_transfer' }),
      ).rejects.toThrow(BusinessRuleError)

      await expect(
        service.createOrder('tenant-1', 'user-1', { paymentMethod: 'bank_transfer' }),
      ).rejects.toThrow('不支持的支付方式: bank_transfer')
    })

    it('should deduct balance for balance payment', async () => {
      setupDefaultConfig()
      const cartItems = [makeCartItem({ subtotal: 1000 })]
      mockCartRepo.findByUser.mockResolvedValue(cartItems)
      mockAccountRepo.findByTenantId.mockResolvedValue({
        id: 'acc-1',
        tenantId: 'tenant-1',
        balance: 5000,
        creditLimit: 0,
        currency: 'TWD',
      })
      const createdOrder = makeOrderVO({ id: 'order-99' })
      mockOrderRepo.create.mockResolvedValue(createdOrder)

      await service.createOrder('tenant-1', 'user-1', { paymentMethod: 'balance' })

      expect(mockAccountRepo.deduct).toHaveBeenCalledWith('tenant-1', 1000, 'order-99', 'user-1')
    })

    it('should not deduct balance for credit payment when allowed', async () => {
      setupDefaultConfig()
      mockConfig.getJson.mockResolvedValue(['balance', 'bank_transfer'])
      const cartItems = [makeCartItem()]
      mockCartRepo.findByUser.mockResolvedValue(cartItems)
      const createdOrder = makeOrderVO()
      mockOrderRepo.create.mockResolvedValue(createdOrder)

      await service.createOrder('tenant-1', 'user-1', { paymentMethod: 'bank_transfer' })

      expect(mockAccountRepo.deduct).not.toHaveBeenCalled()
    })

    it('should throw InsufficientBalanceError when balance insufficient and credit not allowed', async () => {
      setupDefaultConfig()
      const cartItems = [makeCartItem({ subtotal: 5000 })]
      mockCartRepo.findByUser.mockResolvedValue(cartItems)
      mockAccountRepo.findByTenantId.mockResolvedValue({
        id: 'acc-1',
        tenantId: 'tenant-1',
        balance: 1000, // only 1000, need 5000
        creditLimit: 0,
        currency: 'TWD',
      })

      await expect(
        service.createOrder('tenant-1', 'user-1', { paymentMethod: 'balance' }),
      ).rejects.toThrow(InsufficientBalanceError)
    })

    it('should allow order when balance plus credit limit covers total amount', async () => {
      setupDefaultConfig()
      mockConfig.getBoolean.mockImplementation(
        (_group: string, key: string) => {
          if (key === 'allow_credit_order') return Promise.resolve(true)
          return Promise.resolve(false)
        },
      )
      const cartItems = [makeCartItem({ subtotal: 3000 })]
      mockCartRepo.findByUser.mockResolvedValue(cartItems)
      mockAccountRepo.findByTenantId.mockResolvedValue({
        id: 'acc-1',
        tenantId: 'tenant-1',
        balance: 1000,
        creditLimit: 5000, // 1000 + 5000 = 6000 >= 3000
        currency: 'TWD',
      })
      const createdOrder = makeOrderVO()
      mockOrderRepo.create.mockResolvedValue(createdOrder)

      const result = await service.createOrder('tenant-1', 'user-1', { paymentMethod: 'balance' })

      expect(result).toEqual(createdOrder)
    })

    it('should throw BusinessRuleError when account does not exist', async () => {
      setupDefaultConfig()
      const cartItems = [makeCartItem()]
      mockCartRepo.findByUser.mockResolvedValue(cartItems)
      mockAccountRepo.findByTenantId.mockResolvedValue(null)

      await expect(
        service.createOrder('tenant-1', 'user-1', { paymentMethod: 'balance' }),
      ).rejects.toThrow('账户不存在，请联系总部')
    })

    it('should set order status to confirmed when auto_confirm_order is true', async () => {
      setupDefaultConfig()
      mockConfig.getBoolean.mockImplementation(
        (_group: string, key: string) => {
          if (key === 'auto_confirm_order') return Promise.resolve(true)
          return Promise.resolve(false)
        },
      )
      const cartItems = [makeCartItem()]
      mockCartRepo.findByUser.mockResolvedValue(cartItems)
      mockAccountRepo.findByTenantId.mockResolvedValue({
        id: 'acc-1',
        tenantId: 'tenant-1',
        balance: 5000,
        creditLimit: 0,
        currency: 'TWD',
      })
      mockOrderRepo.create.mockResolvedValue(makeOrderVO({ status: 'confirmed' }))

      await service.createOrder('tenant-1', 'user-1', {})

      const createCall = mockOrderRepo.create.mock.calls[0][0]
      expect(createCall.status).toBe('confirmed')
    })

    it('should clear cart after successful order creation', async () => {
      setupDefaultConfig()
      const cartItems = [makeCartItem()]
      mockCartRepo.findByUser.mockResolvedValue(cartItems)
      mockAccountRepo.findByTenantId.mockResolvedValue({
        id: 'acc-1',
        tenantId: 'tenant-1',
        balance: 5000,
        creditLimit: 0,
        currency: 'TWD',
      })
      mockOrderRepo.create.mockResolvedValue(makeOrderVO())

      await service.createOrder('tenant-1', 'user-1', {})

      expect(mockCartRepo.clearCart).toHaveBeenCalledWith('tenant-1', 'user-1')
    })
  })

  // ---- confirmOrder ----

  describe('confirmOrder', () => {
    it('should confirm a pending order', async () => {
      mockOrderRepo.findById.mockResolvedValue(makeOrderVO({ status: 'pending' }))

      await service.confirmOrder('order-1')

      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('order-1', 'confirmed')
    })

    it('should throw NotFoundError when order does not exist', async () => {
      mockOrderRepo.findById.mockResolvedValue(null)

      await expect(service.confirmOrder('missing')).rejects.toThrow('不存在')
    })

    it('should throw BusinessRuleError when order is not pending', async () => {
      mockOrderRepo.findById.mockResolvedValue(makeOrderVO({ status: 'confirmed' }))

      await expect(service.confirmOrder('order-1')).rejects.toThrow(
        '只能确认待处理的订单',
      )
    })
  })

  // ---- cancelOrder ----

  describe('cancelOrder', () => {
    it('should cancel a pending order without refund', async () => {
      mockOrderRepo.findById.mockResolvedValue(
        makeOrderVO({ status: 'pending', paymentMethod: 'balance' }),
      )

      await service.cancelOrder('order-1', 'changed mind', 'user-1')

      expect(mockOrderRepo.setCancelReason).toHaveBeenCalledWith('order-1', 'changed mind')
      expect(mockAccountRepo.refund).not.toHaveBeenCalled()
    })

    it('should cancel a confirmed balance order with refund', async () => {
      mockOrderRepo.findById.mockResolvedValue(
        makeOrderVO({
          status: 'confirmed',
          paymentMethod: 'balance',
          totalAmount: 2000,
          tenantId: 'tenant-1',
        }),
      )

      await service.cancelOrder('order-1', 'no longer needed', 'user-1')

      expect(mockOrderRepo.setCancelReason).toHaveBeenCalledWith('order-1', 'no longer needed')
      expect(mockAccountRepo.refund).toHaveBeenCalledWith('tenant-1', 2000, 'order-1', 'user-1')
    })

    it('should throw BusinessRuleError when order status does not allow cancellation', async () => {
      mockOrderRepo.findById.mockResolvedValue(makeOrderVO({ status: 'shipped' }))

      await expect(
        service.cancelOrder('order-1', 'reason', 'user-1'),
      ).rejects.toThrow('该订单状态不允许取消')
    })
  })

  // ---- shipOrder ----

  describe('shipOrder', () => {
    it('should ship a confirmed order with items', async () => {
      const order = makeOrderVO({
        status: 'confirmed',
        items: [{ id: 'item-1', productId: 'p1', variantId: 'v1', name: 'Prod', sku: 'S1', image: null, variantName: 'V1', specs: {}, price: 100, quantity: 5, subtotal: 500, remark: null }],
        shipments: [],
      })
      mockOrderRepo.findById.mockResolvedValue(order)
      const createdShipment = { id: 'shp-1', shipmentNo: 'SHP-001', orderId: 'order-1', carrier: 'DHL', trackingNo: 'TRACK-123', status: 'shipped', remark: null, items: [{ id: 'si-1', orderItemId: 'item-1', quantity: 5, name: 'Prod', sku: 'S1', image: null }], shippedAt: null, receivedAt: null, createdAt: '' }
      mockShipmentRepo.create.mockResolvedValue(createdShipment)
      mockShipmentRepo.findByOrderId.mockResolvedValue([createdShipment])

      const result = await service.shipOrder('order-1', {
        carrier: 'DHL',
        trackingNo: 'TRACK-123',
        items: [{ orderItemId: 'item-1', quantity: 5 }],
      })

      expect(result).toEqual(createdShipment)
      expect(mockShipmentRepo.create).toHaveBeenCalledOnce()
    })

    it('should throw BusinessRuleError when order is not confirmed or shipped', async () => {
      mockOrderRepo.findById.mockResolvedValue(makeOrderVO({ status: 'pending' }))

      await expect(
        service.shipOrder('order-1', { carrier: 'DHL', trackingNo: 'T-1', items: [{ orderItemId: 'item-1', quantity: 1 }] }),
      ).rejects.toThrow('只能发货已确认或部分发货的订单')
    })
  })

  // ---- confirmReceive ----

  describe('confirmReceive', () => {
    it('should confirm receipt of a shipment', async () => {
      await service.confirmReceive('shipment-1')

      expect(mockShipmentRepo.updateStatus).toHaveBeenCalledWith('shipment-1', 'received', 'receivedAt')
    })
  })
})

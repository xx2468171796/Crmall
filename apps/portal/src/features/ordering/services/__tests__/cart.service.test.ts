import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CartService } from '../ordering.service'
import type { ICartRepository, ICatalogRepository } from '../../repositories/ordering.repository.interface'
import type { IConfigService } from '@twcrm/shared'
import { NotFoundError, BusinessRuleError, InsufficientStockError } from '@twcrm/shared'
import type { CatalogProductVO, CartItemVO, ProductVariantVO } from '../../types/ordering.types'

// ---- Helpers ----

function makeVariant(overrides: Partial<ProductVariantVO> = {}): ProductVariantVO {
  return {
    id: 'var-1',
    sku: 'SKU-001-WHT',
    name: '白色',
    images: [],
    basePrice: null,
    stock: 100,
    moq: null,
    status: 'active',
    attributes: { '颜色': '白色' },
    tenantPrice: null,
    ...overrides,
  }
}

function makeProduct(overrides: Partial<CatalogProductVO> = {}): CatalogProductVO {
  return {
    id: 'prod-1',
    sku: 'SKU-001',
    name: 'Test Product',
    description: null,
    images: [],
    specs: null,
    brand: null,
    unit: '台',
    basePrice: 100,
    tenantPrice: null,
    currency: 'TWD',
    moq: 1,
    stock: 100,
    isCustom: false,
    customNote: null,
    status: 'active',
    categoryId: 'cat-1',
    categoryName: 'Category 1',
    variants: [makeVariant()],
    ...overrides,
  }
}

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

// ---- Test Suite ----

describe('CartService', () => {
  let service: CartService
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
    mockCartRepo = {
      findByUser: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
    }
    mockCatalogRepo = {
      findProducts: vi.fn(),
      findProductById: vi.fn(),
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

    service = new CartService(
      mockCartRepo as unknown as ICartRepository,
      mockCatalogRepo as unknown as ICatalogRepository,
      mockConfig as unknown as IConfigService,
    )
  })

  // ---- addToCart ----

  describe('addToCart', () => {
    it('should add item to cart successfully with SPU base price when no variant/tenant price', async () => {
      const product = makeProduct({ basePrice: 200, tenantPrice: null, variants: [makeVariant({ basePrice: null, tenantPrice: null })] })
      mockCatalogRepo.findProductById.mockResolvedValue(product)
      const expectedCartItem = makeCartItem({ price: 200 })
      mockCartRepo.addItem.mockResolvedValue(expectedCartItem)

      const result = await service.addToCart('tenant-1', 'user-1', {
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 5,
      })

      expect(result).toEqual(expectedCartItem)
      expect(mockCartRepo.addItem).toHaveBeenCalledWith(
        'tenant-1',
        'user-1',
        { productId: 'prod-1', variantId: 'var-1', quantity: 5 },
        200, // SPU base price used (fallback)
      )
    })

    it('should use variant tenant price when available (highest priority)', async () => {
      const product = makeProduct({
        basePrice: 200,
        tenantPrice: 180,
        variants: [makeVariant({ basePrice: 160, tenantPrice: 150 })],
      })
      mockCatalogRepo.findProductById.mockResolvedValue(product)
      mockCartRepo.addItem.mockResolvedValue(makeCartItem({ price: 150 }))

      await service.addToCart('tenant-1', 'user-1', {
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 5,
      })

      expect(mockCartRepo.addItem).toHaveBeenCalledWith(
        'tenant-1',
        'user-1',
        { productId: 'prod-1', variantId: 'var-1', quantity: 5 },
        150, // variant tenant price
      )
    })

    it('should use SPU tenant price when no variant tenant price', async () => {
      const product = makeProduct({
        basePrice: 200,
        tenantPrice: 180,
        variants: [makeVariant({ basePrice: 160, tenantPrice: null })],
      })
      mockCatalogRepo.findProductById.mockResolvedValue(product)
      mockCartRepo.addItem.mockResolvedValue(makeCartItem({ price: 180 }))

      await service.addToCart('tenant-1', 'user-1', {
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 5,
      })

      expect(mockCartRepo.addItem).toHaveBeenCalledWith(
        'tenant-1',
        'user-1',
        { productId: 'prod-1', variantId: 'var-1', quantity: 5 },
        180, // SPU tenant price
      )
    })

    it('should use variant base price when no tenant prices', async () => {
      const product = makeProduct({
        basePrice: 200,
        tenantPrice: null,
        variants: [makeVariant({ basePrice: 160, tenantPrice: null })],
      })
      mockCatalogRepo.findProductById.mockResolvedValue(product)
      mockCartRepo.addItem.mockResolvedValue(makeCartItem({ price: 160 }))

      await service.addToCart('tenant-1', 'user-1', {
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 5,
      })

      expect(mockCartRepo.addItem).toHaveBeenCalledWith(
        'tenant-1',
        'user-1',
        { productId: 'prod-1', variantId: 'var-1', quantity: 5 },
        160, // variant base price
      )
    })

    it('should throw NotFoundError when product does not exist', async () => {
      mockCatalogRepo.findProductById.mockResolvedValue(null)

      await expect(
        service.addToCart('tenant-1', 'user-1', {
          productId: 'nonexistent',
          variantId: 'var-1',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw NotFoundError when variant does not exist', async () => {
      const product = makeProduct()
      mockCatalogRepo.findProductById.mockResolvedValue(product)

      await expect(
        service.addToCart('tenant-1', 'user-1', {
          productId: 'prod-1',
          variantId: 'nonexistent',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw BusinessRuleError when product is inactive', async () => {
      const product = makeProduct({ status: 'inactive' })
      mockCatalogRepo.findProductById.mockResolvedValue(product)

      await expect(
        service.addToCart('tenant-1', 'user-1', {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 1,
        }),
      ).rejects.toThrow(BusinessRuleError)

      await expect(
        service.addToCart('tenant-1', 'user-1', {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 1,
        }),
      ).rejects.toThrow('该产品已下架')
    })

    it('should throw BusinessRuleError when variant is inactive', async () => {
      const product = makeProduct({ variants: [makeVariant({ status: 'inactive' })] })
      mockCatalogRepo.findProductById.mockResolvedValue(product)

      await expect(
        service.addToCart('tenant-1', 'user-1', {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 1,
        }),
      ).rejects.toThrow('该变体已下架')
    })

    it('should throw BusinessRuleError when quantity is below variant MOQ', async () => {
      const product = makeProduct({ moq: 1, variants: [makeVariant({ moq: 10 })] })
      mockCatalogRepo.findProductById.mockResolvedValue(product)

      await expect(
        service.addToCart('tenant-1', 'user-1', {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 5, // below variant moq of 10
        }),
      ).rejects.toThrow('最小起订量为 10')
    })

    it('should use SPU MOQ when variant MOQ is null', async () => {
      const product = makeProduct({ moq: 10, variants: [makeVariant({ moq: null })] })
      mockCatalogRepo.findProductById.mockResolvedValue(product)

      await expect(
        service.addToCart('tenant-1', 'user-1', {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 5, // below SPU moq of 10
        }),
      ).rejects.toThrow('最小起订量为 10')
    })

    it('should throw InsufficientStockError when quantity exceeds variant stock', async () => {
      const product = makeProduct({ stock: 100, name: 'Limited Product', variants: [makeVariant({ stock: 3 })] })
      mockCatalogRepo.findProductById.mockResolvedValue(product)

      await expect(
        service.addToCart('tenant-1', 'user-1', {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 10, // exceeds variant stock of 3
        }),
      ).rejects.toThrow(InsufficientStockError)
    })
  })

  // ---- getCart ----

  describe('getCart', () => {
    it('should return cart items for user', async () => {
      const items = [makeCartItem(), makeCartItem({ id: 'cart-2' })]
      mockCartRepo.findByUser.mockResolvedValue(items)

      const result = await service.getCart('tenant-1', 'user-1')

      expect(result).toEqual(items)
      expect(mockCartRepo.findByUser).toHaveBeenCalledWith('tenant-1', 'user-1')
    })

    it('should return empty array when cart is empty', async () => {
      mockCartRepo.findByUser.mockResolvedValue([])

      const result = await service.getCart('tenant-1', 'user-1')

      expect(result).toEqual([])
    })
  })

  // ---- updateCartItem ----

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      const updated = makeCartItem({ quantity: 20, subtotal: 2000 })
      mockCartRepo.updateItem.mockResolvedValue(updated)

      const result = await service.updateCartItem('cart-1', { quantity: 20 })

      expect(result).toEqual(updated)
      expect(mockCartRepo.updateItem).toHaveBeenCalledWith('cart-1', { quantity: 20 })
    })
  })

  // ---- removeCartItem ----

  describe('removeCartItem', () => {
    it('should remove cart item', async () => {
      mockCartRepo.removeItem.mockResolvedValue(undefined)

      await service.removeCartItem('cart-1')

      expect(mockCartRepo.removeItem).toHaveBeenCalledWith('cart-1')
    })
  })
})

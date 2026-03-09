import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CatalogService } from '../ordering.service'
import type { ICatalogRepository } from '../../repositories/ordering.repository.interface'
import type { IConfigService } from '@twcrm/shared'
import type { CatalogProductVO } from '../../types/ordering.types'
import type { PaginatedResult } from '@twcrm/shared'

// ---- Helpers ----

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
    variants: [],
    ...overrides,
  }
}

// ---- Test Suite ----

describe('CatalogService', () => {
  let service: CatalogService
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

    service = new CatalogService(
      mockCatalogRepo as unknown as ICatalogRepository,
      mockConfig as unknown as IConfigService,
    )
  })

  // ---- getProducts ----

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const products: PaginatedResult<CatalogProductVO> = {
        items: [makeProduct(), makeProduct({ id: 'prod-2', name: 'Product 2' })],
        total: 2,
        page: 1,
        perPage: 20,
        totalPages: 1,
      }
      mockCatalogRepo.findProducts.mockResolvedValue(products)

      const result = await service.getProducts('tenant-1', { page: 1, perPage: 20 })

      expect(result).toEqual(products)
      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(mockCatalogRepo.findProducts).toHaveBeenCalledWith('tenant-1', {
        page: 1,
        perPage: 20,
      })
    })

    it('should pass filter parameters to repository', async () => {
      const emptyResult: PaginatedResult<CatalogProductVO> = {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
        totalPages: 0,
      }
      mockCatalogRepo.findProducts.mockResolvedValue(emptyResult)

      await service.getProducts('tenant-1', {
        search: 'widget',
        categoryId: 'cat-2',
        status: 'active',
        page: 2,
        perPage: 10,
      })

      expect(mockCatalogRepo.findProducts).toHaveBeenCalledWith('tenant-1', {
        search: 'widget',
        categoryId: 'cat-2',
        status: 'active',
        page: 2,
        perPage: 10,
      })
    })
  })

  // ---- getProductById ----

  describe('getProductById', () => {
    it('should return product when found', async () => {
      const product = makeProduct()
      mockCatalogRepo.findProductById.mockResolvedValue(product)

      const result = await service.getProductById('prod-1', 'tenant-1')

      expect(result).toEqual(product)
      expect(mockCatalogRepo.findProductById).toHaveBeenCalledWith('prod-1', 'tenant-1')
    })

    it('should return null for non-existent product', async () => {
      mockCatalogRepo.findProductById.mockResolvedValue(null)

      const result = await service.getProductById('nonexistent', 'tenant-1')

      expect(result).toBeNull()
    })
  })
})

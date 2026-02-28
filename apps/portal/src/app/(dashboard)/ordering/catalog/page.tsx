'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Search, ShoppingCart, Plus, Minus, Package } from 'lucide-react'
import { useCatalog, useAddToCart } from '@/features/ordering/hooks/use-ordering'
import type { CatalogFilters, CatalogProductVO } from '@/features/ordering/types/ordering.types'

/** 产品目录页 — 网格卡片 + 搜索筛选 */
export default function CatalogPage() {
  const t = useTranslations('ordering')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<CatalogFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')

  const { data, isLoading } = useCatalog(filters)
  const products = data?.success ? data.data.items : []
  const total = data?.success ? data.data.total : 0
  const totalPages = data?.success ? data.data.totalPages : 0

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }, [search])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('catalog')}</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tc('all')} {total} {t('products')}
          </p>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={tc('search')}
            className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <button
          onClick={handleSearch}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          {tc('search')}
        </button>
      </div>

      {/* 产品网格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
          {tc('loading')}
        </div>
      ) : products.length === 0 ? (
        <EmptyState message={tc('no_data')} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <Pagination
              page={filters.page ?? 1}
              totalPages={totalPages}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          )}
        </>
      )}
    </div>
  )
}

/** 产品卡片组件 */
function ProductCard({ product }: { product: CatalogProductVO }) {
  const t = useTranslations('ordering')
  const [qty, setQty] = useState(product.moq || 1)
  const addToCart = useAddToCart()

  const price = product.tenantPrice ?? product.basePrice
  const inStock = product.stock > 0

  const handleAdd = () => {
    addToCart.mutate({ productId: product.id, quantity: qty })
  }

  return (
    <div className="group rounded-lg border bg-[var(--card)] shadow-sm hover:shadow-md transition-shadow">
      {/* 图片 */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-[var(--muted)]">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-[var(--muted-foreground)]" />
          </div>
        )}
        {product.isCustom && (
          <span className="absolute top-2 left-2 rounded bg-purple-600 px-2 py-0.5 text-xs text-white">
            {t('custom_product')}
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white">
              {t('out_of_stock')}
            </span>
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="p-4 flex flex-col gap-2">
        <p className="text-xs text-[var(--muted-foreground)]">{product.sku}</p>
        <h3 className="font-medium text-sm leading-tight line-clamp-2">{product.name}</h3>
        <p className="text-xs text-[var(--muted-foreground)]">{product.categoryName}</p>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-bold text-[#8b5cf6]">
            {product.currency} {price.toLocaleString()}
          </span>
          {product.tenantPrice && product.tenantPrice < product.basePrice && (
            <span className="text-xs text-[var(--muted-foreground)] line-through">
              {product.basePrice.toLocaleString()}
            </span>
          )}
        </div>

        <p className="text-xs text-[var(--muted-foreground)]">
          MOQ: {product.moq} · {t('stock')}: {product.stock}
        </p>

        {/* 加购操作 */}
        {inStock && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center rounded-md border">
              <button
                onClick={() => setQty(Math.max(product.moq || 1, qty - 1))}
                className="px-2 py-1 hover:bg-[var(--accent)]"
                aria-label="减少数量"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(product.moq || 1, Number(e.target.value) || 1))}
                className="w-12 border-x bg-transparent py-1 text-center text-sm outline-none"
                min={product.moq || 1}
              />
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="px-2 py-1 hover:bg-[var(--accent)]"
                aria-label="增加数量"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={addToCart.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-[#8b5cf6] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#7c3aed] disabled:opacity-50"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {t('add_to_cart')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** 空状态 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
      <Package className="h-12 w-12 mb-3" />
      <p>{message}</p>
    </div>
  )
}

/** 分页组件 */
function Pagination({
  page, totalPages, onPageChange,
}: {
  page: number; totalPages: number; onPageChange: (p: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
      >
        ‹
      </button>
      <span className="text-sm text-[var(--muted-foreground)]">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
      >
        ›
      </button>
    </div>
  )
}

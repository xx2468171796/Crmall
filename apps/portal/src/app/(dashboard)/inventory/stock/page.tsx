'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Package, Search, AlertTriangle } from 'lucide-react'
import { useStocks, useAdjustStock, useWarehouses } from '@/features/inventory/hooks/use-inventory'
import type { StockFilters, StockVO } from '@/features/inventory/types/inventory.types'

/** 库存总览页 */
export default function StockPage() {
  const t = useTranslations('inventory')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<StockFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState<StockVO | null>(null)

  const { data, isLoading } = useStocks({
    ...filters,
    search: search || undefined,
    warehouseId: warehouseId || undefined,
  })
  const { data: whData } = useWarehouses()
  const warehouses = whData?.success ? whData.data : []

  const stocks = data?.success ? data.data.items : []
  const total = data?.success ? data.data.total : 0
  const totalPages = data?.success ? data.data.totalPages : 0

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6" />
            {t('stock_overview')}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tc('all')} {total} {t('stock')}
          </p>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setFilters((f) => ({ ...f, page: 1 }))}
            placeholder={`${tc('search')} SKU / ${t('product_name')}...`}
            className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <select
          value={warehouseId}
          onChange={(e) => { setWarehouseId(e.target.value); setFilters((f) => ({ ...f, page: 1 })) }}
          className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">{tc('all')} {t('warehouse')}</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* 表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">{tc('loading')}</div>
      ) : stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <Package className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <StockTable
          stocks={stocks}
          t={t}
          tc={tc}
          onAdjust={(s) => { setAdjustTarget(s); setShowAdjust(true) }}
        />
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination page={filters.page ?? 1} totalPages={totalPages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
      )}

      {/* 库存调整弹窗 */}
      {showAdjust && adjustTarget && (
        <AdjustDialog
          stock={adjustTarget}
          t={t}
          tc={tc}
          onClose={() => { setShowAdjust(false); setAdjustTarget(null) }}
        />
      )}
    </div>
  )
}

/** 库存表格 */
function StockTable({ stocks, t, tc, onAdjust }: {
  stocks: StockVO[]
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onAdjust: (s: StockVO) => void
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-[var(--accent)] text-left">
          <tr>
            <th className="px-4 py-3 font-medium">{t('variant_sku')}</th>
            <th className="px-4 py-3 font-medium">{t('variant_name')}</th>
            <th className="px-4 py-3 font-medium">{t('product_name')}</th>
            <th className="px-4 py-3 font-medium">{t('warehouse')}</th>
            <th className="px-4 py-3 font-medium text-right">{t('quantity')}</th>
            <th className="px-4 py-3 font-medium text-right">{t('locked_qty')}</th>
            <th className="px-4 py-3 font-medium text-center">{tc('actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {stocks.map((s) => {
            const isLow = s.availableQty <= 0
            return (
              <tr key={s.id} className={isLow ? 'bg-red-50 dark:bg-red-950/20' : 'hover:bg-[var(--accent)]/50'}>
                <td className="px-4 py-3 font-mono text-xs">{s.variantSku}</td>
                <td className="px-4 py-3">{s.variantName ?? '-'}</td>
                <td className="px-4 py-3">{s.productName}</td>
                <td className="px-4 py-3">{s.warehouseName}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {isLow && <AlertTriangle className="inline h-4 w-4 text-red-500 mr-1" />}
                  {s.quantity}
                </td>
                <td className="px-4 py-3 text-right">{s.lockedQty}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onAdjust(s)}
                    className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90"
                  >
                    {t('adjust_stock')}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** 库存调整弹窗 */
function AdjustDialog({ stock, t, tc, onClose }: {
  stock: StockVO
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onClose: () => void
}) {
  const [qty, setQty] = useState(0)
  const [remark, setRemark] = useState('')
  const adjustMut = useAdjustStock()

  const handleSubmit = () => {
    adjustMut.mutate(
      { variantId: stock.variantId, warehouseId: stock.warehouseId, quantity: qty, remark },
      { onSuccess: (r) => { if (r.success) onClose() } },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-[var(--card)] p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{t('adjust_stock')}</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          {stock.variantSku} - {stock.productName} ({stock.warehouseName})
        </p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('adjust_quantity')}</span>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{tc('remark')}</span>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]">
            {tc('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={adjustMut.isPending || qty === 0}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {tc('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

/** 分页组件 */
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
      >
        &#8249;
      </button>
      <span className="text-sm text-[var(--muted-foreground)]">{page} / {totalPages}</span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
      >
        &#8250;
      </button>
    </div>
  )
}

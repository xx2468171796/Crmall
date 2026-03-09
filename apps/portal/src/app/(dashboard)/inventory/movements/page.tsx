'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { History } from 'lucide-react'
import { useStockMovements, useWarehouses } from '@/features/inventory/hooks/use-inventory'
import type { StockMovementFilters, StockMovementVO } from '@/features/inventory/types/inventory.types'

/** 变动类型颜色 */
const TYPE_COLORS: Record<string, string> = {
  in: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  out: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  adjust: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  transfer_in: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  transfer_out: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

/** 库存变动日志页 */
export default function MovementsPage() {
  const t = useTranslations('inventory')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<StockMovementFilters>({ page: 1, perPage: 20 })
  const [typeFilter, setTypeFilter] = useState('')
  const [warehouseId, setWarehouseId] = useState('')

  const { data, isLoading } = useStockMovements({
    ...filters,
    type: typeFilter || undefined,
    warehouseId: warehouseId || undefined,
  })
  const { data: whData } = useWarehouses()
  const warehouses = whData?.success ? whData.data : []

  const items = data?.success ? data.data.items : []
  const total = data?.success ? data.data.total : 0
  const totalPages = data?.success ? data.data.totalPages : 0
  const types = ['', 'in', 'out', 'adjust', 'transfer_in', 'transfer_out']

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6" />
          {t('stock_movements')}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {tc('all')} {total} {t('stock_movements')}
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3">
        <select
          value={warehouseId}
          onChange={(e) => { setWarehouseId(e.target.value); setFilters((f) => ({ ...f, page: 1 })) }}
          className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">{tc('all')} {t('warehouse')}</option>
          {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <div className="flex gap-1.5 flex-wrap">
          {types.map((tp) => (
            <button
              key={tp}
              onClick={() => { setTypeFilter(tp); setFilters((f) => ({ ...f, page: 1 })) }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === tp
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border hover:bg-[var(--accent)]'
              }`}
            >
              {tp === '' ? tc('all') : t(`type_${tp}`)}
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">{tc('loading')}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <History className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <MovementTable items={items} t={t} tc={tc} />
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))} disabled={(filters.page ?? 1) <= 1} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&#8249;</button>
          <span className="text-sm text-[var(--muted-foreground)]">{filters.page ?? 1} / {totalPages}</span>
          <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))} disabled={(filters.page ?? 1) >= totalPages} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&#8250;</button>
        </div>
      )}
    </div>
  )
}

/** 变动记录表格 */
function MovementTable({ items, t, tc }: {
  items: StockMovementVO[]
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-[var(--accent)] text-left">
          <tr>
            <th className="px-4 py-3 font-medium">{tc('created_at')}</th>
            <th className="px-4 py-3 font-medium">{t('variant_sku')}</th>
            <th className="px-4 py-3 font-medium">{t('warehouse')}</th>
            <th className="px-4 py-3 font-medium">{t('movement_type')}</th>
            <th className="px-4 py-3 font-medium text-right">{t('quantity')}</th>
            <th className="px-4 py-3 font-medium">{t('ref_type')}</th>
            <th className="px-4 py-3 font-medium">{t('ref_id')}</th>
            <th className="px-4 py-3 font-medium">{t('requested_by')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-[var(--accent)]/50">
              <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                {new Date(row.createdAt).toLocaleString('zh-CN')}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{row.variantSku}</td>
              <td className="px-4 py-3">{row.warehouseName}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[row.type] ?? 'bg-gray-100 text-gray-700'}`}>
                  {t(`type_${row.type}`)}
                </span>
              </td>
              <td className={`px-4 py-3 text-right font-semibold ${row.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {row.quantity > 0 ? '+' : ''}{row.quantity}
              </td>
              <td className="px-4 py-3 text-xs">{row.refType ?? '-'}</td>
              <td className="px-4 py-3 font-mono text-xs">{row.refId ?? '-'}</td>
              <td className="px-4 py-3 text-xs">{row.createdBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

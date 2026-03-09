'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRightLeft, Plus, Search, Check, Truck, PackageCheck } from 'lucide-react'
import {
  useTransferOrders, useCreateTransferOrder, useApproveTransferOrder,
  useShipTransferOrder, useReceiveTransferOrder, useWarehouses,
} from '@/features/inventory/hooks/use-inventory'
import type {
  TransferOrderFilters, TransferOrderVO, CreateTransferOrderDTO,
} from '@/features/inventory/types/inventory.types'

/** 调拨单状态色 */
const TRANSFER_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  shipping: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  received: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

/** 调拨单管理页 */
export default function TransfersPage() {
  const t = useTranslations('inventory')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<TransferOrderFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useTransferOrders({
    ...filters,
    search: search || undefined,
    status: statusFilter || undefined,
  })

  const orders = data?.success ? data.data.items : []
  const total = data?.success ? data.data.total : 0
  const totalPages = data?.success ? data.data.totalPages : 0

  const statuses = ['', 'draft', 'pending', 'approved', 'shipping', 'received', 'completed']

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6" />
            {t('transfer_orders')}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tc('all')} {total} {t('transfer_orders')}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {tc('create')}
        </button>
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
            placeholder={`${tc('search')} ${t('transfer_no')}...`}
            className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setFilters((f) => ({ ...f, page: 1 })) }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border hover:bg-[var(--accent)]'
              }`}
            >
              {s === '' ? tc('all') : t(`status_${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">{tc('loading')}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <ArrowRightLeft className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <TransferTable orders={orders} t={t} tc={tc} />
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))} disabled={(filters.page ?? 1) <= 1} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&#8249;</button>
          <span className="text-sm text-[var(--muted-foreground)]">{filters.page ?? 1} / {totalPages}</span>
          <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))} disabled={(filters.page ?? 1) >= totalPages} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&#8250;</button>
        </div>
      )}

      {/* 新建调拨单弹窗 */}
      {showCreate && <CreateTransferDialog t={t} tc={tc} onClose={() => setShowCreate(false)} />}
    </div>
  )
}

/** 调拨单表格 */
function TransferTable({ orders, t, tc }: {
  orders: TransferOrderVO[]
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
}) {
  const approveMut = useApproveTransferOrder()
  const shipMut = useShipTransferOrder()
  const receiveMut = useReceiveTransferOrder()

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-[var(--accent)] text-left">
          <tr>
            <th className="px-4 py-3 font-medium">{t('transfer_no')}</th>
            <th className="px-4 py-3 font-medium">{t('from_warehouse')}</th>
            <th className="px-4 py-3 font-medium"></th>
            <th className="px-4 py-3 font-medium">{t('to_warehouse')}</th>
            <th className="px-4 py-3 font-medium">{tc('status')}</th>
            <th className="px-4 py-3 font-medium">{tc('created_at')}</th>
            <th className="px-4 py-3 font-medium text-center">{tc('actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((to) => {
            const statusColor = TRANSFER_STATUS_COLORS[to.status] ?? TRANSFER_STATUS_COLORS.draft
            return (
              <tr key={to.id} className="hover:bg-[var(--accent)]/50">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{to.transferNo}</td>
                <td className="px-4 py-3">{to.fromWarehouseName}</td>
                <td className="px-4 py-3 text-center text-[var(--muted-foreground)]">&#8594;</td>
                <td className="px-4 py-3">{to.toWarehouseName}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                    {t(`status_${to.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                  {new Date(to.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {(to.status === 'draft' || to.status === 'pending') && (
                      <button
                        onClick={() => approveMut.mutate(to.id)}
                        disabled={approveMut.isPending}
                        className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" /> {t('approve')}
                      </button>
                    )}
                    {to.status === 'approved' && (
                      <button
                        onClick={() => shipMut.mutate(to.id)}
                        disabled={shipMut.isPending}
                        className="flex items-center gap-1 rounded-md bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700 disabled:opacity-50"
                      >
                        <Truck className="h-3 w-3" /> {t('ship')}
                      </button>
                    )}
                    {to.status === 'shipping' && (
                      <button
                        onClick={() => receiveMut.mutate(to.id)}
                        disabled={receiveMut.isPending}
                        className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <PackageCheck className="h-3 w-3" /> {t('receive')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** 新建调拨单弹窗 */
function CreateTransferDialog({ t, tc, onClose }: {
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onClose: () => void
}) {
  const createMut = useCreateTransferOrder()
  const { data: whData } = useWarehouses()
  const warehouses = whData?.success ? whData.data : []

  const [fromWarehouseId, setFromWarehouseId] = useState('')
  const [toWarehouseId, setToWarehouseId] = useState('')
  const [remark, setRemark] = useState('')
  const [items, setItems] = useState([{ variantId: '', quantity: 1 }])

  const addItem = () => setItems((prev) => [...prev, { variantId: '', quantity: 1 }])
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleSubmit = () => {
    const dto: CreateTransferOrderDTO = {
      fromWarehouseId,
      toWarehouseId,
      remark: remark || undefined,
      items: items.filter((i) => i.variantId),
    }
    createMut.mutate(dto, { onSuccess: (r) => { if (r.success) onClose() } })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
      <div className="w-full max-w-lg rounded-lg bg-[var(--card)] p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{tc('create')} {t('transfer_orders')}</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('from_warehouse')}</span>
            <select value={fromWarehouseId} onChange={(e) => setFromWarehouseId(e.target.value)} className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option value="">--</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('to_warehouse')}</span>
            <select value={toWarehouseId} onChange={(e) => setToWarehouseId(e.target.value)} className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option value="">--</option>
              {warehouses.filter((w) => w.id !== fromWarehouseId).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{tc('remark')}</span>
            <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          {/* 明细行 */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('variant_sku')}</span>
              <button onClick={addItem} className="text-xs text-[var(--primary)] hover:underline">+ {tc('create')}</button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  placeholder="Variant ID"
                  value={item.variantId}
                  onChange={(e) => updateItem(idx, 'variantId', e.target.value)}
                  className="flex-1 rounded-md border bg-[var(--background)] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <input
                  type="number"
                  placeholder={t('quantity')}
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                  className="w-20 rounded-md border bg-[var(--background)] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="text-red-500 text-xs hover:underline">{tc('delete')}</button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]">{tc('cancel')}</button>
          <button
            onClick={handleSubmit}
            disabled={createMut.isPending || !fromWarehouseId || !toWarehouseId}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {tc('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Plus, Search, Check, PackageCheck } from 'lucide-react'
import {
  usePurchaseOrders, useCreatePurchaseOrder, useApprovePurchaseOrder,
  useReceivePurchaseOrder, useWarehouses, useSuppliers,
} from '@/features/inventory/hooks/use-inventory'
import type {
  PurchaseOrderFilters, PurchaseOrderVO, CreatePurchaseOrderDTO,
} from '@/features/inventory/types/inventory.types'

/** 采购单状态色 */
const PO_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ordered: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  partial_received: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  received: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

/** 采购单管理页 */
export default function PurchaseOrdersPage() {
  const t = useTranslations('inventory')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<PurchaseOrderFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = usePurchaseOrders({
    ...filters,
    search: search || undefined,
    status: statusFilter || undefined,
  })

  const orders = data?.success ? data.data.items : []
  const total = data?.success ? data.data.total : 0
  const totalPages = data?.success ? data.data.totalPages : 0

  const statuses = ['', 'draft', 'approved', 'ordered', 'partial_received', 'received', 'completed']

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            {t('purchase_orders')}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tc('all')} {total} {t('purchase_orders')}
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
            placeholder={`${tc('search')} ${t('po_no')}...`}
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
          <ShoppingCart className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <POTable orders={orders} t={t} tc={tc} />
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))} disabled={(filters.page ?? 1) <= 1} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&#8249;</button>
          <span className="text-sm text-[var(--muted-foreground)]">{filters.page ?? 1} / {totalPages}</span>
          <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))} disabled={(filters.page ?? 1) >= totalPages} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&#8250;</button>
        </div>
      )}

      {/* 新建采购单弹窗 */}
      {showCreate && <CreatePODialog t={t} tc={tc} onClose={() => setShowCreate(false)} />}
    </div>
  )
}

/** 采购单表格 */
function POTable({ orders, t, tc }: {
  orders: PurchaseOrderVO[]
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
}) {
  const approveMut = useApprovePurchaseOrder()
  const receiveMut = useReceivePurchaseOrder()

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-[var(--accent)] text-left">
          <tr>
            <th className="px-4 py-3 font-medium">{t('po_no')}</th>
            <th className="px-4 py-3 font-medium">{t('supplier')}</th>
            <th className="px-4 py-3 font-medium">{t('warehouse')}</th>
            <th className="px-4 py-3 font-medium text-right">{t('total_amount')}</th>
            <th className="px-4 py-3 font-medium">{tc('status')}</th>
            <th className="px-4 py-3 font-medium">{t('expected_date')}</th>
            <th className="px-4 py-3 font-medium text-center">{tc('actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((po) => {
            const statusColor = PO_STATUS_COLORS[po.status] ?? PO_STATUS_COLORS.draft
            return (
              <tr key={po.id} className="hover:bg-[var(--accent)]/50">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{po.poNo}</td>
                <td className="px-4 py-3">{po.supplierName}</td>
                <td className="px-4 py-3">{po.warehouseId}</td>
                <td className="px-4 py-3 text-right font-semibold">{po.currency} {po.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                    {t(`status_${po.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                  {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString('zh-CN') : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {po.status === 'draft' && (
                      <button
                        onClick={() => approveMut.mutate(po.id)}
                        disabled={approveMut.isPending}
                        className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" /> {t('approve')}
                      </button>
                    )}
                    {(po.status === 'approved' || po.status === 'ordered' || po.status === 'partial_received') && (
                      <button
                        onClick={() => receiveMut.mutate({
                          id: po.id,
                          items: po.items.map((i) => ({ itemId: i.id, receivedQty: i.quantity - i.receivedQty })),
                        })}
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

/** 新建采购单弹窗 */
function CreatePODialog({ t, tc, onClose }: {
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onClose: () => void
}) {
  const createMut = useCreatePurchaseOrder()
  const { data: whData } = useWarehouses()
  const { data: supData } = useSuppliers({ page: 1, perPage: 100 })

  const warehouses = whData?.success ? whData.data : []
  const suppliers = supData?.success ? supData.data.items : []

  const [supplierId, setSupplierId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [remark, setRemark] = useState('')
  const [items, setItems] = useState([{ variantId: '', quantity: 1, unitPrice: 0 }])

  const addItem = () => setItems((prev) => [...prev, { variantId: '', quantity: 1, unitPrice: 0 }])
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleSubmit = () => {
    const dto: CreatePurchaseOrderDTO = {
      supplierId,
      warehouseId,
      expectedDate: expectedDate || undefined,
      remark: remark || undefined,
      items: items.filter((i) => i.variantId),
    }
    createMut.mutate(dto, { onSuccess: (r) => { if (r.success) onClose() } })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
      <div className="w-full max-w-lg rounded-lg bg-[var(--card)] p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{tc('create')} {t('purchase_orders')}</h2>
        <div className="flex flex-col gap-3">
          {/* 供应商 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('supplier')}</span>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option value="">--</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          {/* 入库仓库 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('warehouse')}</span>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option value="">--</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </label>
          {/* 预计到货 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('expected_date')}</span>
            <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          {/* 备注 */}
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
                <input
                  type="number"
                  placeholder={t('total_amount')}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                  className="w-24 rounded-md border bg-[var(--background)] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--ring)]"
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
            disabled={createMut.isPending || !supplierId || !warehouseId}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {tc('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

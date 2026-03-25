'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ClipboardList, Search, ChevronRight, Building2 } from 'lucide-react'
import { useOrders, useConfirmOrder } from '@/features/ordering/hooks/use-ordering'
import type { OrderFilters, OrderVO } from '@/features/ordering/types/ordering.types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function PlatformOrdersPage() {
  const t = useTranslations('ordering')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<OrderFilters>({ page: 1, perPage: 20 })
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useOrders({
    ...filters,
    status: statusFilter || undefined,
    search: search || undefined,
  })

  const orders = data?.success ? data.data.items : []
  const total = data?.success ? data.data.total : 0
  const totalPages = data?.success ? data.data.totalPages : 0

  const statuses = ['', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled']

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          {t('platform_orders')}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {tc('all')} {total} {t('orders')}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setFilters((f) => ({ ...f, page: 1 }))}
            placeholder={`${tc('search')} ${t('order_no')}...`}
            className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div className="flex gap-1.5">
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

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
          {tc('loading')}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <ClipboardList className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <PlatformOrderRow key={order.id} order={order} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            disabled={(filters.page ?? 1) <= 1}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
          >
            &lsaquo;
          </button>
          <span className="text-sm text-[var(--muted-foreground)]">
            {filters.page ?? 1} / {totalPages}
          </span>
          <button
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            disabled={(filters.page ?? 1) >= totalPages}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
          >
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  )
}

function PlatformOrderRow({ order }: { order: OrderVO }) {
  const t = useTranslations('ordering')
  const tc = useTranslations('common')
  const confirmOrder = useConfirmOrder()
  const statusColor = STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="group flex items-center gap-4 rounded-lg border bg-[var(--card)] p-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <Link href={`/platform/orders/${order.id}`} className="font-mono text-sm font-semibold hover:text-[#8b5cf6] hover:underline">
            {order.orderNo}
          </Link>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
            {t(`status_${order.status}`)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
          <span>{tc('created_at')}: {new Date(order.createdAt).toLocaleDateString('zh-CN')}</span>
          <span>{order.items.length} {t('products')}</span>
          <span>Tenant: {order.tenantId.slice(0, 8)}...</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-[#8b5cf6]">
          {order.currency} {order.totalAmount.toLocaleString()}
        </p>
      </div>

      {order.status === 'pending' && (
        <button
          onClick={() => confirmOrder.mutate(order.id)}
          disabled={confirmOrder.isPending}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 shrink-0"
        >
          {t('confirm_order')}
        </button>
      )}

      <Link
        href={`/platform/orders/${order.id}`}
        className="shrink-0"
      >
        <ChevronRight className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
      </Link>
    </div>
  )
}

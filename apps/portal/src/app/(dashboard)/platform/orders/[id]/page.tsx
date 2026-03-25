'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  ArrowLeft, Package, Truck, CheckCircle2, XCircle, Clock,
  FileText, Send,
} from 'lucide-react'
import {
  useOrderDetail, useConfirmOrder, useShipOrder, useCancelOrder,
} from '@/features/ordering/hooks/use-ordering'
import type { OrderVO, OrderItemVO, ShipmentVO } from '@/features/ordering/types/ordering.types'

const ORDER_STEPS = ['pending', 'confirmed', 'shipped', 'completed'] as const

export default function PlatformOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const t = useTranslations('ordering')
  const tc = useTranslations('common')
  const router = useRouter()

  const { data, isLoading } = useOrderDetail(id)
  const order = data?.success ? data.data : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
        {tc('loading')}
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
        <p>{tc('no_data')}</p>
        <Link href="/platform/orders" className="mt-4 text-sm text-[#8b5cf6] hover:underline">
          {tc('back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-md p-1.5 hover:bg-[var(--accent)]"
          aria-label={tc('back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {t('order_detail')} #{order.orderNo}
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            {tc('created_at')}: {new Date(order.createdAt).toLocaleString('zh-CN')}
            &nbsp;|&nbsp;Tenant: {order.tenantId.slice(0, 8)}...
          </p>
        </div>
      </div>

      {order.status !== 'cancelled' && <OrderProgress status={order.status} />}

      {order.status === 'cancelled' && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-400">{t('status_cancelled')}</p>
            {order.cancelReason && (
              <p className="text-sm text-red-600 dark:text-red-400/80 mt-1">{order.cancelReason}</p>
            )}
          </div>
        </div>
      )}

      {/* 商品列表 */}
      <section className="rounded-lg border bg-[var(--card)] shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('products')} ({order.items.length})
          </h2>
        </div>
        <div className="divide-y">
          {order.items.map((item) => (
            <ItemRow key={item.id} item={item} order={order} />
          ))}
        </div>
        <div className="border-t px-4 py-3 flex justify-end">
          <div className="text-right">
            <span className="text-sm text-[var(--muted-foreground)]">{t('total_amount')}: </span>
            <span className="text-xl font-bold text-[#8b5cf6]">
              {order.currency} {order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* 发货表单 */}
      {['confirmed', 'shipped'].includes(order.status) && (
        <ShipForm order={order} />
      )}

      {/* 物流历史 */}
      {order.shipments.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4" />
            {t('shipment')} ({order.shipments.length})
          </h2>
          {order.shipments.map((s) => (
            <ShipmentCard key={s.id} shipment={s} />
          ))}
        </section>
      )}

      {/* 备注 */}
      {order.remark && (
        <section className="rounded-lg border bg-[var(--card)] p-4 shadow-sm">
          <h2 className="font-semibold flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            {tc('remark')}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">{order.remark}</p>
        </section>
      )}

      {/* 操作区 */}
      <PlatformActions order={order} />
    </div>
  )
}

function OrderProgress({ status }: { status: string }) {
  const t = useTranslations('ordering')
  const currentIdx = ORDER_STEPS.indexOf(status as typeof ORDER_STEPS[number])
  const icons = [Clock, CheckCircle2, Truck, CheckCircle2]

  return (
    <div className="flex items-center justify-between rounded-lg border bg-[var(--card)] p-4 shadow-sm">
      {ORDER_STEPS.map((step, idx) => {
        const Icon = icons[idx]
        const isActive = idx <= currentIdx
        const isCurrent = idx === currentIdx
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isCurrent
                    ? 'bg-[#8b5cf6] text-white'
                    : isActive
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs ${isCurrent ? 'font-semibold' : 'text-[var(--muted-foreground)]'}`}>
                {t(`status_${step}`)}
              </span>
            </div>
            {idx < ORDER_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  idx < currentIdx ? 'bg-green-400' : 'bg-[var(--border)]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ItemRow({ item, order }: { item: OrderItemVO; order: OrderVO }) {
  // 计算已发货数量
  const shippedQty = order.shipments
    .flatMap((s) => s.items)
    .filter((si) => si.orderItemId === item.id)
    .reduce((sum, si) => sum + si.quantity, 0)

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[var(--muted)]">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-6 w-6 text-[var(--muted-foreground)]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{item.sku}</p>
        {item.variantName && (
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{item.variantName}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm">
          x {item.quantity}
          {shippedQty > 0 && (
            <span className="text-xs text-green-600 ml-1">({shippedQty} shipped)</span>
          )}
        </p>
        <p className="text-sm font-semibold">NT$ {item.subtotal.toLocaleString()}</p>
      </div>
    </div>
  )
}

/** 发货表单 */
function ShipForm({ order }: { order: OrderVO }) {
  const t = useTranslations('ordering')
  const tc = useTranslations('common')
  const shipOrder = useShipOrder()

  const [carrier, setCarrier] = useState('')
  const [trackingNo, setTrackingNo] = useState('')
  const [remark, setRemark] = useState('')
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})

  // 计算每个项的剩余可发数量
  const remainingMap = new Map<string, number>()
  for (const item of order.items) {
    const shippedQty = order.shipments
      .flatMap((s) => s.items)
      .filter((si) => si.orderItemId === item.id)
      .reduce((sum, si) => sum + si.quantity, 0)
    remainingMap.set(item.id, item.quantity - shippedQty)
  }

  const hasRemaining = Array.from(remainingMap.values()).some((v) => v > 0)
  if (!hasRemaining) return null

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      if (prev[itemId] !== undefined) {
        const next = { ...prev }
        delete next[itemId]
        return next
      }
      return { ...prev, [itemId]: remainingMap.get(itemId) ?? 0 }
    })
  }

  const selectAll = () => {
    const all: Record<string, number> = {}
    for (const item of order.items) {
      const remaining = remainingMap.get(item.id) ?? 0
      if (remaining > 0) all[item.id] = remaining
    }
    setSelectedItems(all)
  }

  const handleShip = () => {
    const items = Object.entries(selectedItems)
      .filter(([, qty]) => qty > 0)
      .map(([orderItemId, quantity]) => ({ orderItemId, quantity }))
    if (items.length === 0) return
    shipOrder.mutate({
      orderId: order.id,
      carrier,
      trackingNo,
      remark: remark || undefined,
      items,
    })
  }

  const canSubmit = carrier.trim() && trackingNo.trim() && Object.keys(selectedItems).length > 0

  return (
    <section className="rounded-lg border bg-[var(--card)] p-4 shadow-sm">
      <h2 className="font-semibold flex items-center gap-2 mb-4">
        <Send className="h-4 w-4" />
        {t('ship_order')}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <div>
          <label className="text-xs text-[var(--muted-foreground)] mb-1 block">{t('carrier')}</label>
          <input
            type="text"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="e.g. 黑貓宅急便"
            className="w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted-foreground)] mb-1 block">{t('tracking_no')}</label>
          <input
            type="text"
            value={trackingNo}
            onChange={(e) => setTrackingNo(e.target.value)}
            placeholder="e.g. TW123456789"
            className="w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="text-xs text-[var(--muted-foreground)] mb-1 block">{tc('remark')}</label>
        <input
          type="text"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          className="w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {/* 选择发货项 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[var(--muted-foreground)]">{t('select_ship_items')}</label>
          <button
            onClick={selectAll}
            className="text-xs text-[#8b5cf6] hover:underline"
          >
            {tc('select_all')}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => {
            const remaining = remainingMap.get(item.id) ?? 0
            if (remaining <= 0) return null
            const isSelected = selectedItems[item.id] !== undefined
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-md border p-2 cursor-pointer transition-colors ${
                  isSelected ? 'border-[#8b5cf6] bg-violet-50 dark:bg-violet-950/20' : 'hover:bg-[var(--accent)]'
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleItem(item.id)}
                  className="h-4 w-4 accent-[#8b5cf6]"
                />
                <span className="flex-1 text-sm truncate">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {t('remaining')}: {remaining}
                  </span>
                  {isSelected && (
                    <input
                      type="number"
                      min={1}
                      max={remaining}
                      value={selectedItems[item.id] ?? remaining}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const v = Math.min(Math.max(1, Number(e.target.value)), remaining)
                        setSelectedItems((prev) => ({ ...prev, [item.id]: v }))
                      }}
                      className="w-16 rounded border bg-[var(--background)] px-2 py-1 text-sm text-center outline-none focus:ring-1 focus:ring-[var(--ring)]"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleShip}
        disabled={!canSubmit || shipOrder.isPending}
        className="flex items-center gap-2 rounded-md bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] disabled:opacity-50"
      >
        <Truck className="h-4 w-4" />
        {t('ship_order')}
      </button>
    </section>
  )
}

function ShipmentCard({ shipment }: { shipment: ShipmentVO }) {
  const t = useTranslations('ordering')

  const statusColors: Record<string, string> = {
    shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    in_transit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    delivered: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    received: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  }

  return (
    <div className="rounded-lg border bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-mono font-semibold">{shipment.shipmentNo}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[shipment.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {t(`shipment_status_${shipment.status}`)}
        </span>
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-2 mb-3">
        {shipment.carrier && (
          <div>
            <span className="text-[var(--muted-foreground)]">{t('carrier')}: </span>
            <span className="font-medium">{shipment.carrier}</span>
          </div>
        )}
        {shipment.trackingNo && (
          <div>
            <span className="text-[var(--muted-foreground)]">{t('tracking_no')}: </span>
            <span className="font-mono font-medium">{shipment.trackingNo}</span>
          </div>
        )}
        {shipment.shippedAt && (
          <div>
            <span className="text-[var(--muted-foreground)]">{t('shipped_at')}: </span>
            <span>{new Date(shipment.shippedAt).toLocaleString('zh-CN')}</span>
          </div>
        )}
        {shipment.receivedAt && (
          <div>
            <span className="text-[var(--muted-foreground)]">{t('received_at')}: </span>
            <span>{new Date(shipment.receivedAt).toLocaleString('zh-CN')}</span>
          </div>
        )}
      </div>
      {shipment.items.length > 0 && (
        <div className="border-t pt-2">
          <div className="flex flex-col gap-1">
            {shipment.items.map((si) => (
              <div key={si.id} className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-[var(--muted)]">
                  {si.image ? (
                    <img src={si.image} alt={si.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </div>
                  )}
                </div>
                <span className="flex-1 truncate">{si.name}</span>
                <span className="text-[var(--muted-foreground)]">x {si.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlatformActions({ order }: { order: OrderVO }) {
  const t = useTranslations('ordering')
  const tc = useTranslations('common')
  const confirmOrder = useConfirmOrder()
  const cancelOrder = useCancelOrder()
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const canConfirm = order.status === 'pending'
  const canCancel = ['pending', 'confirmed'].includes(order.status)

  if (!canConfirm && !canCancel) return null

  return (
    <div className="flex flex-wrap gap-3">
      {canConfirm && (
        <button
          onClick={() => confirmOrder.mutate(order.id)}
          disabled={confirmOrder.isPending}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t('confirm_order')}
        </button>
      )}

      {canCancel && !showCancel && (
        <button
          onClick={() => setShowCancel(true)}
          className="flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <XCircle className="h-4 w-4" />
          {t('cancel_order')}
        </button>
      )}

      {showCancel && (
        <div className="flex w-full items-center gap-2">
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder={t('cancel_reason')}
            className="flex-1 rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <button
            onClick={() => {
              cancelOrder.mutate({ id: order.id, reason: cancelReason })
              setShowCancel(false)
            }}
            disabled={!cancelReason.trim() || cancelOrder.isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {tc('confirm')}
          </button>
          <button
            onClick={() => setShowCancel(false)}
            className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]"
          >
            {tc('cancel')}
          </button>
        </div>
      )}
    </div>
  )
}

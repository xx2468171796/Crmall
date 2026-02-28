'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  ArrowLeft, Package, Truck, CheckCircle2, XCircle, Clock,
  MapPin, FileText,
} from 'lucide-react'
import { useOrderDetail, useCancelOrder, useConfirmReceive } from '@/features/ordering/hooks/use-ordering'
import type { OrderVO, OrderItemVO, ShipmentVO } from '@/features/ordering/types/ordering.types'

/** 订单状态步骤 */
const ORDER_STEPS = ['pending', 'confirmed', 'shipped', 'completed'] as const

/** 订单详情页 */
export default function OrderDetailPage() {
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
        <Link href="/ordering/orders" className="mt-4 text-sm text-[#8b5cf6] hover:underline">
          {tc('back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* 返回 + 标题 */}
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
          </p>
        </div>
      </div>

      {/* 状态进度条 */}
      {order.status !== 'cancelled' && <OrderProgress status={order.status} />}

      {/* 取消状态 */}
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
            <OrderItemRow key={item.id} item={item} />
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

      {/* 物流信息 */}
      {order.shipment && <ShipmentCard shipment={order.shipment} />}

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

      {/* 操作按钮 */}
      <OrderActions order={order} />
    </div>
  )
}

/** 订单进度条 */
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

/** 商品行 */
function OrderItemRow({ item }: { item: OrderItemVO }) {
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
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm">× {item.quantity}</p>
        <p className="text-sm font-semibold">NT$ {item.subtotal.toLocaleString()}</p>
      </div>
    </div>
  )
}

/** 物流卡片 */
function ShipmentCard({ shipment }: { shipment: ShipmentVO }) {
  const t = useTranslations('ordering')
  return (
    <section className="rounded-lg border bg-[var(--card)] p-4 shadow-sm">
      <h2 className="font-semibold flex items-center gap-2 mb-3">
        <Truck className="h-4 w-4" />
        {t('shipment')}
      </h2>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
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
    </section>
  )
}

/** 操作按钮区 */
function OrderActions({ order }: { order: OrderVO }) {
  const t = useTranslations('ordering')
  const tc = useTranslations('common')
  const cancelOrder = useCancelOrder()
  const confirmReceive = useConfirmReceive()
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const canCancel = order.status === 'pending'
  const canReceive = order.status === 'shipped'

  if (!canCancel && !canReceive) return null

  return (
    <div className="flex flex-wrap gap-3">
      {canReceive && (
        <button
          onClick={() => confirmReceive.mutate(order.id)}
          disabled={confirmReceive.isPending}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t('confirm_receive')}
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

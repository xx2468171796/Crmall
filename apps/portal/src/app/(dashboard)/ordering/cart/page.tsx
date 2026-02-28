'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, Minus, Plus, Package, ArrowRight } from 'lucide-react'
import {
  useCart, useUpdateCartItem, useRemoveCartItem,
  useCreateOrder, useAccount,
} from '@/features/ordering/hooks/use-ordering'
import type { CartItemVO } from '@/features/ordering/types/ordering.types'

/** 购物车页 */
export default function CartPage() {
  const t = useTranslations('ordering')
  const tc = useTranslations('common')
  const router = useRouter()

  const { data, isLoading } = useCart()
  const { data: accountData } = useAccount()
  const createOrder = useCreateOrder()

  const items = data?.success ? data.data : []
  const account = accountData?.success ? accountData.data : null
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)

  const [remark, setRemark] = useState('')

  const handlePlaceOrder = () => {
    createOrder.mutate({ remark: remark || undefined }, {
      onSuccess: (r) => {
        if (r.success) router.push(`/ordering/orders/${r.data.id}`)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
        {tc('loading')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          {t('cart')}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {items.length} {t('products')}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyCart message={t('empty_cart')} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左侧 — 购物车列表 */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* 右侧 — 结算面板 */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-lg border bg-[var(--card)] p-6 shadow-sm">
              <h2 className="font-semibold mb-4">{t('order_summary')}</h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">{t('subtotal')}</span>
                  <span className="font-medium">NT$ {totalAmount.toLocaleString()}</span>
                </div>

                {account && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">{t('balance')}</span>
                      <span className="font-medium">NT$ {account.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">{t('credit_limit')}</span>
                      <span className="font-medium">NT$ {account.creditLimit.toLocaleString()}</span>
                    </div>
                  </>
                )}

                <hr className="border-[var(--border)]" />

                <div className="flex justify-between text-base font-bold">
                  <span>{t('total_amount')}</span>
                  <span className="text-[#8b5cf6]">NT$ {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* 备注 */}
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={tc('remark')}
                rows={2}
                className="mt-4 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />

              {/* 提交按钮 */}
              <button
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending || items.length === 0}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-md bg-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7c3aed] disabled:opacity-50"
              >
                {createOrder.isPending ? tc('loading') : (
                  <>
                    {t('place_order')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** 购物车行项 */
function CartItemRow({ item }: { item: CartItemVO }) {
  const t = useTranslations('ordering')
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const handleQtyChange = (newQty: number) => {
    const qty = Math.max(item.moq || 1, Math.min(item.stock, newQty))
    updateItem.mutate({ id: item.id, quantity: qty })
  }

  return (
    <div className="flex gap-4 rounded-lg border bg-[var(--card)] p-4 shadow-sm">
      {/* 图片 */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--muted)]">
        {item.productImage ? (
          <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-8 w-8 text-[var(--muted-foreground)]" />
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <h3 className="font-medium text-sm truncate">{item.productName}</h3>
          <p className="text-xs text-[var(--muted-foreground)]">{item.productSku}</p>
        </div>
        <p className="text-sm font-semibold text-[#8b5cf6]">
          {t('unit_price')}: NT$ {item.price.toLocaleString()}
        </p>
      </div>

      {/* 数量控制 */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem.mutate(item.id)}
          disabled={removeItem.isPending}
          className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
          aria-label="删除"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <div className="flex items-center rounded-md border">
          <button
            onClick={() => handleQtyChange(item.quantity - 1)}
            className="px-2 py-1 hover:bg-[var(--accent)]"
            aria-label="减少"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-10 text-center text-sm">{item.quantity}</span>
          <button
            onClick={() => handleQtyChange(item.quantity + 1)}
            className="px-2 py-1 hover:bg-[var(--accent)]"
            aria-label="增加"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <p className="text-sm font-bold">NT$ {item.subtotal.toLocaleString()}</p>
      </div>
    </div>
  )
}

/** 空购物车 */
function EmptyCart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
      <ShoppingCart className="h-16 w-16 mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  )
}

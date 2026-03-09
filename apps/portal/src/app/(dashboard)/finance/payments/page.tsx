'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Banknote, Search, Plus, X } from 'lucide-react'
import { usePayments, useCreatePayment, useConfirmPayment, useRefundPayment } from '@/features/finance/hooks/use-finance'
import type { PaymentFilters, PaymentVO, CreatePaymentDTO } from '@/features/finance/types/finance.types'

/** 状态色 */
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  refunded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

/** 方式色 */
const METHOD_COLORS: Record<string, string> = {
  cash: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  transfer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  check: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  credit_card: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  online: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
}

export default function PaymentsPage() {
  const t = useTranslations('finance')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<PaymentFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = usePayments({ ...filters, search: search || undefined, status: statusFilter || undefined })
  const confirmMut = useConfirmPayment()
  const refundMut = useRefundPayment()

  const items = data?.success ? data.data.items : []
  const totalPages = data?.success ? data.data.totalPages : 0

  const statuses = ['', 'pending', 'confirmed', 'refunded']

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Banknote className="h-6 w-6" />
            {t('payments')}
          </h1>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90">
          <Plus className="h-4 w-4" /> {tc('create')}
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setFilters((f) => ({ ...f, page: 1 }))} placeholder={`${tc('search')} ${t('payment_no')}...`} className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
        </div>
        <div className="flex gap-1.5">
          {statuses.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setFilters((f) => ({ ...f, page: 1 })) }} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border hover:bg-[var(--accent)]'}`}>
              {s === '' ? tc('all') : t(`status_${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">{tc('loading')}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <Banknote className="h-12 w-12 mb-3" /><p>{tc('no_data')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent)] text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t('payment_no')}</th>
                <th className="px-4 py-3 font-medium">{t('amount')}</th>
                <th className="px-4 py-3 font-medium">{t('currency')}</th>
                <th className="px-4 py-3 font-medium">{t('paid_at')}</th>
                <th className="px-4 py-3 font-medium">{t('method')}</th>
                <th className="px-4 py-3 font-medium">{tc('status')}</th>
                <th className="px-4 py-3 font-medium">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((row: PaymentVO) => (
                <tr key={row.id} className="hover:bg-[var(--accent)]/50">
                  <td className="px-4 py-3 font-mono text-xs">{row.paymentNo}</td>
                  <td className="px-4 py-3 font-semibold">NT$ {row.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.currency}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{new Date(row.paidAt).toLocaleDateString('zh-TW')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${METHOD_COLORS[row.method] ?? 'bg-gray-100 text-gray-700'}`}>{t(`method_${row.method}`)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-700'}`}>{t(`status_${row.status}`)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {row.status === 'pending' && (
                        <button onClick={() => confirmMut.mutate(row.id)} className="rounded px-2 py-1 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">{t('confirm_payment')}</button>
                      )}
                      {row.status === 'confirmed' && (
                        <button onClick={() => refundMut.mutate(row.id)} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">{t('refund')}</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))} disabled={(filters.page ?? 1) <= 1} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&lsaquo;</button>
          <span className="text-sm text-[var(--muted-foreground)]">{filters.page ?? 1} / {totalPages}</span>
          <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))} disabled={(filters.page ?? 1) >= totalPages} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&rsaquo;</button>
        </div>
      )}

      {/* 新建收款 dialog */}
      {showForm && <PaymentFormDialog onClose={() => setShowForm(false)} />}
    </div>
  )
}

/** 新建收款表单 */
function PaymentFormDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations('finance')
  const tc = useTranslations('common')
  const createMut = useCreatePayment()

  const [form, setForm] = useState<CreatePaymentDTO>({
    amount: 0, currency: 'TWD', paidAt: new Date().toISOString().slice(0, 10), method: 'transfer',
  })

  const handleSubmit = () => {
    createMut.mutate(form, { onSuccess: (r) => { if (r.success) onClose() } })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-[var(--card)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{tc('create')} {t('payments')}</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">{t('amount')}
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('currency')}
            <input type="text" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('paid_at')}
            <input type="date" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('method')}
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]">
              {['cash', 'transfer', 'check', 'credit_card', 'online'].map((m) => (
                <option key={m} value={m}>{t(`method_${m}`)}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">{t('bank_ref')}
            <input type="text" value={form.bankRef ?? ''} onChange={(e) => setForm({ ...form, bankRef: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('note')}
            <input type="text" value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]">{tc('cancel')}</button>
          <button onClick={handleSubmit} disabled={createMut.isPending} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50">{tc('confirm')}</button>
        </div>
      </div>
    </div>
  )
}

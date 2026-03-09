'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FileText, Search, Plus, X } from 'lucide-react'
import { useInvoices, useCreateInvoice, useIssueInvoice, useVoidInvoice } from '@/features/finance/hooks/use-finance'
import type { InvoiceFilters, InvoiceVO, CreateInvoiceDTO } from '@/features/finance/types/finance.types'

/** 状态色 */
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  issued: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  void: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  overdue: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export default function InvoicesPage() {
  const t = useTranslations('finance')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<InvoiceFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useInvoices({ ...filters, search: search || undefined, type: typeFilter || undefined, status: statusFilter || undefined })
  const issueMut = useIssueInvoice()
  const voidMut = useVoidInvoice()

  const items = data?.success ? data.data.items : []
  const totalPages = data?.success ? data.data.totalPages : 0

  const types = ['', 'issued', 'received']
  const statuses = ['', 'draft', 'issued', 'paid', 'void', 'overdue']

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {t('invoices')}
          </h1>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90">
          <Plus className="h-4 w-4" /> {tc('create')}
        </button>
      </div>

      {/* 类型 tab */}
      <div className="flex gap-1.5">
        {types.map((tp) => (
          <button key={tp} onClick={() => { setTypeFilter(tp); setFilters((f) => ({ ...f, page: 1 })) }} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${typeFilter === tp ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border hover:bg-[var(--accent)]'}`}>
            {tp === '' ? t('all_types') : t(`type_${tp}`)}
          </button>
        ))}
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setFilters((f) => ({ ...f, page: 1 }))} placeholder={`${tc('search')} ${t('invoice_no')}...`} className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
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
          <FileText className="h-12 w-12 mb-3" /><p>{tc('no_data')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent)] text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t('invoice_no')}</th>
                <th className="px-4 py-3 font-medium">{t('invoice_type')}</th>
                <th className="px-4 py-3 font-medium">{t('counterpart')}</th>
                <th className="px-4 py-3 font-medium">{t('amount')}</th>
                <th className="px-4 py-3 font-medium">{t('tax_amount')}</th>
                <th className="px-4 py-3 font-medium">{t('total_amount')}</th>
                <th className="px-4 py-3 font-medium">{tc('status')}</th>
                <th className="px-4 py-3 font-medium">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((row: InvoiceVO) => (
                <tr key={row.id} className="hover:bg-[var(--accent)]/50">
                  <td className="px-4 py-3 font-mono text-xs">{row.invoiceNo}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.type === 'issued' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'}`}>
                      {t(`type_${row.type}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.counterpart}</td>
                  <td className="px-4 py-3">NT$ {row.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">NT$ {row.taxAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold">NT$ {row.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-700'}`}>{t(`status_${row.status}`)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {row.status === 'draft' && (
                        <button onClick={() => issueMut.mutate(row.id)} className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">{t('issue_invoice')}</button>
                      )}
                      {(row.status === 'draft' || row.status === 'issued') && (
                        <button onClick={() => voidMut.mutate(row.id)} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">{t('void_invoice')}</button>
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

      {/* 新建发票 dialog */}
      {showForm && <InvoiceFormDialog onClose={() => setShowForm(false)} />}
    </div>
  )
}

/** 新建发票表单 */
function InvoiceFormDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations('finance')
  const tc = useTranslations('common')
  const createMut = useCreateInvoice()

  const [form, setForm] = useState<CreateInvoiceDTO>({
    type: 'issued', counterpart: '', amount: 0, taxRate: 0.05,
    issueDate: new Date().toISOString().slice(0, 10),
  })

  /** 自动计算税额 */
  const taxAmount = Math.round(form.amount * (form.taxRate ?? 0.05))
  const totalAmount = form.amount + taxAmount

  const handleSubmit = () => {
    createMut.mutate(form, { onSuccess: (r) => { if (r.success) onClose() } })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-[var(--card)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{tc('create')} {t('invoices')}</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">{t('invoice_type')}
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]">
              <option value="issued">{t('type_issued')}</option>
              <option value="received">{t('type_received')}</option>
            </select>
          </label>
          <label className="text-sm font-medium">{t('counterpart')}
            <input type="text" value={form.counterpart} onChange={(e) => setForm({ ...form, counterpart: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('amount')}
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('tax_rate')}
            <input type="number" step="0.01" value={form.taxRate ?? 0.05} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          {/* 自动计算结果 */}
          <div className="flex justify-between text-sm text-[var(--muted-foreground)] border-t pt-2">
            <span>{t('tax_amount')}: NT$ {taxAmount.toLocaleString()}</span>
            <span className="font-semibold">{t('total_amount')}: NT$ {totalAmount.toLocaleString()}</span>
          </div>
          <label className="text-sm font-medium">{t('issue_date')}
            <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('due_date')}
            <input type="date" value={form.dueDate ?? ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
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

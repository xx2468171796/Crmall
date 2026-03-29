'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { TrendingUp, Search, Plus, X, ChevronDown } from 'lucide-react'
import {
  useOpportunities, useCreateOpportunity, useUpdateOpportunity,
  useUpdateOpportunityStage, useDeleteOpportunity,
} from '@/features/crm/hooks/use-crm'
import type { OpportunityFilters, OpportunityVO, CreateOpportunityDTO } from '@/features/crm/types/crm.types'

/** 阶段色 */
const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  qualified: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  proposal: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  negotiation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

export default function OpportunitiesPage() {
  const t = useTranslations('crm')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<OpportunityFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<OpportunityVO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OpportunityVO | null>(null)
  const [stagePopup, setStagePopup] = useState<string | null>(null)

  const { data, isLoading } = useOpportunities({
    ...filters,
    search: search || undefined,
    stage: stageFilter || undefined,
  })
  const stageMut = useUpdateOpportunityStage()
  const deleteMut = useDeleteOpportunity()

  const items = data?.success ? data.data.items : []
  const totalPages = data?.success ? data.data.totalPages : 0

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, { onSuccess: (r) => { if (r.success) setDeleteTarget(null) } })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          {t('opportunities')}
        </h1>
        <button
          type="button"
          onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> {t('new_opportunity')}
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setFilters((f) => ({ ...f, page: 1 }))}
            placeholder={`${tc('search')} ${t('opportunity_title')}...`}
            className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['', ...STAGES] as string[]).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => { setStageFilter(s); setFilters((f) => ({ ...f, page: 1 })) }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${stageFilter === s ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border hover:bg-[var(--accent)]'}`}
            >
              {s === '' ? tc('all') : t(`stage_${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">{tc('loading')}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <TrendingUp className="h-12 w-12 mb-3" /><p>{tc('no_data')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent)] text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t('opportunity_title')}</th>
                <th className="px-4 py-3 font-medium">{t('opportunity_customer')}</th>
                <th className="px-4 py-3 font-medium">{t('opportunity_amount')}</th>
                <th className="px-4 py-3 font-medium">{t('opportunity_stage')}</th>
                <th className="px-4 py-3 font-medium">{t('opportunity_probability')}</th>
                <th className="px-4 py-3 font-medium">{t('opportunity_expected_date')}</th>
                <th className="px-4 py-3 font-medium">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((row: OpportunityVO) => (
                <tr key={row.id} className="hover:bg-[var(--accent)]/50">
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{row.customerName}</td>
                  <td className="px-4 py-3 font-semibold">NT$ {row.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {/* Quick stage change */}
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => setStagePopup(stagePopup === row.id ? null : row.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[row.stage] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {t(`stage_${row.stage}`)}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {stagePopup === row.id && (
                        <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-md border bg-[var(--card)] shadow-lg" onClick={(e) => e.stopPropagation()}>
                          {STAGES.map((s) => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => {
                                stageMut.mutate({ id: row.id, stage: s })
                                setStagePopup(null)
                              }}
                              className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--accent)] ${row.stage === s ? 'font-semibold' : ''}`}
                            >
                              {t(`stage_${s}`)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.probability}%</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {row.expectedDate ? new Date(row.expectedDate).toLocaleDateString('zh-TW') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setEditTarget(row); setShowForm(true) }}
                        className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                      >{tc('edit')}</button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      >{tc('delete')}</button>
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
          <button type="button" onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))} disabled={(filters.page ?? 1) <= 1} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&lsaquo;</button>
          <span className="text-sm text-[var(--muted-foreground)]">{filters.page ?? 1} / {totalPages}</span>
          <button type="button" onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))} disabled={(filters.page ?? 1) >= totalPages} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]">&rsaquo;</button>
        </div>
      )}

      {/* 关闭 stage popup 的蒙层 */}
      {stagePopup && (
        <div className="fixed inset-0 z-[5]" onClick={() => setStagePopup(null)} />
      )}

      {/* 新建/编辑商机 dialog */}
      {showForm && (
        <OpportunityFormDialog
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}

      {/* 删除确认 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm rounded-lg bg-[var(--card)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-3">{tc('confirm_delete')}</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">{t('delete_opportunity_confirm')}</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]">{tc('cancel')}</button>
              <button type="button" onClick={handleDelete} disabled={deleteMut.isPending} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{tc('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** 新建/编辑商机表单 */
function OpportunityFormDialog({ initial, onClose }: { initial: OpportunityVO | null; onClose: () => void }) {
  const t = useTranslations('crm')
  const tc = useTranslations('common')
  const createMut = useCreateOpportunity()
  const updateMut = useUpdateOpportunity()

  const [form, setForm] = useState<CreateOpportunityDTO>({
    title: initial?.title ?? '',
    customerId: initial?.customerId ?? '',
    amount: initial?.amount ?? 0,
    currency: initial?.currency ?? 'TWD',
    stage: initial?.stage ?? 'lead',
    probability: initial?.probability ?? 10,
    expectedDate: initial?.expectedDate ?? '',
    source: initial?.source ?? '',
    ownerId: initial?.ownerId ?? '',
    remark: initial?.remark ?? '',
  })

  const handleSubmit = () => {
    const payload = {
      ...form,
      expectedDate: form.expectedDate || undefined,
      source: form.source || undefined,
      remark: form.remark || undefined,
    }
    if (initial) {
      updateMut.mutate({ id: initial.id, data: payload }, { onSuccess: (r) => { if (r.success) onClose() } })
    } else {
      createMut.mutate(payload, { onSuccess: (r) => { if (r.success) onClose() } })
    }
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg bg-[var(--card)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{initial ? t('edit_opportunity') : t('new_opportunity')}</h2>
          <button type="button" title={tc('close')} onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 text-sm font-medium">{t('opportunity_title')}
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('opportunity_customer')}
            <input type="text" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('opportunity_amount')}
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('opportunity_stage')}
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]">
              {STAGES.map((s) => <option key={s} value={s}>{t(`stage_${s}`)}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">{t('opportunity_probability')} (%)
            <input type="number" min={0} max={100} value={form.probability} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">{t('opportunity_expected_date')}
            <input type="date" value={form.expectedDate ?? ''} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">source
            <input type="text" value={form.source ?? ''} onChange={(e) => setForm({ ...form, source: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="text-sm font-medium">ownerId
            <input type="text" value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
          <label className="col-span-2 text-sm font-medium">{tc('remark')}
            <input type="text" value={form.remark ?? ''} onChange={(e) => setForm({ ...form, remark: e.target.value })} className="mt-1 w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]">{tc('cancel')}</button>
          <button type="button" onClick={handleSubmit} disabled={isPending} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50">{tc('confirm')}</button>
        </div>
      </div>
    </div>
  )
}

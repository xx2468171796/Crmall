'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import {
  useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier,
} from '@/features/inventory/hooks/use-inventory'
import type { SupplierVO, CreateSupplierDTO, UpdateSupplierDTO } from '@/features/inventory/types/inventory.types'

/** 供应商管理页 */
export default function SuppliersPage() {
  const t = useTranslations('inventory')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<SupplierVO | null>(null)

  const { data, isLoading } = useSuppliers({ ...filters, search: search || undefined })
  const deleteMut = useDeleteSupplier()

  const suppliers = data?.success ? data.data.items : []
  const total = data?.success ? data.data.total : 0
  const totalPages = data?.success ? data.data.totalPages : 0

  const handleDelete = (id: string) => {
    if (confirm(tc('confirm_delete'))) deleteMut.mutate(id)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            {t('suppliers')}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tc('all')} {total} {t('supplier')}
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {tc('create')}
        </button>
      </div>

      {/* 搜索 */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setFilters((f) => ({ ...f, page: 1 }))}
          placeholder={`${tc('search')} ${t('supplier_name')}...`}
          className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {/* 表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">{tc('loading')}</div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <Users className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <SupplierTable
          suppliers={suppliers}
          t={t}
          tc={tc}
          onEdit={(s) => { setEditTarget(s); setShowForm(true) }}
          onDelete={(id) => handleDelete(id)}
        />
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            disabled={filters.page <= 1}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
          >&#8249;</button>
          <span className="text-sm text-[var(--muted-foreground)]">{filters.page} / {totalPages}</span>
          <button
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            disabled={filters.page >= totalPages}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
          >&#8250;</button>
        </div>
      )}

      {/* 表单弹窗 */}
      {showForm && (
        <SupplierFormDialog
          supplier={editTarget}
          t={t}
          tc={tc}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}
    </div>
  )
}

/** 供应商表格 */
function SupplierTable({ suppliers, t, tc, onEdit, onDelete }: {
  suppliers: SupplierVO[]
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onEdit: (s: SupplierVO) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-[var(--accent)] text-left">
          <tr>
            <th className="px-4 py-3 font-medium">{t('supplier_name')}</th>
            <th className="px-4 py-3 font-medium">{t('contact')}</th>
            <th className="px-4 py-3 font-medium">{t('phone')}</th>
            <th className="px-4 py-3 font-medium">{t('email')}</th>
            <th className="px-4 py-3 font-medium">{tc('status')}</th>
            <th className="px-4 py-3 font-medium text-center">{tc('actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {suppliers.map((s) => (
            <tr key={s.id} className="hover:bg-[var(--accent)]/50">
              <td className="px-4 py-3 font-medium">{s.name}</td>
              <td className="px-4 py-3">{s.contact ?? '-'}</td>
              <td className="px-4 py-3">{s.phone ?? '-'}</td>
              <td className="px-4 py-3">{s.email ?? '-'}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  s.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {s.status === 'active' ? t('status_active') : t('status_inactive')}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => onEdit(s)} className="rounded-md border px-2 py-1 text-xs hover:bg-[var(--accent)]">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => onDelete(s.id)} className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** 供应商表单弹窗 */
function SupplierFormDialog({ supplier, t, tc, onClose }: {
  supplier: SupplierVO | null
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onClose: () => void
}) {
  const isEdit = !!supplier
  const createMut = useCreateSupplier()
  const updateMut = useUpdateSupplier()

  const [form, setForm] = useState({
    name: supplier?.name ?? '',
    contact: supplier?.contact ?? '',
    phone: supplier?.phone ?? '',
    email: supplier?.email ?? '',
    address: supplier?.address ?? '',
  })

  const handleSubmit = () => {
    if (isEdit) {
      const dto: UpdateSupplierDTO = { ...form }
      updateMut.mutate({ id: supplier.id, dto }, { onSuccess: (r) => { if (r.success) onClose() } })
    } else {
      const dto: CreateSupplierDTO = { ...form }
      createMut.mutate(dto, { onSuccess: (r) => { if (r.success) onClose() } })
    }
  }

  const isPending = createMut.isPending || updateMut.isPending
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-[var(--card)] p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? tc('edit') : tc('create')} {t('supplier')}</h2>
        <div className="flex flex-col gap-3">
          <FormField label={t('supplier_name')} value={form.name} onChange={(v) => set('name', v)} />
          <FormField label={t('contact')} value={form.contact} onChange={(v) => set('contact', v)} />
          <FormField label={t('phone')} value={form.phone} onChange={(v) => set('phone', v)} />
          <FormField label={t('email')} value={form.email} onChange={(v) => set('email', v)} />
          <FormField label={t('address')} value={form.address} onChange={(v) => set('address', v)} />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]">{tc('cancel')}</button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !form.name}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {tc('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />
    </label>
  )
}

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Warehouse, Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import {
  useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse,
} from '@/features/inventory/hooks/use-inventory'
import type { WarehouseVO, CreateWarehouseDTO, UpdateWarehouseDTO } from '@/features/inventory/types/inventory.types'

/** 仓库管理页 */
export default function WarehousesPage() {
  const t = useTranslations('inventory')
  const tc = useTranslations('common')

  const { data, isLoading } = useWarehouses()
  const warehouses = data?.success ? data.data : []
  const deleteMut = useDeleteWarehouse()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<WarehouseVO | null>(null)

  const handleDelete = (id: string) => {
    if (confirm(tc('confirm_delete'))) deleteMut.mutate(id)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Warehouse className="h-6 w-6" />
            {t('warehouses')}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tc('all')} {warehouses.length} {t('warehouse')}
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

      {/* 仓库卡片列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">{tc('loading')}</div>
      ) : warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <Warehouse className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((w) => (
            <WarehouseCard
              key={w.id}
              warehouse={w}
              t={t}
              tc={tc}
              onEdit={() => { setEditTarget(w); setShowForm(true) }}
              onDelete={() => handleDelete(w.id)}
            />
          ))}
        </div>
      )}

      {/* 新建/编辑弹窗 */}
      {showForm && (
        <WarehouseFormDialog
          warehouse={editTarget}
          t={t}
          tc={tc}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}
    </div>
  )
}

/** 仓库卡片 */
function WarehouseCard({ warehouse, t, tc, onEdit, onDelete }: {
  warehouse: WarehouseVO
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onEdit: () => void
  onDelete: () => void
}) {
  const isActive = warehouse.status === 'active'
  return (
    <div className="rounded-lg border bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{warehouse.name}</h3>
          <p className="text-xs text-[var(--muted-foreground)] font-mono">{warehouse.code}</p>
        </div>
        <div className="flex items-center gap-2">
          {warehouse.isMain && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {t('main_warehouse')}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {isActive ? t('status_active') : t('status_inactive')}
          </span>
        </div>
      </div>
      {warehouse.address && (
        <p className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-1">
          <MapPin className="h-3 w-3" />
          {warehouse.address}
        </p>
      )}
      {warehouse.contact && (
        <p className="text-xs text-[var(--muted-foreground)]">
          {t('contact')}: {warehouse.contact} {warehouse.phone && `/ ${warehouse.phone}`}
        </p>
      )}
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
        <button onClick={onEdit} className="rounded-md border px-3 py-1 text-xs hover:bg-[var(--accent)] flex items-center gap-1">
          <Pencil className="h-3 w-3" /> {tc('edit')}
        </button>
        <button onClick={onDelete} className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 flex items-center gap-1">
          <Trash2 className="h-3 w-3" /> {tc('delete')}
        </button>
      </div>
    </div>
  )
}

/** 仓库表单弹窗 */
function WarehouseFormDialog({ warehouse, t, tc, onClose }: {
  warehouse: WarehouseVO | null
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onClose: () => void
}) {
  const isEdit = !!warehouse
  const createMut = useCreateWarehouse()
  const updateMut = useUpdateWarehouse()

  const [form, setForm] = useState({
    name: warehouse?.name ?? '',
    code: warehouse?.code ?? '',
    address: warehouse?.address ?? '',
    contact: warehouse?.contact ?? '',
    phone: warehouse?.phone ?? '',
    isMain: warehouse?.isMain ?? false,
  })

  const handleSubmit = () => {
    if (isEdit) {
      const dto: UpdateWarehouseDTO = { name: form.name, address: form.address, contact: form.contact, phone: form.phone, isMain: form.isMain }
      updateMut.mutate({ id: warehouse.id, dto }, { onSuccess: (r) => { if (r.success) onClose() } })
    } else {
      const dto: CreateWarehouseDTO = { name: form.name, code: form.code, address: form.address, contact: form.contact, phone: form.phone, isMain: form.isMain }
      createMut.mutate(dto, { onSuccess: (r) => { if (r.success) onClose() } })
    }
  }

  const isPending = createMut.isPending || updateMut.isPending
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-[var(--card)] p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? tc('edit') : tc('create')} {t('warehouse')}</h2>
        <div className="flex flex-col gap-3">
          <FormField label={t('warehouse_name')} value={form.name} onChange={(v) => set('name', v)} />
          {!isEdit && <FormField label={t('warehouse_code')} value={form.code} onChange={(v) => set('code', v)} />}
          <FormField label={t('address')} value={form.address} onChange={(v) => set('address', v)} />
          <FormField label={t('contact')} value={form.contact} onChange={(v) => set('contact', v)} />
          <FormField label={t('phone')} value={form.phone} onChange={(v) => set('phone', v)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isMain} onChange={(e) => set('isMain', e.target.checked)} />
            {t('main_warehouse')}
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]">{tc('cancel')}</button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !form.name || (!isEdit && !form.code)}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {tc('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

/** 表单输入项 */
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

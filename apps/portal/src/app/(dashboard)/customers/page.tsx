'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Users, Search, Plus, Pencil, Trash2 } from 'lucide-react'
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/features/crm/hooks/use-crm'
import type { CustomerVO, CustomerFilters } from '@/features/crm/types/crm.types'
import type { CreateCustomerInput } from '@/features/crm/schemas/crm.schema'

/** 客户管理页 */
export default function CustomersPage() {
  const t = useTranslations('crm')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<CustomerFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<CustomerVO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomerVO | null>(null)

  const { data, isLoading } = useCustomers({
    ...filters,
    search: search || undefined,
    status: statusFilter || undefined,
    level: levelFilter || undefined,
    source: sourceFilter || undefined,
  })

  const customers = data?.success ? data.data.items : []
  const total = data?.success ? data.data.total : 0
  const totalPages = data?.success ? data.data.totalPages : 0

  const deleteMut = useDeleteCustomer()

  const applyFilters = () => setFilters((f) => ({ ...f, page: 1 }))

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            {t('customers')}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tc('all')} {total} {t('customer_unit')}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t('new_customer')}
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
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder={`${tc('search')} ${t('customer_name')}...`}
            className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); applyFilters() }}
          className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">{tc('all')} {tc('status')}</option>
          <option value="active">{t('status_active')}</option>
          <option value="inactive">{t('status_inactive')}</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); applyFilters() }}
          className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">{tc('all')} {t('customer_level')}</option>
          <option value="vip">{t('level_vip')}</option>
          <option value="gold">{t('level_gold')}</option>
          <option value="silver">{t('level_silver')}</option>
          <option value="normal">{t('level_normal')}</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); applyFilters() }}
          className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">{tc('all')} {t('customer_source')}</option>
          <option value="referral">{t('source_referral')}</option>
          <option value="website">{t('source_website')}</option>
          <option value="exhibition">{t('source_exhibition')}</option>
          <option value="cold_call">{t('source_cold_call')}</option>
        </select>
      </div>

      {/* 表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">{tc('loading')}</div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <Users className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <CustomerTable
          customers={customers}
          t={t}
          tc={tc}
          onEdit={(c) => setEditTarget(c)}
          onDelete={(c) => setDeleteTarget(c)}
        />
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <Pagination page={filters.page ?? 1} totalPages={totalPages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
      )}

      {/* 新增弹窗 */}
      {showCreate && (
        <CustomerFormDialog
          t={t}
          tc={tc}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* 编辑弹窗 */}
      {editTarget && (
        <CustomerFormDialog
          customer={editTarget}
          t={t}
          tc={tc}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <DeleteDialog
          customer={deleteTarget}
          t={t}
          tc={tc}
          isPending={deleteMut.isPending}
          onConfirm={() => {
            deleteMut.mutate(deleteTarget.id, {
              onSuccess: (r) => { if (r.success) setDeleteTarget(null) },
            })
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

/** 客户表格 */
function CustomerTable({ customers, t, tc, onEdit, onDelete }: {
  customers: CustomerVO[]
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onEdit: (c: CustomerVO) => void
  onDelete: (c: CustomerVO) => void
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-[var(--accent)] text-left">
          <tr>
            <th className="px-4 py-3 font-medium">{t('customer_name')}</th>
            <th className="px-4 py-3 font-medium">{t('customer_type')}</th>
            <th className="px-4 py-3 font-medium">{t('customer_level')}</th>
            <th className="px-4 py-3 font-medium">{t('customer_phone')}</th>
            <th className="px-4 py-3 font-medium">{t('customer_email')}</th>
            <th className="px-4 py-3 font-medium">{tc('status')}</th>
            <th className="px-4 py-3 font-medium text-center">{tc('actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-[var(--accent)]/50">
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs">
                  {c.type === 'company' ? t('company') : t('personal')}
                </span>
              </td>
              <td className="px-4 py-3">
                <LevelBadge level={c.level} t={t} />
              </td>
              <td className="px-4 py-3 text-[var(--muted-foreground)]">{c.phone ?? '-'}</td>
              <td className="px-4 py-3 text-[var(--muted-foreground)]">{c.email ?? '-'}</td>
              <td className="px-4 py-3">
                <StatusBadge status={c.status} t={t} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="rounded-md border px-2.5 py-1 text-xs hover:bg-[var(--accent)] flex items-center gap-1"
                  >
                    <Pencil className="h-3 w-3" />
                    {tc('edit')}
                  </button>
                  <button
                    onClick={() => onDelete(c)}
                    className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    {tc('delete')}
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

/** 等级徽章 */
function LevelBadge({ level, t }: { level: string; t: ReturnType<typeof useTranslations> }) {
  const styles: Record<string, string> = {
    vip: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300',
    silver: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    normal: 'bg-[var(--accent)] text-[var(--muted-foreground)]',
  }
  const labelMap: Record<string, string> = {
    vip: t('level_vip'),
    gold: t('level_gold'),
    silver: t('level_silver'),
    normal: t('level_normal'),
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[level] ?? styles.normal}`}>
      {labelMap[level] ?? level}
    </span>
  )
}

/** 状态徽章 */
function StatusBadge({ status, t }: { status: string; t: ReturnType<typeof useTranslations> }) {
  const isActive = status === 'active'
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isActive
      ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
      : 'bg-[var(--accent)] text-[var(--muted-foreground)]'
    }`}>
      {isActive ? t('status_active') : t('status_inactive')}
    </span>
  )
}

/** 新增/编辑表单弹窗 */
function CustomerFormDialog({ customer, t, tc, onClose }: {
  customer?: CustomerVO
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  onClose: () => void
}) {
  const createMut = useCreateCustomer()
  const updateMut = useUpdateCustomer()
  const isPending = createMut.isPending || updateMut.isPending
  const isEdit = !!customer

  const [form, setForm] = useState<CreateCustomerInput>({
    name: customer?.name ?? '',
    type: (customer?.type as 'company' | 'individual') ?? 'company',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    industry: customer?.industry ?? '',
    source: customer?.source ?? '',
    level: customer?.level ?? 'normal',
    address: customer?.address ?? '',
    city: customer?.city ?? '',
    region: customer?.region ?? '',
    remark: customer?.remark ?? '',
  })

  const set = (key: keyof CreateCustomerInput, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = () => {
    if (!form.name.trim()) return
    if (isEdit && customer) {
      updateMut.mutate(
        { id: customer.id, data: form },
        { onSuccess: (r) => { if (r.success) onClose() } },
      )
    } else {
      createMut.mutate(form, {
        onSuccess: (r) => { if (r.success) onClose() },
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-[var(--card)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? t('edit_customer') : t('new_customer')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* 客户名称 */}
          <label className="col-span-2 flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_name')} *</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          {/* 类型 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_type')}</span>
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="company">{t('company')}</option>
              <option value="individual">{t('personal')}</option>
            </select>
          </label>
          {/* 等级 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_level')}</span>
            <select
              value={form.level}
              onChange={(e) => set('level', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="vip">{t('level_vip')}</option>
              <option value="gold">{t('level_gold')}</option>
              <option value="silver">{t('level_silver')}</option>
              <option value="normal">{t('level_normal')}</option>
            </select>
          </label>
          {/* 电话 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_phone')}</span>
            <input
              type="text"
              value={form.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          {/* 邮箱 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_email')}</span>
            <input
              type="email"
              value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          {/* 行业 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_industry')}</span>
            <input
              type="text"
              value={form.industry ?? ''}
              onChange={(e) => set('industry', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          {/* 来源 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_source')}</span>
            <select
              value={form.source ?? ''}
              onChange={(e) => set('source', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">{tc('none')}</option>
              <option value="referral">{t('source_referral')}</option>
              <option value="website">{t('source_website')}</option>
              <option value="exhibition">{t('source_exhibition')}</option>
              <option value="cold_call">{t('source_cold_call')}</option>
            </select>
          </label>
          {/* 地址 */}
          <label className="col-span-2 flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_address')}</span>
            <input
              type="text"
              value={form.address ?? ''}
              onChange={(e) => set('address', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          {/* 城市 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_city')}</span>
            <input
              type="text"
              value={form.city ?? ''}
              onChange={(e) => set('city', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          {/* 地区 */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('customer_region')}</span>
            <input
              type="text"
              value={form.region ?? ''}
              onChange={(e) => set('region', e.target.value)}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          {/* 备注 */}
          <label className="col-span-2 flex flex-col gap-1">
            <span className="text-sm font-medium">{tc('remark')}</span>
            <textarea
              value={form.remark ?? ''}
              onChange={(e) => set('remark', e.target.value)}
              rows={3}
              className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]">
            {tc('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !form.name.trim()}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {tc('save')}
          </button>
        </div>
      </div>
    </div>
  )
}

/** 删除确认弹窗 */
function DeleteDialog({ customer, t, tc, isPending, onConfirm, onClose }: {
  customer: CustomerVO
  t: ReturnType<typeof useTranslations>
  tc: ReturnType<typeof useTranslations>
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-[var(--card)] p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">{t('delete_customer_confirm')}</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">{customer.name}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-[var(--accent)]">
            {tc('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {tc('delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

/** 分页组件 */
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
      >
        &#8249;
      </button>
      <span className="text-sm text-[var(--muted-foreground)]">{page} / {totalPages}</span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
      >
        &#8250;
      </button>
    </div>
  )
}

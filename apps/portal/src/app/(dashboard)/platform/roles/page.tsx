'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Key, Search, Eye, Trash2, Plus, Shield } from 'lucide-react'
import { useRoles, useDeleteRole } from '@/features/system/hooks/use-rbac'
import type { RoleFilters } from '@/features/system/types/rbac.types'
import type { RoleVO } from '@/features/system/types/rbac.types'

type SystemFilter = 'all' | 'system' | 'custom'

/** Role list page */
export default function RolesPage() {
  const t = useTranslations('rbac')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<RoleFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [systemFilter, setSystemFilter] = useState<SystemFilter>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isSystemValue = systemFilter === 'all' ? undefined : systemFilter === 'system'

  const { data, isLoading } = useRoles({
    ...filters,
    search: search || undefined,
    isSystem: isSystemValue,
  })

  const deleteRole = useDeleteRole()

  const roles = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0

  const tabs: { key: SystemFilter; label: string }[] = [
    { key: 'all', label: tc('all') },
    { key: 'system', label: t('system_roles') },
    { key: 'custom', label: t('custom_roles') },
  ]

  function handleDelete(id: string) {
    deleteRole.mutate(id, { onSuccess: () => setDeletingId(null) })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Key className="h-6 w-6" />
            {t('roles')}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tc('all')} {total} {t('roles')}
          </p>
        </div>
        <Link
          href="/platform/roles/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('create_role')}
        </Link>
      </div>

      {/* Search + filter tabs */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setFilters((f) => ({ ...f, page: 1 }))}
            placeholder={`${tc('search')} ${t('role_name')}...`}
            className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setSystemFilter(tab.key); setFilters((f) => ({ ...f, page: 1 })) }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                systemFilter === tab.key
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border hover:bg-[var(--accent)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
          {tc('loading')}
        </div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <Shield className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_80px_100px_90px_80px_120px_100px] gap-4 px-4 py-2 text-xs font-medium text-[var(--muted-foreground)]">
            <span>{t('role_name')}</span>
            <span>{t('level')}</span>
            <span>{t('is_system')}</span>
            <span>{t('permission_count')}</span>
            <span>{t('user_count')}</span>
            <span>{tc('created_at')}</span>
            <span>{tc('actions')}</span>
          </div>

          {roles.map((role) => (
            <RoleRow
              key={role.id}
              role={role}
              deletingId={deletingId}
              isPending={deleteRole.isPending}
              onConfirmDelete={setDeletingId}
              onDelete={handleDelete}
              onCancelDelete={() => setDeletingId(null)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            disabled={(filters.page ?? 1) <= 1}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
          >
            ‹
          </button>
          <span className="text-sm text-[var(--muted-foreground)]">
            {filters.page ?? 1} / {totalPages}
          </span>
          <button
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            disabled={(filters.page ?? 1) >= totalPages}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

/** Role row card */
function RoleRow({
  role,
  deletingId,
  isPending,
  onConfirmDelete,
  onDelete,
  onCancelDelete,
}: {
  role: RoleVO
  deletingId: string | null
  isPending: boolean
  onConfirmDelete: (id: string) => void
  onDelete: (id: string) => void
  onCancelDelete: () => void
}) {
  const t = useTranslations('rbac')
  const tc = useTranslations('common')

  const isDeleting = deletingId === role.id

  return (
    <div className="rounded-lg border bg-[var(--card)] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_80px_100px_90px_80px_120px_100px] gap-4 items-center">
        {/* Name */}
        <div className="min-w-0">
          <p className="font-medium truncate">{role.displayName}</p>
          <p className="text-xs font-mono text-[var(--muted-foreground)] truncate">{role.name}</p>
        </div>

        {/* Level */}
        <span className="inline-flex items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] px-2.5 py-0.5 text-xs font-medium w-fit">
          Lv.{role.level}
        </span>

        {/* System badge */}
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium w-fit ${
          role.isSystem
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {role.isSystem ? t('is_system') : t('custom')}
        </span>

        {/* Permission count */}
        <span className="text-sm">{role.permissionCount}</span>

        {/* User count */}
        <span className="text-sm">{role.userCount}</span>

        {/* Created at */}
        <span className="text-xs text-[var(--muted-foreground)]">
          {new Date(role.createdAt).toLocaleDateString('zh-CN')}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/platform/roles/${role.id}`}
            className="rounded-md p-1.5 hover:bg-[var(--accent)] transition-colors"
            title={t('edit_role')}
          >
            <Eye className="h-4 w-4" />
          </Link>
          {!role.isSystem && (
            <button
              onClick={() => onConfirmDelete(role.id)}
              className="rounded-md p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
              title={t('delete_role')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Inline delete confirmation */}
      {isDeleting && (
        <div className="mt-3 flex items-center gap-3 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
          <p className="flex-1 text-sm text-red-700 dark:text-red-400">
            {role.userCount > 0 ? t('has_users_tip') : t('confirm_delete')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancelDelete}
              className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-[var(--accent)]"
            >
              {tc('cancel')}
            </button>
            {role.userCount === 0 && (
              <button
                onClick={() => onDelete(role.id)}
                disabled={isPending}
                className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {tc('confirm')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

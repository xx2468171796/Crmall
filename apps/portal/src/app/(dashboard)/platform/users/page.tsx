'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { UserCog, Search, X, Check } from 'lucide-react'
import {
  useUsersWithRoles,
  useRoles,
  useAssignUserRoles,
  useRemoveUserRole,
} from '@/features/system/hooks/use-rbac'
import type { UserFilters } from '@/features/system/types/rbac.types'

export default function UsersRolePage() {
  const t = useTranslations('rbac')
  const tc = useTranslations('common')

  const [filters, setFilters] = useState<UserFilters>({ page: 1, perPage: 20 })
  const [search, setSearch] = useState('')
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [removingRole, setRemovingRole] = useState<{ userId: string; roleId: string } | null>(null)

  const { data: usersData, isLoading } = useUsersWithRoles({
    ...filters,
    search: search || undefined,
  })
  const { data: rolesData } = useRoles()
  const assignRoles = useAssignUserRoles()
  const removeRole = useRemoveUserRole()

  const users = usersData?.items ?? []
  const total = usersData?.total ?? 0
  const totalPages = usersData?.totalPages ?? 0
  const allRoles = rolesData?.items ?? []

  const handleSearch = useCallback(() => {
    setFilters((f) => ({ ...f, page: 1 }))
  }, [])

  const openAssignDialog = (userId: string, currentRoleIds: string[]) => {
    setAssigningUserId(userId)
    setSelectedRoleIds([...currentRoleIds])
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    )
  }

  const handleAssignSave = () => {
    if (!assigningUserId) return
    assignRoles.mutate(
      { userId: assigningUserId, roleIds: selectedRoleIds },
      { onSuccess: () => setAssigningUserId(null) },
    )
  }

  const handleRemoveRole = (userId: string, roleId: string) => {
    setRemovingRole({ userId, roleId })
  }

  const confirmRemoveRole = () => {
    if (!removingRole) return
    removeRole.mutate(removingRole, {
      onSuccess: () => setRemovingRole(null),
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <UserCog className="h-6 w-6 text-[#8b5cf6]" />
          {t('users')}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {tc('all')} {total}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={`${tc('search')}...`}
          className="w-full rounded-md border bg-[var(--background)] pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {/* User list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
          {tc('loading')}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
          <UserCog className="h-12 w-12 mb-3" />
          <p>{tc('no_data')}</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[var(--accent)]">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Tenant</th>
                  <th className="px-4 py-3 text-left font-medium">{t('roles')}</th>
                  <th className="px-4 py-3 text-left font-medium">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId} className="border-b last:border-b-0 hover:bg-[var(--accent)]/50">
                    <td className="px-4 py-3 font-medium">{user.userName}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{user.email}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{user.tenantName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.length === 0 && (
                          <span className="text-xs text-[var(--muted-foreground)]">-</span>
                        )}
                        {user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center gap-1 rounded-full bg-[#8b5cf6]/10 px-2.5 py-0.5 text-xs font-medium text-[#8b5cf6]"
                          >
                            {role.displayName}
                            <button
                              onClick={() => handleRemoveRole(user.userId, role.id)}
                              className="rounded-full p-0.5 hover:bg-[#8b5cf6]/20 transition-colors"
                              title={t('remove_role')}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openAssignDialog(user.userId, user.roles.map((r) => r.id))}
                        className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-[var(--accent)] transition-colors"
                      >
                        {t('assign_roles')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                disabled={(filters.page ?? 1) <= 1}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
              >
                &lsaquo;
              </button>
              <span className="text-sm text-[var(--muted-foreground)]">
                {filters.page ?? 1} / {totalPages}
              </span>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                disabled={(filters.page ?? 1) >= totalPages}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
              >
                &rsaquo;
              </button>
            </div>
          )}
        </>
      )}

      {/* Assign roles dialog */}
      {assigningUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-[var(--card)] p-6 shadow-xl border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('assign_roles')}</h2>
              <button
                onClick={() => setAssigningUserId(null)}
                className="rounded-md p-1 hover:bg-[var(--accent)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {allRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    selectedRoleIds.includes(role.id)
                      ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                      : 'hover:bg-[var(--accent)]'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      selectedRoleIds.includes(role.id)
                        ? 'border-[#8b5cf6] bg-[#8b5cf6] text-white'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    {selectedRoleIds.includes(role.id) && <Check className="h-3 w-3" />}
                  </div>
                  <div>
                    <div className="font-medium">{role.displayName}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{role.name}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setAssigningUserId(null)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-[var(--accent)] transition-colors"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handleAssignSave}
                disabled={assignRoles.isPending}
                className="rounded-md bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] disabled:opacity-50 transition-colors"
              >
                {assignRoles.isPending ? tc('loading') : tc('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove role confirmation */}
      {removingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-[var(--card)] p-6 shadow-xl border">
            <h2 className="text-lg font-semibold mb-2">{t('remove_role')}</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              {tc('confirm')}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRemovingRole(null)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-[var(--accent)] transition-colors"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={confirmRemoveRole}
                disabled={removeRole.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {removeRole.isPending ? tc('loading') : tc('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

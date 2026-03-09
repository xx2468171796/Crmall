'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  ArrowLeft, Shield, ChevronDown, ChevronRight, Check, Save,
} from 'lucide-react'
import {
  useRoleDetail, useUpdateRole, usePermissions, useAssignPermissions,
} from '@/features/system/hooks/use-rbac'
import type { PermissionGroupVO, PermissionVO } from '@/features/system/types/rbac.types'

/** Role detail page — view info, edit, and assign permissions */
export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const t = useTranslations('rbac')
  const tc = useTranslations('common')
  const router = useRouter()

  const { data: role, isLoading: roleLoading } = useRoleDetail(id)
  const { data: permissionGroups, isLoading: permsLoading } = usePermissions()
  const updateRole = useUpdateRole()
  const assignPermissions = useAssignPermissions()

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLevel, setEditLevel] = useState(0)

  // Permission assignment state: permissionId -> dataScope
  const [selectedPermissions, setSelectedPermissions] = useState<Map<string, string>>(new Map())

  // Initialize form + permissions from role data
  useEffect(() => {
    if (!role) return
    setEditDisplayName(role.displayName)
    setEditDescription(role.description ?? '')
    setEditLevel(role.level)

    const map = new Map<string, string>()
    for (const p of role.permissions) {
      map.set(p.permissionId, p.dataScope)
    }
    setSelectedPermissions(map)
  }, [role])

  const handleSaveRole = useCallback(() => {
    if (!role) return
    updateRole.mutate({
      id: role.id,
      data: {
        displayName: editDisplayName,
        description: editDescription || undefined,
        level: editLevel,
      },
    })
  }, [role, editDisplayName, editDescription, editLevel, updateRole])

  const handleSavePermissions = useCallback(() => {
    if (!role) return
    const permissions = Array.from(selectedPermissions.entries()).map(
      ([permissionId, dataScope]) => ({ permissionId, dataScope }),
    )
    assignPermissions.mutate({ roleId: role.id, permissions })
  }, [role, selectedPermissions, assignPermissions])

  const togglePermission = useCallback((permissionId: string) => {
    setSelectedPermissions((prev) => {
      const next = new Map(prev)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.set(permissionId, 'all')
      }
      return next
    })
  }, [])

  const setDataScope = useCallback((permissionId: string, scope: string) => {
    setSelectedPermissions((prev) => {
      const next = new Map(prev)
      next.set(permissionId, scope)
      return next
    })
  }, [])

  if (roleLoading || permsLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
        {tc('loading')}
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
        <p>{tc('no_data')}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-[#8b5cf6] hover:underline"
        >
          {tc('back')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header: back + title + system badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-md p-1.5 hover:bg-[var(--accent)]"
          aria-label={tc('back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{role.displayName}</h1>
          {role.isSystem && (
            <span className="rounded-full bg-[#8b5cf6]/10 px-2 py-0.5 text-xs font-medium text-[#8b5cf6]">
              {t('is_system')}
            </span>
          )}
        </div>
      </div>

      {/* Role info card */}
      <section className="rounded-lg border bg-[var(--card)] p-4 shadow-sm">
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4" />
          {t('roles')}
        </h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-[var(--muted-foreground)]">{t('role_name')}: </span>
            <span className="font-medium">{role.name}</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">{t('display_name')}: </span>
            <span className="font-medium">{role.displayName}</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">{t('description')}: </span>
            <span className="font-medium">{role.description ?? '-'}</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">{t('level')}: </span>
            <span className="font-medium">{role.level}</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">{t('is_system')}: </span>
            <span className="font-medium">{role.isSystem ? tc('yes') : tc('no')}</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">{t('user_count')}: </span>
            <span className="font-medium">{role.userCount}</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">{t('permission_count')}: </span>
            <span className="font-medium">{role.permissionCount}</span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">{tc('created_at')}: </span>
            <span className="font-medium">{new Date(role.createdAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </section>

      {/* System role tip */}
      {role.isSystem && (
        <div className="rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/5 p-4 text-sm text-[#8b5cf6]">
          {t('system_role_tip')}
        </div>
      )}

      {/* Edit form — non-system roles only */}
      {!role.isSystem && (
        <section className="rounded-lg border bg-[var(--card)] p-4 shadow-sm">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            {t('edit_role')}
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm text-[var(--muted-foreground)]">
                {t('display_name')}
              </label>
              <input
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--muted-foreground)]">
                {t('description')}
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--muted-foreground)]">
                {t('level')}
              </label>
              <input
                type="number"
                value={editLevel}
                onChange={(e) => setEditLevel(Number(e.target.value))}
                min={0}
                className="w-32 rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveRole}
                disabled={updateRole.isPending}
                className="flex items-center gap-2 rounded-md bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {tc('save')}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Permission assignment — non-system roles only */}
      {!role.isSystem && permissionGroups && (
        <section className="rounded-lg border bg-[var(--card)] shadow-sm">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t('assign_permissions')}
            </h2>
            <button
              onClick={handleSavePermissions}
              disabled={assignPermissions.isPending}
              className="flex items-center gap-2 rounded-md bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {tc('save')}
            </button>
          </div>
          <div className="divide-y">
            {permissionGroups.map((group) => (
              <PermissionGroup
                key={group.module}
                group={group}
                selectedPermissions={selectedPermissions}
                onToggle={togglePermission}
                onScopeChange={setDataScope}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/** Collapsible permission module group */
function PermissionGroup({
  group,
  selectedPermissions,
  onToggle,
  onScopeChange,
}: {
  group: PermissionGroupVO
  selectedPermissions: Map<string, string>
  onToggle: (permissionId: string) => void
  onScopeChange: (permissionId: string, scope: string) => void
}) {
  const [open, setOpen] = useState(false)

  const selectedCount = group.permissions.filter((p) => selectedPermissions.has(p.id)).length

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[var(--accent)] transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        )}
        <span className="font-medium text-sm">{group.label}</span>
        <span className="ml-auto text-xs text-[var(--muted-foreground)]">
          {selectedCount}/{group.permissions.length}
        </span>
      </button>

      {open && (
        <div className="border-t bg-[var(--background)]/50 px-4 py-2">
          {group.permissions.map((perm) => (
            <PermissionRow
              key={perm.id}
              permission={perm}
              checked={selectedPermissions.has(perm.id)}
              dataScope={selectedPermissions.get(perm.id) ?? 'all'}
              onToggle={onToggle}
              onScopeChange={onScopeChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** Single permission row with checkbox and data scope selector */
function PermissionRow({
  permission,
  checked,
  dataScope,
  onToggle,
  onScopeChange,
}: {
  permission: PermissionVO
  checked: boolean
  dataScope: string
  onToggle: (permissionId: string) => void
  onScopeChange: (permissionId: string, scope: string) => void
}) {
  const t = useTranslations('rbac')

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(permission.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? 'border-[#8b5cf6] bg-[#8b5cf6] text-white'
            : 'border-[var(--border)] bg-[var(--background)]'
        }`}
      >
        {checked && <Check className="h-3 w-3" />}
      </button>

      {/* Permission info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {permission.action}:{permission.resource}
        </p>
        {permission.description && (
          <p className="text-xs text-[var(--muted-foreground)] truncate">
            {permission.description}
          </p>
        )}
      </div>

      {/* Data scope selector — only visible when checked */}
      {checked && (
        <select
          value={dataScope}
          onChange={(e) => onScopeChange(permission.id, e.target.value)}
          className="rounded-md border bg-[var(--background)] px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="all">{t('scope_all')}</option>
          <option value="department">{t('scope_department')}</option>
          <option value="own">{t('scope_own')}</option>
        </select>
      )}
    </div>
  )
}

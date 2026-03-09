'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Shield } from 'lucide-react'
import { useCreateRole } from '@/features/system/hooks/use-rbac'

const NAME_REGEX = /^[a-z][a-z0-9_-]*$/

export default function CreateRolePage() {
  const t = useTranslations('rbac')
  const tc = useTranslations('common')
  const router = useRouter()
  const createRole = useCreateRole()

  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState(50)
  const [nameError, setNameError] = useState('')

  const handleNameChange = (value: string) => {
    const lower = value.toLowerCase()
    setName(lower)
    if (lower && !NAME_REGEX.test(lower)) {
      setNameError('Only lowercase letters, numbers, hyphens, and underscores allowed. Must start with a letter.')
    } else {
      setNameError('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !displayName || nameError) return

    createRole.mutate(
      {
        name,
        displayName,
        description: description || undefined,
        level,
      },
      {
        onSuccess: () => {
          router.push('/platform/roles')
        },
      },
    )
  }

  const isValid = name.length > 0 && displayName.length > 0 && !nameError

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/platform/roles')}
          className="rounded-md border p-2 hover:bg-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#8b5cf6]" />
            {t('create_role')}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{t('role_name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. sales_manager"
            required
            className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          {nameError && (
            <p className="text-xs text-red-500">{nameError}</p>
          )}
        </div>

        {/* Display Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{t('display_name')}</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{t('description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
          />
        </div>

        {/* Level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{t('level')}</label>
          <input
            type="number"
            value={level}
            onChange={(e) => {
              const v = Math.max(0, Math.min(100, Number(e.target.value)))
              setLevel(v)
            }}
            min={0}
            max={100}
            className="w-32 rounded-md border bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <p className="text-xs text-[var(--muted-foreground)]">0-100</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!isValid || createRole.isPending}
            className="rounded-md bg-[#8b5cf6] px-5 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] disabled:opacity-50 transition-colors"
          >
            {createRole.isPending ? tc('loading') : tc('save')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/platform/roles')}
            className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-[var(--accent)] transition-colors"
          >
            {tc('cancel')}
          </button>
        </div>

        {createRole.isError && (
          <p className="text-sm text-red-500">
            {createRole.error instanceof Error ? createRole.error.message : tc('operation_failed')}
          </p>
        )}
      </form>
    </div>
  )
}

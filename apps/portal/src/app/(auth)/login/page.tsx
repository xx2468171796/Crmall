'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { loginAction } from '@/features/auth/actions/auth.action'
import type { ActionResult } from '@twcrm/shared'

export default function LoginPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [state, formAction, isPending] = useActionState<ActionResult<null>, FormData>(
    loginAction,
    { success: true, data: null }
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">TWCRM</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          {tc('app_name')}
        </p>
      </div>

      <div className="rounded-lg border bg-[var(--card)] p-6 shadow-sm">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          {!state.success && (
            <div className="rounded-md bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">
              {t('login_failed')}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@twcrm.com"
              autoComplete="email"
              required
              className="flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? tc('loading') : t('login')}
          </button>
        </form>
      </div>
    </div>
  )
}

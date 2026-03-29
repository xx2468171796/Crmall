'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginAction } from '@/features/auth/actions/auth.action'
import { FormInput } from '@/components/ui/form-input'
import { SubmitButton } from '@/components/ui/submit-button'
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

          <FormInput
            id="username"
            name="username"
            type="text"
            label={t('username')}
            placeholder="admin"
            autoComplete="username"
            required
          />

          <FormInput
            id="password"
            name="password"
            type="password"
            label={t('password')}
            autoComplete="current-password"
            required
          />

          <SubmitButton pending={isPending} pendingText={tc('loading')}>
            {t('login')}
          </SubmitButton>
        </form>

        <div className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          {t('no_account')}{' '}
          <Link href="/register" className="text-[var(--primary)] hover:underline">
            {t('register')}
          </Link>
        </div>
      </div>
    </div>
  )
}

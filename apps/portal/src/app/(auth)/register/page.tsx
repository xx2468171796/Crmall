'use client'

import { useActionState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { registerAction } from '@/features/auth/actions/auth.action'
import { FormInput } from '@/components/ui/form-input'
import { LocaleSelect } from '@/components/ui/locale-select'
import { SubmitButton } from '@/components/ui/submit-button'
import type { ActionResult } from '@twcrm/shared'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const hasSubmitted = useRef(false)

  const [state, formAction, isPending] = useActionState<ActionResult<null>, FormData>(
    async (_prev, formData) => {
      hasSubmitted.current = true
      return registerAction(_prev, formData)
    },
    { success: true, data: null }
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">TWCRM</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          {t('register')}
        </p>
      </div>

      <div className="rounded-lg border bg-[var(--card)] p-6 shadow-sm">
        <form action={formAction} className="flex flex-col gap-4">
          {!state.success && (
            <div className="rounded-md bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">
              {state.error === 'auth.password_mismatch'
                ? t('password_mismatch')
                : state.error === 'auth.email_exists'
                  ? t('username_exists')
                  : t('register_failed')}
            </div>
          )}

          {hasSubmitted.current && state.success && !isPending && (
            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
              {t('register_success')}
            </div>
          )}

          <FormInput id="username" name="username" type="text" label={t('username')} autoComplete="username" required />

          <FormInput id="name" name="name" type="text" label={t('name')} required />

          <FormInput
            id="password"
            name="password"
            type="password"
            label={t('password')}
            autoComplete="new-password"
            required
          />

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label={t('confirm_password')}
            autoComplete="new-password"
            required
          />

          <LocaleSelect label={t('language')} />

          <SubmitButton pending={isPending} pendingText={tc('loading')}>
            {t('register')}
          </SubmitButton>
        </form>

        <div className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          {t('have_account')}{' '}
          <Link href="/login" className="text-[var(--primary)] hover:underline">
            {t('login')}
          </Link>
        </div>
      </div>
    </div>
  )
}

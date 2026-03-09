'use client'

import { useActionState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { updateLocaleAction } from '@/features/auth/actions/auth.action'
import { LocaleSelect } from '@/components/ui/locale-select'
import { SubmitButton } from '@/components/ui/submit-button'
import type { SessionUser, ActionResult } from '@twcrm/shared'

export default function ProfilePage() {
  const t = useTranslations('common')
  const ta = useTranslations('auth')
  const { data: session, update } = useSession()
  const user = session?.user as unknown as SessionUser | undefined
  const router = useRouter()
  const hasSubmitted = useRef(false)

  const [state, formAction, isPending] = useActionState<ActionResult<null>, FormData>(
    async (_prev, formData) => {
      hasSubmitted.current = true
      const result = await updateLocaleAction(_prev, formData)
      if (result.success) {
        await update()
        router.refresh()
      }
      return result
    },
    { success: true, data: null }
  )

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t('profile')}</h1>

      {/* 用户信息 */}
      <div className="rounded-lg border bg-[var(--card)] p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">{ta('name')}</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">{ta('email')}</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      {/* 语言偏好 */}
      <div className="rounded-lg border bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold mb-4">{t('language_preference')}</h2>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="userId" value={user.id} />

          {hasSubmitted.current && state.success && !isPending && (
            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
              {t('language_updated')}
            </div>
          )}

          <LocaleSelect
            label={ta('language')}
            defaultValue={user.locale}
            className="flex h-10 w-full max-w-xs rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm ring-offset-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
          />

          <div>
            <SubmitButton pending={isPending} pendingText={t('loading')} className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-6 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 disabled:pointer-events-none disabled:opacity-50">
              {t('save')}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}

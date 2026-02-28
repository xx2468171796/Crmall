'use server'

import { signIn, signOut } from '@/lib/auth'
import { AuthError } from 'next-auth'
import type { ActionResult } from '@twcrm/shared'

/**
 * 登录 Action
 */
export async function loginAction(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: (formData.get('callbackUrl') as string) || '/dashboard',
    })
    return { success: true, data: null }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'auth.login_failed' }
        default:
          return { success: false, error: 'auth.login_failed' }
      }
    }
    throw error // Next.js redirect 也会 throw，需要 re-throw
  }
}

/**
 * 登出 Action
 */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' })
}

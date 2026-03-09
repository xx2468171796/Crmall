'use server'

import { signIn, signOut } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { hash } from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from '@twcrm/db'
import { LOCALES, type Locale } from '@twcrm/shared'
import type { ActionResult } from '@twcrm/shared'

/**
 * 登录 Action — 登录成功后根据用户语言偏好设置 NEXT_LOCALE cookie
 */
export async function loginAction(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  try {
    const email = formData.get('email') as string

    // 先查询用户 locale，登录后设置 cookie
    const user = await prisma.user.findUnique({
      where: { email },
      select: { locale: true },
    })
    if (user?.locale) {
      const cookieStore = await cookies()
      cookieStore.set('NEXT_LOCALE', user.locale, {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
      })
    }

    await signIn('credentials', {
      email,
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
 * 注册 Action
 */
export async function registerAction(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  try {
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const locale = (formData.get('locale') as Locale) || 'zh-TW'

    if (!email || !name || !password) {
      return { success: false, error: 'auth.register_failed' }
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'auth.password_mismatch' }
    }

    if (!LOCALES.includes(locale)) {
      return { success: false, error: 'auth.register_failed' }
    }

    // 检查 email 是否已存在
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { success: false, error: 'auth.email_exists' }
    }

    // 取得 HQ 总部租户（parentId 为 null）
    const hqTenant = await prisma.tenant.findFirst({
      where: { parentId: null, status: 'active' },
    })
    if (!hqTenant) {
      return { success: false, error: 'auth.register_failed' }
    }

    // 取得 tenant_user 角色（系统角色 tenantId=null）
    const userRole = await prisma.role.findFirst({
      where: { name: 'tenant_user', tenantId: null },
    })

    const passwordHash = await hash(password, 10)

    await prisma.user.create({
      data: {
        tenantId: hqTenant.id,
        email,
        name,
        passwordHash,
        locale,
        status: 'active',
        ...(userRole
          ? { roles: { create: { roleId: userRole.id } } }
          : {}),
      },
    })

    return { success: true, data: null }
  } catch {
    return { success: false, error: 'auth.register_failed' }
  }
}

/**
 * 更新用户语言偏好
 */
export async function updateLocaleAction(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  try {
    const userId = formData.get('userId') as string
    const locale = formData.get('locale') as Locale

    if (!userId || !locale || !LOCALES.includes(locale)) {
      return { success: false, error: 'common.operation_failed' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { locale },
    })

    // 同步更新 cookie
    const cookieStore = await cookies()
    cookieStore.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    })

    return { success: true, data: null }
  } catch {
    return { success: false, error: 'common.operation_failed' }
  }
}

/**
 * 登出 Action
 */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' })
}

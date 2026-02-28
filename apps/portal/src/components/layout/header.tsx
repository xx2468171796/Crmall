'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { logoutAction } from '@/features/auth/actions/auth.action'
import type { SessionUser } from '@twcrm/shared'
import { Bell, LogOut, Sun, Moon, User } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Header() {
  const t = useTranslations('common')
  const { data: session } = useSession()
  const user = session?.user as unknown as SessionUser | undefined
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-14 items-center justify-between border-b px-6 bg-[var(--background)]">
      {/* 左侧 — 面包屑 */}
      <Breadcrumb />

      {/* 右侧 — 工具栏 */}
      <div className="flex items-center gap-2">
        {/* 主题切换 */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-2 hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
          aria-label={t('toggle_theme')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* 通知 */}
        <Link
          href="/notifications"
          className="relative rounded-md p-2 hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
          aria-label={t('notifications')}
        >
          <Bell className="h-4 w-4" />
        </Link>

        {/* 用户菜单 */}
        {user && (
          <div className="flex items-center gap-3 ml-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{user.tenantName}</p>
            </div>

            <Link
              href="/settings/profile"
              className="rounded-md p-2 hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
              aria-label={t('profile')}
            >
              <User className="h-4 w-4" />
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md p-2 hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
                aria-label={t('logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}

/** 面包屑 — 根据路径自动生成 */
function Breadcrumb() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null

  // 路径到 i18n key 的映射
  const pathLabels: Record<string, string> = {
    dashboard: 'dashboard',
    customers: 'customers',
    opportunities: 'opportunities',
    contracts: 'contracts',
    workorders: 'workorders',
    ordering: 'ordering',
    cart: 'cart',
    orders: 'orders',
    account: 'account',
    inventory: 'inventory',
    products: 'products',
    stock: 'stock',
    settings: 'settings',
    profile: 'profile',
    platform: 'platform',
    notifications: 'notifications',
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]" aria-label="breadcrumb">
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/')
        const label = pathLabels[seg] ? t(pathLabels[seg] as any) : seg
        const isLast = i === segments.length - 1

        return (
          <span key={href} className="flex items-center gap-1">
            {i > 0 && <span className="mx-1">/</span>}
            {isLast ? (
              <span className="text-[var(--foreground)] font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-[var(--foreground)]">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { navConfig } from '@twcrm/ui'
import type { SessionUser } from '@twcrm/shared'
import { ROLES } from '@twcrm/shared'

/** 纯客户端权限检查 — 不引入服务端模块 */
function hasPermission(user: SessionUser, permission: string): boolean {
  if (user.roles.includes(ROLES.PLATFORM_ADMIN)) return true
  return user.permissions.includes(permission)
}
import {
  LayoutDashboard, Users, Building2, TrendingUp, FileText, Wrench,
  ShoppingCart, Package, ShoppingBag, ClipboardList, Wallet,
  Warehouse, Box, BarChart3, Truck, ArrowLeftRight,
  DollarSign, CreditCard, Send, Receipt,
  Target, Flag, FolderKanban, CheckSquare, ListTodo,
  BookOpen, GraduationCap, Video, Award,
  Settings, User, Shield, Bell, Activity,
  ChevronDown, ChevronRight, PanelLeftClose, PanelLeft,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Building2, TrendingUp, FileText, Wrench,
  ShoppingCart, Package, ShoppingBag, ClipboardList, Wallet,
  Warehouse, Box, BarChart3, Truck, ArrowLeftRight,
  DollarSign, CreditCard, Send, Receipt,
  Target, Flag, FolderKanban, CheckSquare, ListTodo,
  BookOpen, GraduationCap, Video, Award,
  Settings, User, Shield, Bell, Activity,
}

interface NavItem {
  title: string
  href?: string
  icon: string
  permission?: string | null
  children?: NavItem[]
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const t = useTranslations()
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as unknown as SessionUser | undefined

  const filterByPermission = (items: readonly NavItem[]): NavItem[] => {
    if (!user) return []
    return (items as NavItem[]).filter((item) => {
      if (item.permission === null || item.permission === undefined) return true
      return hasPermission(user, item.permission)
    }).map((item) => ({
      ...item,
      children: item.children ? filterByPermission(item.children) : undefined,
    })).filter((item) => !item.children || item.children.length > 0)
  }

  const mainItems = filterByPermission(navConfig.main as unknown as NavItem[])

  return (
    <aside
      className={`hidden md:flex flex-col border-r bg-[var(--sidebar-background)] transition-all duration-200 ${
        collapsed ? 'w-[68px]' : 'w-[280px]'
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && <span className="text-lg font-bold">TWCRM</span>}
        <button
          onClick={onToggle}
          className="ml-auto rounded-md p-1.5 hover:bg-[var(--accent)] text-[var(--muted-foreground)]"
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* 导航 */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {mainItems.map((item) => (
            <SidebarItem
              key={item.title}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              t={t}
            />
          ))}
        </ul>
      </nav>

      {/* 底部 — 租户信息 */}
      {!collapsed && user && (
        <div className="border-t p-4">
          <p className="text-xs font-medium truncate">{user.tenantName}</p>
          <p className="text-xs text-[var(--muted-foreground)] truncate">{user.tenantCode}</p>
        </div>
      )}
    </aside>
  )
}

function SidebarItem({
  item,
  pathname,
  collapsed,
  t,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
  t: ReturnType<typeof useTranslations>
}) {
  const [open, setOpen] = useState(false)
  const Icon = iconMap[item.icon]
  const isActive = item.href ? pathname === item.href : item.children?.some((c) => pathname === c.href)
  const label = t(item.title as any)

  // 有子菜单
  if (item.children && item.children.length > 0) {
    if (collapsed) {
      return (
        <li>
          <div
            className={`flex h-10 w-full items-center justify-center rounded-md ${
              isActive ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
            }`}
            title={label}
          >
            {Icon && <Icon className="h-5 w-5" />}
          </div>
        </li>
      )
    }

    return (
      <li>
        <button
          onClick={() => setOpen(!open)}
          className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm ${
            isActive ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
          }`}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span className="flex-1 text-left truncate">{label}</span>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {open && (
          <ul className="ml-4 mt-1 flex flex-col gap-1 border-l pl-3">
            {item.children.map((child) => (
              <SidebarItem key={child.title} item={child} pathname={pathname} collapsed={collapsed} t={t} />
            ))}
          </ul>
        )}
      </li>
    )
  }

  // 叶子节点
  if (collapsed) {
    return (
      <li>
        <Link
          href={item.href ?? '#'}
          className={`flex h-10 w-full items-center justify-center rounded-md ${
            isActive ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
          }`}
          title={label}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <Link
        href={item.href ?? '#'}
        className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm ${
          isActive
            ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-medium'
            : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
        }`}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="truncate">{label}</span>
      </Link>
    </li>
  )
}

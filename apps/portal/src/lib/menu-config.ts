import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Shield,
  FolderTree,
  UserCog,
  type LucideIcon,
} from "lucide-react"
import type { DataScope } from "@nexus/db"

export interface MenuItem {
  href: string
  label: string
  icon: LucideIcon
  requiredScopes?: DataScope[]
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/platform/tenants",
    label: "租户管理",
    icon: Shield,
    requiredScopes: ["PLATFORM"],
  },
  {
    href: "/admin/companies",
    label: "公司管理",
    icon: Building2,
    requiredScopes: ["PLATFORM", "GROUP"],
  },
  {
    href: "/org/departments",
    label: "部门管理",
    icon: FolderTree,
    requiredScopes: ["PLATFORM", "GROUP", "COMPANY"],
  },
  {
    href: "/org/employees",
    label: "员工管理",
    icon: Users,
    requiredScopes: ["PLATFORM", "GROUP", "COMPANY", "DEPARTMENT"],
  },
  {
    href: "/settings",
    label: "设置",
    icon: Settings,
  },
]

export function filterMenuByScope(
  menu: MenuItem[],
  userScope: DataScope,
  isPlatformAdmin: boolean
): MenuItem[] {
  return menu.filter((item) => {
    if (!item.requiredScopes) return true
    if (isPlatformAdmin) return true
    return item.requiredScopes.includes(userScope)
  })
}

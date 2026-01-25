"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import type { MenuTreeItem } from "@/actions/menu"
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Shield,
  FolderTree,
  FileText,
  DollarSign,
  Package,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Shield,
  FolderTree,
  FileText,
  DollarSign,
  Package,
  GraduationCap,
}

export interface MenuItem {
  id: string
  title: string
  icon: LucideIcon
  url: string
  children: MenuItem[]
}

function mapMenuItems(items: MenuTreeItem[]): MenuItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    icon: iconMap[item.icon || "FileText"] || FileText,
    url: item.url,
    children: item.children ? mapMenuItems(item.children) : [],
  }))
}

const defaultMenus: MenuItem[] = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, url: "/dashboard", children: [] },
  { id: "crm", title: "客户管理", icon: Users, url: "/crm", children: [] },
  { id: "okr", title: "目标管理", icon: FolderTree, url: "/okr", children: [] },
  { id: "finance", title: "财务管理", icon: DollarSign, url: "/finance", children: [] },
  { id: "inventory", title: "库存管理", icon: Package, url: "/inventory", children: [] },
  { id: "learning", title: "培训系统", icon: GraduationCap, url: "/learning", children: [] },
  { id: "docs", title: "知识库", icon: FileText, url: "/docs", children: [] },
  { id: "platform-tenants", title: "租户管理", icon: Shield, url: "/platform/tenants", children: [] },
  { id: "admin-companies", title: "公司管理", icon: Building2, url: "/admin/companies", children: [] },
  { id: "settings", title: "设置", icon: Settings, url: "/settings", children: [] },
]

export function useMenu(): { menu: MenuItem[]; isLoading: boolean } {
  const { status } = useSession()
  const [menu, setMenu] = useState<MenuItem[]>(defaultMenus)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { getMenusFromDirectus } = await import("@/actions/menu")
        const menus = await getMenusFromDirectus()
        if (menus && menus.length > 0) {
          setMenu(mapMenuItems(menus))
        }
      } catch (error) {
        console.error("Failed to fetch menus:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status !== "loading") {
      fetchMenu()
    }
  }, [status])

  return {
    menu,
    isLoading: isLoading || status === "loading",
  }
}

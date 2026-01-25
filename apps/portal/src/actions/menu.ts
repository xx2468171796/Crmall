"use server"

import { auth } from "@nexus/auth"
import { createDirectus, rest, readItems, authentication } from "@directus/sdk"

const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055"

export interface DirectusMenuItem {
  id: string
  title: string
  icon: string | null
  url: string
  parent_id: string | null
  sort: number
  permission_key: string | null
  status: "published" | "draft" | "archived"
}

export interface MenuTreeItem extends DirectusMenuItem {
  children: MenuTreeItem[]
}

export async function getMenusFromDirectus(): Promise<MenuTreeItem[]> {
  try {
    const directus = createDirectus(directusUrl).with(rest())

    const session = await auth()
    if (!session?.user) {
      return []
    }

    const userPermissions = await getUserPermissions(session.user.id)

    const menus = await directus.request(
      readItems("nexus_menus", {
        filter: {
          status: { _eq: "published" },
        },
        sort: ["sort"],
        fields: ["id", "title", "icon", "url", "parent_id", "sort", "permission_key"],
      })
    ) as DirectusMenuItem[]

    const filteredMenus = menus.filter((menu) => {
      if (!menu.permission_key) return true
      if (session.user.isPlatformAdmin) return true
      return userPermissions.includes(menu.permission_key)
    })

    return buildMenuTree(filteredMenus)
  } catch (error) {
    console.error("Failed to fetch menus from Directus:", error)
    return getDefaultMenus()
  }
}

async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const directus = createDirectus(directusUrl).with(rest())

    const permissions = await directus.request(
      readItems("nexus_user_permissions", {
        filter: {
          user_id: { _eq: userId },
        },
        fields: ["permission_key"],
      })
    ) as { permission_key: string }[]

    return permissions.map((p) => p.permission_key)
  } catch {
    return []
  }
}

function buildMenuTree(menus: DirectusMenuItem[]): MenuTreeItem[] {
  const menuMap = new Map<string, MenuTreeItem>()
  const rootMenus: MenuTreeItem[] = []

  menus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu, children: [] })
  })

  menus.forEach((menu) => {
    const menuItem = menuMap.get(menu.id)!
    if (menu.parent_id && menuMap.has(menu.parent_id)) {
      menuMap.get(menu.parent_id)!.children.push(menuItem)
    } else {
      rootMenus.push(menuItem)
    }
  })

  return rootMenus
}

function getDefaultMenus(): MenuTreeItem[] {
  return [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "LayoutDashboard",
      url: "/dashboard",
      parent_id: null,
      sort: 0,
      permission_key: null,
      status: "published",
      children: [],
    },
    {
      id: "settings",
      title: "设置",
      icon: "Settings",
      url: "/settings",
      parent_id: null,
      sort: 100,
      permission_key: null,
      status: "published",
      children: [],
    },
  ]
}

export async function checkPermission(permissionKey: string): Promise<boolean> {
  try {
    const session = await auth()
    if (!session?.user) return false
    if (session.user.isPlatformAdmin) return true

    const permissions = await getUserPermissions(session.user.id)
    return permissions.includes(permissionKey) || permissions.includes("*")
  } catch {
    return false
  }
}

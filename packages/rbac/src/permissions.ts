import { directus, readItems } from "./client"

export interface Permission {
  id: string
  action: string
  collection: string
  role: string | null
}

export interface Role {
  id: string
  name: string
  admin_access: boolean
  app_access: boolean
}

export interface MenuItem {
  id: string
  title: string
  icon: string | null
  url: string
  parent_id: string | null
  sort: number
  permission_key: string | null
  status: "published" | "draft" | "archived"
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const permissions = await directus.request(
      readItems("directus_permissions", {
        filter: {
          _or: [
            { role: { _null: true } },
          ],
        },
        fields: ["action", "collection"],
      })
    )

    return permissions.map((p: Permission) => `${p.collection}:${p.action}`)
  } catch (error) {
    console.error("Failed to fetch permissions:", error)
    return []
  }
}

export async function getMenuItems(userPermissions: string[]): Promise<MenuItem[]> {
  try {
    const menus = await directus.request(
      readItems("nexus_menus", {
        filter: {
          status: { _eq: "published" },
        },
        sort: ["sort"],
        fields: ["id", "title", "icon", "url", "parent_id", "sort", "permission_key"],
      })
    )

    return (menus as MenuItem[]).filter((menu) => {
      if (!menu.permission_key) return true
      return userPermissions.includes(menu.permission_key)
    })
  } catch (error) {
    console.error("Failed to fetch menu items:", error)
    return []
  }
}

export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  if (userPermissions.includes("*")) return true
  return userPermissions.includes(requiredPermission)
}

export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  if (userPermissions.includes("*")) return true
  return requiredPermissions.some((p) => userPermissions.includes(p))
}

export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  if (userPermissions.includes("*")) return true
  return requiredPermissions.every((p) => userPermissions.includes(p))
}

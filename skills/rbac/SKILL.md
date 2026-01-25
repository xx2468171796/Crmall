---
name: rbac
description: 角色权限控制技能。在需要实现权限检查、菜单授权、路由守卫、数据范围控制等功能时使用此技能。基于 Directus RBAC + Auth.js Session + 中间件守卫。
---

# 角色权限技能 (RBAC Skill)

实现权限控制相关功能时，遵循以下流程和规范。

## 技术栈

- **Directus** - 权限引擎 (定义角色和权限)
- **Auth.js v5** - Session 中的用户角色
- **Next.js Middleware** - 路由守卫
- **React Hook** - 前端权限检查

## 角色定义

系统预设四个角色层级：

| 角色 | 代码 | 权限范围 |
|------|------|----------|
| 超级管理员 | `super_admin` | 所有权限 |
| 管理员 | `admin` | 管理本组织 |
| 经理 | `manager` | 管理下属 |
| 普通用户 | `user` | 仅自己数据 |

## 权限格式

权限使用 `resource:action` 格式：

```typescript
type Permission = 
  | "customer:create"
  | "customer:read"
  | "customer:update"
  | "customer:delete"
  | "order:create"
  | "order:read"
  // ...
```

## 权限检查 Hook

```typescript
// src/hooks/usePermission.ts
"use client"

import { useSession } from "next-auth/react"

export function usePermission() {
  const { data: session } = useSession()
  
  const hasPermission = (permission: string): boolean => {
    if (!session?.user?.permissions) return false
    return session.user.permissions.includes(permission)
  }
  
  const hasRole = (role: string): boolean => {
    if (!session?.user?.role) return false
    return session.user.role === role
  }
  
  const hasAnyRole = (roles: string[]): boolean => {
    if (!session?.user?.role) return false
    return roles.includes(session.user.role)
  }
  
  return { hasPermission, hasRole, hasAnyRole }
}
```

## 权限检查组件

```tsx
// src/components/shared/permission-gate.tsx
"use client"

import { usePermission } from "@/hooks/usePermission"

interface PermissionGateProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { hasPermission } = usePermission()
  
  if (!hasPermission(permission)) {
    return fallback ?? null
  }
  
  return <>{children}</>
}
```

使用示例：

```tsx
<PermissionGate permission="customer:delete">
  <Button variant="destructive">删除客户</Button>
</PermissionGate>
```

## 路由守卫中间件

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/customers", "/orders"]
const adminRoutes = ["/admin", "/settings"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  
  // 未登录访问受保护路由
  if (protectedRoutes.some(r => pathname.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }
  
  // 非管理员访问管理路由
  if (adminRoutes.some(r => pathname.startsWith(r))) {
    if (session?.user?.role !== "admin" && session?.user?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/403", req.url))
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

## Server Action 权限检查

```typescript
// src/actions/customer/delete.ts
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function deleteCustomer(id: string) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  if (!session.user.permissions?.includes("customer:delete")) {
    throw new Error("Forbidden: 无删除权限")
  }
  
  await prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
  
  return { success: true }
}
```

## 动态菜单渲染

```typescript
// src/lib/menu.ts
import { Session } from "next-auth"

interface MenuItem {
  label: string
  href: string
  permission?: string
  icon: string
}

const allMenuItems: MenuItem[] = [
  { label: "仪表板", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "客户管理", href: "/customers", permission: "customer:read", icon: "Users" },
  { label: "订单管理", href: "/orders", permission: "order:read", icon: "ShoppingCart" },
  { label: "系统设置", href: "/admin", permission: "admin:access", icon: "Settings" },
]

export function getMenuItems(session: Session | null): MenuItem[] {
  if (!session?.user) return []
  
  return allMenuItems.filter(item => {
    if (!item.permission) return true
    return session.user.permissions?.includes(item.permission)
  })
}
```

## 数据范围控制

```typescript
// src/lib/db/scope.ts
import { Session } from "next-auth"
import { Prisma } from "@prisma/client"

export function getDataScope(session: Session): Prisma.CustomerWhereInput {
  const role = session.user.role
  const userId = session.user.id
  const orgId = session.user.organizationId
  
  switch (role) {
    case "super_admin":
      return {} // 所有数据
    case "admin":
      return { organizationId: orgId } // 本组织
    case "manager":
      return { OR: [{ ownerId: userId }, { owner: { managerId: userId } }] } // 自己和下属
    default:
      return { ownerId: userId } // 仅自己
  }
}
```

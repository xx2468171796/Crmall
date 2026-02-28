# RBAC 技能 — 角色权限控制

## 技术栈
- 自建 RBAC（不用 Directus/Clerk）
- Auth.js v5 Session
- Prisma 7 权限模型
- Next.js Middleware + Server Action 双重校验

## 角色层级

| 角色 | 数据范围 | 说明 |
|------|----------|------|
| platform_admin | 所有租户 | 总部超级管理员 |
| platform_viewer | 所有租户（只读） | 总部查看者 |
| tenant_admin | 本租户 | 子公司管理员 |
| tenant_manager | 本租户 | 子公司经理 |
| tenant_user | 本租户 | 子公司普通员工 |

## 权限格式

`{module}:{action}`

示例：
- customer:read / customer:write / customer:delete
- order:create / order:approve / order:ship
- workorder:assign / workorder:complete
- doc:read / doc:edit / doc:admin
- platform:manage (总部专属)

## 权限检查方式

### Server Action 中
```typescript
import { auth } from '@twcrm/auth'
import { checkPermission } from '@twcrm/rbac'

export async function createOrderAction(input: CreateOrderDTO) {
  const session = await auth()
  if (!session) return fail('未登入', 'UNAUTHORIZED')
  
  checkPermission(session.user, 'order:create')
  // 业务逻辑...
}
```

### React 组件中
```typescript
import { usePermission } from '@/hooks/use-permission'

function OrderActions() {
  const { can } = usePermission()
  
  return (
    <>
      {can('order:create') && <CreateOrderButton />}
      {can('order:approve') && <ApproveButton />}
    </>
  )
}
```

### Next.js Middleware
```typescript
// src/middleware.ts
export default auth((req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user

  // 总部路由只有 platform 角色可访问
  if (pathname.startsWith('/platform') && !isPlatformRole(user?.role)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})
```

## 多租户数据隔离

- 子公司用户：自动注入 WHERE tenantId = ?
- 总部用户：不注入 tenantId，可查全部
- 通过 Prisma Middleware 实现，不需要手动写

## 菜单权限过滤

导航菜单根据用户角色/权限动态过滤：

```typescript
const menuItems = allMenuItems.filter(item => {
  if (!item.requiredPermission) return true
  return can(item.requiredPermission)
})
```

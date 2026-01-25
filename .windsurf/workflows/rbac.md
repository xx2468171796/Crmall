---
description: 角色权限控制技能。在需要实现权限检查、菜单授权、路由守卫、数据范围控制等功能时使用此技能。基于 Directus RBAC + Auth.js Session + 中间件守卫。
---

阅读 `skills/rbac/SKILL.md` 获取完整指南。

## 快速参考

### 角色层级
| 角色 | 代码 | 权限范围 |
|------|------|----------|
| 超级管理员 | `super_admin` | 所有权限 |
| 管理员 | `admin` | 管理本组织 |
| 经理 | `manager` | 管理下属 |
| 普通用户 | `user` | 仅自己数据 |

### 核心文件
- `src/hooks/usePermission.ts` - 权限检查 Hook
- `src/middleware.ts` - 路由守卫
- `src/components/shared/permission-gate.tsx` - 权限组件

### 权限格式
```typescript
type Permission = "customer:create" | "customer:read" | "customer:update" | "customer:delete"
```

# Spec: 认证与权限 (Auth + RBAC)

## Status: designed

## 概述
Auth.js v5 自建认证 + 自建 RBAC 权限系统，支持多租户行级隔离。

## 认证
- Auth.js v5 (next-auth@5)
- JWT Session 策略
- Session 包含: id, email, name, tenantId, tenantCode, roles, permissions, locale, isPlatform
- Redis 存储 Session

## 角色层级
| 角色 | 数据范围 | level |
|------|----------|-------|
| `platform_admin` | 所有租户 | 0 |
| `platform_viewer` | 所有租户（只读） | 1 |
| `tenant_admin` | 本租户 | 10 |
| `tenant_manager` | 本租户 | 20 |
| `tenant_user` | 本租户 | 30 |

## 权限格式
`{module}:{action}:{resource}`

示例: `crm:create:customer`, `ordering:read:order`, `platform:read:dashboard`

## 数据模型
- `auth.Role` — 角色定义
- `auth.Permission` — 权限定义
- `auth.RolePermission` — 角色-权限关联
- `auth.UserRole` — 用户-角色关联
- `auth.Session` — 会话

## 权限检查
- Server Action: `await checkPermission(session, 'crm:create:customer')`
- React 组件: `<PermissionGuard permission="crm:read:customer">`
- 导航菜单: `navConfig` 中每项含 `permission` 字段

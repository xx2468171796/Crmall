// ============================================
// 全局类型定义
// ============================================

import type { Locale } from './constants'

/**
 * 当前用户 Session 信息
 */
export interface SessionUser {
  id: string
  email: string
  name: string
  avatar?: string
  tenantId: string
  tenantCode: string
  tenantName: string
  roles: string[]
  permissions: string[]
  locale: Locale
  isPlatform: boolean /// 是否总部用户
}

/**
 * 租户上下文（用于 Prisma Middleware）
 */
export interface TenantContext {
  tenantId: string
  isPlatform: boolean
}

/**
 * WebSocket 事件 — Server → Client
 */
export interface ServerToClientEvents {
  'order:new': (data: { orderId: string; tenantId: string; orderNo: string; amount: number }) => void
  'order:status_changed': (data: { orderId: string; status: string; orderNo: string }) => void
  'order:shipped': (data: { orderId: string; trackingNo: string; carrier: string }) => void
  'stock:low': (data: { productId: string; productName: string; warehouseId: string; quantity: number; safetyStock: number }) => void
  'stock:updated': (data: { productId: string; warehouseId: string; quantity: number }) => void
  'workorder:assigned': (data: { workOrderId: string; workOrderNo: string; assigneeId: string }) => void
  'workorder:completed': (data: { workOrderId: string; workOrderNo: string }) => void
  'notification:new': (data: NotificationPayload) => void
  'announcement:new': (data: { id: string; title: string; type: string }) => void
}

/**
 * WebSocket 事件 — Client → Server
 */
export interface ClientToServerEvents {
  'chat:message': (data: { to: string; content: string }) => void
  'presence:online': () => void
  'presence:offline': () => void
  'notification:read': (data: { notificationId: string }) => void
}

/**
 * 通知载荷
 */
export interface NotificationPayload {
  id: string
  title: string
  content?: string
  type: string
  module?: string
  refType?: string
  refId?: string
}

/**
 * 导航菜单项
 */
export interface NavItem {
  title: string
  href: string
  icon?: string
  badge?: number
  disabled?: boolean
  permission?: string /// 所需权限 e.g. "crm:read:customer"
  children?: NavItem[]
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  title: string
  href?: string
}

/**
 * 表格列定义
 */
export interface ColumnDef<T = unknown> {
  key: string
  title: string
  sortable?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, record: T) => unknown
}

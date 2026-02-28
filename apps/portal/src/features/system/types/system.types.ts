// ============================================
// 系统模块 — 类型定义（公告/通知/配置）
// ============================================

// ---- 公告 ----

export interface AnnouncementVO {
  id: string
  title: string
  content: string
  type: string
  priority: number
  isTop: boolean
  targetType: string
  targetIds: string[]
  publishedAt: string | null
  expiresAt: string | null
  status: string
  createdBy: string
  isRead: boolean
  createdAt: string
}

export interface CreateAnnouncementDTO {
  title: string
  content: string
  type?: string
  priority?: number
  isTop?: boolean
  targetType?: string
  targetIds?: string[]
  expiresAt?: string
}

export interface AnnouncementFilters {
  status?: string
  type?: string
  page?: number
  perPage?: number
}

// ---- 通知 ----

export interface NotificationVO {
  id: string
  title: string
  content: string | null
  type: string
  module: string | null
  refType: string | null
  refId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface NotificationFilters {
  isRead?: boolean
  type?: string
  page?: number
  perPage?: number
}

// ---- 配置 ----

export interface ConfigItemVO {
  id: string
  tenantId: string | null
  group: string
  key: string
  value: string
  label: string | null
  updatedAt: string
}

export interface UpdateConfigDTO {
  group: string
  key: string
  value: string
  tenantId?: string
  label?: string
}

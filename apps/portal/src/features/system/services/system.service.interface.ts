// ============================================
// 系统模块 — Service 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  AnnouncementVO, AnnouncementFilters, CreateAnnouncementDTO,
  NotificationVO, NotificationFilters,
  ConfigItemVO, UpdateConfigDTO,
} from '../types/system.types'

export interface IAnnouncementService {
  getPublished(userId: string, filters: AnnouncementFilters): Promise<PaginatedResult<AnnouncementVO>>
  getAll(filters: AnnouncementFilters): Promise<PaginatedResult<AnnouncementVO>>
  create(dto: CreateAnnouncementDTO, createdBy: string): Promise<AnnouncementVO>
  publish(id: string): Promise<void>
  archive(id: string): Promise<void>
  markRead(announcementId: string, userId: string): Promise<void>
}

export interface INotificationService {
  getNotifications(userId: string, filters: NotificationFilters): Promise<PaginatedResult<NotificationVO>>
  getUnreadCount(userId: string): Promise<number>
  markRead(id: string): Promise<void>
  markAllRead(userId: string): Promise<void>
  send(data: { userId: string; tenantId?: string; title: string; content?: string; type: string; module?: string; refType?: string; refId?: string }): Promise<void>
}

export interface ISystemConfigService {
  getConfigsByGroup(group: string, tenantId?: string): Promise<ConfigItemVO[]>
  getAllGroups(): Promise<string[]>
  updateConfig(dto: UpdateConfigDTO): Promise<ConfigItemVO>
}

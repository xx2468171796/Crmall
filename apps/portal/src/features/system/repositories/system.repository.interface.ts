// ============================================
// 系统模块 — Repository 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  AnnouncementVO, AnnouncementFilters, CreateAnnouncementDTO,
  NotificationVO, NotificationFilters,
  ConfigItemVO, UpdateConfigDTO,
} from '../types/system.types'

export interface IAnnouncementRepository {
  findPublished(userId: string, filters: AnnouncementFilters): Promise<PaginatedResult<AnnouncementVO>>
  findAll(filters: AnnouncementFilters): Promise<PaginatedResult<AnnouncementVO>>
  findById(id: string): Promise<AnnouncementVO | null>
  create(dto: CreateAnnouncementDTO, createdBy: string): Promise<AnnouncementVO>
  publish(id: string): Promise<void>
  archive(id: string): Promise<void>
  markRead(announcementId: string, userId: string): Promise<void>
}

export interface INotificationRepository {
  findByUser(userId: string, filters: NotificationFilters): Promise<PaginatedResult<NotificationVO>>
  countUnread(userId: string): Promise<number>
  markRead(id: string): Promise<void>
  markAllRead(userId: string): Promise<void>
  create(data: { userId: string; tenantId?: string; title: string; content?: string; type: string; module?: string; refType?: string; refId?: string }): Promise<NotificationVO>
}

export interface IConfigRepository {
  findByGroup(group: string, tenantId?: string): Promise<ConfigItemVO[]>
  findAllGroups(): Promise<string[]>
  upsert(dto: UpdateConfigDTO): Promise<ConfigItemVO>
  deleteByKey(group: string, key: string, tenantId?: string): Promise<void>
}

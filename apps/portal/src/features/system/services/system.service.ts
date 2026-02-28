// ============================================
// 系统模块 — Service 实现
// ============================================

import type { IConfigService, PaginatedResult } from '@twcrm/shared'
import { NotFoundError } from '@twcrm/shared'
import type { IAnnouncementRepository, INotificationRepository, IConfigRepository } from '../repositories/system.repository.interface'
import type { IAnnouncementService, INotificationService, ISystemConfigService } from './system.service.interface'
import type {
  AnnouncementVO, AnnouncementFilters, CreateAnnouncementDTO,
  NotificationVO, NotificationFilters,
  ConfigItemVO, UpdateConfigDTO,
} from '../types/system.types'

// ---- 公告 ----

export class AnnouncementService implements IAnnouncementService {
  constructor(
    private readonly announcementRepo: IAnnouncementRepository,
    private readonly configService: IConfigService,
  ) {}

  async getPublished(userId: string, filters: AnnouncementFilters): Promise<PaginatedResult<AnnouncementVO>> {
    return this.announcementRepo.findPublished(userId, filters)
  }

  async getAll(filters: AnnouncementFilters): Promise<PaginatedResult<AnnouncementVO>> {
    return this.announcementRepo.findAll(filters)
  }

  async create(dto: CreateAnnouncementDTO, createdBy: string): Promise<AnnouncementVO> {
    return this.announcementRepo.create(dto, createdBy)
  }

  async publish(id: string): Promise<void> {
    const a = await this.announcementRepo.findById(id)
    if (!a) throw new NotFoundError('公告', id)
    await this.announcementRepo.publish(id)
  }

  async archive(id: string): Promise<void> {
    const a = await this.announcementRepo.findById(id)
    if (!a) throw new NotFoundError('公告', id)
    await this.announcementRepo.archive(id)
  }

  async markRead(announcementId: string, userId: string): Promise<void> {
    await this.announcementRepo.markRead(announcementId, userId)
  }
}

// ---- 通知 ----

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly configService: IConfigService,
  ) {}

  async getNotifications(userId: string, filters: NotificationFilters): Promise<PaginatedResult<NotificationVO>> {
    return this.notificationRepo.findByUser(userId, filters)
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.countUnread(userId)
  }

  async markRead(id: string): Promise<void> {
    await this.notificationRepo.markRead(id)
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationRepo.markAllRead(userId)
  }

  async send(data: any): Promise<void> {
    const wsEnabled = await this.configService.getBoolean('notification', 'ws_enabled', data.tenantId, true)
    // 创建数据库记录
    await this.notificationRepo.create(data)
    // TODO: 如果 wsEnabled，通过 WebSocket 推送
  }
}

// ---- 配置管理 ----

export class SystemConfigService implements ISystemConfigService {
  constructor(
    private readonly configRepo: IConfigRepository,
    private readonly configService: IConfigService,
  ) {}

  async getConfigsByGroup(group: string, tenantId?: string): Promise<ConfigItemVO[]> {
    return this.configRepo.findByGroup(group, tenantId)
  }

  async getAllGroups(): Promise<string[]> {
    return this.configRepo.findAllGroups()
  }

  async updateConfig(dto: UpdateConfigDTO): Promise<ConfigItemVO> {
    const result = await this.configRepo.upsert(dto)
    // 清除 ConfigService 缓存
    await this.configService.invalidateCache(dto.group, dto.tenantId)
    return result
  }
}

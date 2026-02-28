// ============================================
// 系统模块 — Repository 实现
// ============================================

import type { PrismaClient } from '@twcrm/db'
import type { PaginatedResult } from '@twcrm/shared'
import type { IAnnouncementRepository, INotificationRepository, IConfigRepository } from './system.repository.interface'
import type {
  AnnouncementVO, AnnouncementFilters, CreateAnnouncementDTO,
  NotificationVO, NotificationFilters,
  ConfigItemVO, UpdateConfigDTO,
} from '../types/system.types'

// ---- 公告 ----

export class AnnouncementRepository implements IAnnouncementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPublished(userId: string, filters: AnnouncementFilters): Promise<PaginatedResult<AnnouncementVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const now = new Date()
    const where: any = {
      status: 'published',
      publishedAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    }
    if (filters.type) where.type = filters.type

    const [items, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: [{ isTop: 'desc' }, { priority: 'desc' }, { publishedAt: 'desc' }],
        include: { reads: { where: { userId }, select: { id: true } } },
      }),
      this.prisma.announcement.count({ where }),
    ])

    return {
      items: items.map((a) => this.toVO(a, userId)),
      total, page, perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async findAll(filters: AnnouncementFilters): Promise<PaginatedResult<AnnouncementVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.type) where.type = filters.type

    const [items, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.announcement.count({ where }),
    ])

    return {
      items: items.map((a) => this.toVO(a)),
      total, page, perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async findById(id: string): Promise<AnnouncementVO | null> {
    const a = await this.prisma.announcement.findUnique({ where: { id } })
    return a ? this.toVO(a) : null
  }

  async create(dto: CreateAnnouncementDTO, createdBy: string): Promise<AnnouncementVO> {
    const a = await this.prisma.announcement.create({
      data: { ...dto, createdBy },
    })
    return this.toVO(a)
  }

  async publish(id: string): Promise<void> {
    await this.prisma.announcement.update({
      where: { id },
      data: { status: 'published', publishedAt: new Date() },
    })
  }

  async archive(id: string): Promise<void> {
    await this.prisma.announcement.update({
      where: { id },
      data: { status: 'archived' },
    })
  }

  async markRead(announcementId: string, userId: string): Promise<void> {
    await this.prisma.announcementRead.upsert({
      where: { announcementId_userId: { announcementId, userId } },
      update: {},
      create: { announcementId, userId },
    })
  }

  private toVO(a: any, _userId?: string): AnnouncementVO {
    return {
      id: a.id, title: a.title, content: a.content, type: a.type,
      priority: a.priority, isTop: a.isTop, targetType: a.targetType,
      targetIds: a.targetIds ?? [],
      publishedAt: a.publishedAt?.toISOString() ?? null,
      expiresAt: a.expiresAt?.toISOString() ?? null,
      status: a.status, createdBy: a.createdBy,
      isRead: (a.reads?.length ?? 0) > 0,
      createdAt: a.createdAt.toISOString(),
    }
  }
}

// ---- 通知 ----

export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUser(userId: string, filters: NotificationFilters): Promise<PaginatedResult<NotificationVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: any = { userId }
    if (filters.isRead !== undefined) where.isRead = filters.isRead
    if (filters.type) where.type = filters.type

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ])

    return {
      items: items.map(this.toVO),
      total, page, perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } })
  }

  async markRead(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    })
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
  }

  async create(data: any): Promise<NotificationVO> {
    const n = await this.prisma.notification.create({ data })
    return this.toVO(n)
  }

  private toVO(n: any): NotificationVO {
    return {
      id: n.id, title: n.title, content: n.content, type: n.type,
      module: n.module, refType: n.refType, refId: n.refId,
      isRead: n.isRead, readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    }
  }
}

// ---- 配置 ----

export class ConfigRepository implements IConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByGroup(group: string, tenantId?: string): Promise<ConfigItemVO[]> {
    const where = tenantId
      ? { group, OR: [{ tenantId: null }, { tenantId }] }
      : { group, tenantId: null }
    const items = await this.prisma.systemConfig.findMany({ where, orderBy: { key: 'asc' } })
    return items.map(this.toVO)
  }

  async findAllGroups(): Promise<string[]> {
    const result = await this.prisma.systemConfig.findMany({
      where: { tenantId: null },
      distinct: ['group'],
      select: { group: true },
      orderBy: { group: 'asc' },
    })
    return result.map((r) => r.group)
  }

  async upsert(dto: UpdateConfigDTO): Promise<ConfigItemVO> {
    const tid = dto.tenantId ?? ''
    const item = await this.prisma.systemConfig.upsert({
      where: { tenantId_group_key: { tenantId: tid, group: dto.group, key: dto.key } },
      update: { value: dto.value, label: dto.label },
      create: { tenantId: tid || null, group: dto.group, key: dto.key, value: dto.value, label: dto.label },
    })
    return this.toVO(item)
  }

  async deleteByKey(group: string, key: string, tenantId?: string): Promise<void> {
    const tid = tenantId ?? ''
    await this.prisma.systemConfig.delete({
      where: { tenantId_group_key: { tenantId: tid, group, key } },
    })
  }

  private toVO(c: any): ConfigItemVO {
    return {
      id: c.id, tenantId: c.tenantId, group: c.group,
      key: c.key, value: c.value, label: c.label,
      updatedAt: c.updatedAt.toISOString(),
    }
  }
}

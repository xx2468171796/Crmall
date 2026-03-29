'use server'

import { requireAuth, requirePlatform } from '@/lib/container'
import {
  createAnnouncementService, createNotificationService, createSystemConfigService,
} from '@/lib/container'
import { createAnnouncementSchema, updateConfigSchema } from '../schemas/system.schema'
import { withAction, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type {
  AnnouncementVO, AnnouncementFilters,
  NotificationVO, NotificationFilters,
  ConfigItemVO,
} from '../types/system.types'

// ---- 公告 ----

export function getAnnouncementsAction(
  filters: AnnouncementFilters
): Promise<ActionResult<PaginatedResult<AnnouncementVO>>> {
  return withAction(async () => {
    const user = await requireAuth()
    const service = createAnnouncementService(user.tenantId, user.isPlatform)
    return service.getPublished(user.id, filters)
  })
}

export function getAllAnnouncementsAction(
  filters: AnnouncementFilters
): Promise<ActionResult<PaginatedResult<AnnouncementVO>>> {
  return withAction(async () => {
    const user = await requirePlatform()
    const service = createAnnouncementService(user.tenantId, user.isPlatform)
    return service.getAll(filters)
  })
}

export function createAnnouncementAction(input: unknown): Promise<ActionResult<AnnouncementVO>> {
  return withAction(async () => {
    const user = await requirePlatform()
    const dto = createAnnouncementSchema.parse(input)
    const service = createAnnouncementService(user.tenantId, user.isPlatform)
    const result = await service.create(dto, user.id)
    revalidatePath('/platform/announcements')
    return result
  })
}

export function publishAnnouncementAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePlatform()
    const service = createAnnouncementService(user.tenantId, user.isPlatform)
    await service.publish(id)
    revalidatePath('/platform/announcements')
    return null
  })
}

export function markAnnouncementReadAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requireAuth()
    const service = createAnnouncementService(user.tenantId, user.isPlatform)
    await service.markRead(id, user.id)
    return null
  })
}

// ---- 通知 ----

export function getNotificationsAction(
  filters: NotificationFilters
): Promise<ActionResult<PaginatedResult<NotificationVO>>> {
  return withAction(async () => {
    const user = await requireAuth()
    const service = createNotificationService(user.tenantId, user.isPlatform)
    return service.getNotifications(user.id, filters)
  })
}

export function getUnreadCountAction(): Promise<ActionResult<number>> {
  return withAction(async () => {
    const user = await requireAuth()
    const service = createNotificationService(user.tenantId, user.isPlatform)
    return service.getUnreadCount(user.id)
  })
}

export function markNotificationReadAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requireAuth()
    const service = createNotificationService(user.tenantId, user.isPlatform)
    await service.markRead(id)
    return null
  })
}

export function markAllNotificationsReadAction(): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requireAuth()
    const service = createNotificationService(user.tenantId, user.isPlatform)
    await service.markAllRead(user.id)
    revalidatePath('/notifications')
    return null
  })
}

// ---- 配置管理 ----

export function getConfigGroupsAction(): Promise<ActionResult<string[]>> {
  return withAction(async () => {
    const user = await requirePlatform()
    const service = createSystemConfigService(user.tenantId, user.isPlatform)
    return service.getAllGroups()
  })
}

export function getConfigsByGroupAction(
  group: string,
  tenantId?: string
): Promise<ActionResult<ConfigItemVO[]>> {
  return withAction(async () => {
    const user = await requirePlatform()
    const service = createSystemConfigService(user.tenantId, user.isPlatform)
    return service.getConfigsByGroup(group, tenantId)
  })
}

export function updateConfigAction(input: unknown): Promise<ActionResult<ConfigItemVO>> {
  return withAction(async () => {
    const user = await requirePlatform()
    const dto = updateConfigSchema.parse(input)
    const service = createSystemConfigService(user.tenantId, user.isPlatform)
    const result = await service.updateConfig(dto)
    revalidatePath('/platform/settings')
    return result
  })
}

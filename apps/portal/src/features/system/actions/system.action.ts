'use server'

import { requireAuth, requirePlatform, requirePermission } from '@/lib/container'
import {
  createAnnouncementService, createNotificationService, createSystemConfigService,
} from '@/lib/container'
import { createAnnouncementSchema, updateConfigSchema } from '../schemas/system.schema'
import { ok, fail, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { AppError } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type {
  AnnouncementVO, AnnouncementFilters,
  NotificationVO, NotificationFilters,
  ConfigItemVO,
} from '../types/system.types'

// ---- 公告 ----

export async function getAnnouncementsAction(
  filters: AnnouncementFilters
): Promise<ActionResult<PaginatedResult<AnnouncementVO>>> {
  try {
    const user = await requireAuth()
    const service = createAnnouncementService()
    const result = await service.getPublished(user.id, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getAllAnnouncementsAction(
  filters: AnnouncementFilters
): Promise<ActionResult<PaginatedResult<AnnouncementVO>>> {
  try {
    await requirePlatform()
    const service = createAnnouncementService()
    const result = await service.getAll(filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createAnnouncementAction(input: unknown): Promise<ActionResult<AnnouncementVO>> {
  try {
    const user = await requirePlatform()
    const dto = createAnnouncementSchema.parse(input)
    const service = createAnnouncementService()
    const result = await service.create(dto, user.id)
    revalidatePath('/platform/announcements')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function publishAnnouncementAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePlatform()
    const service = createAnnouncementService()
    await service.publish(id)
    revalidatePath('/platform/announcements')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function markAnnouncementReadAction(id: string): Promise<ActionResult<null>> {
  try {
    const user = await requireAuth()
    const service = createAnnouncementService()
    await service.markRead(id, user.id)
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 通知 ----

export async function getNotificationsAction(
  filters: NotificationFilters
): Promise<ActionResult<PaginatedResult<NotificationVO>>> {
  try {
    const user = await requireAuth()
    const service = createNotificationService()
    const result = await service.getNotifications(user.id, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getUnreadCountAction(): Promise<ActionResult<number>> {
  try {
    const user = await requireAuth()
    const service = createNotificationService()
    const count = await service.getUnreadCount(user.id)
    return ok(count)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function markNotificationReadAction(id: string): Promise<ActionResult<null>> {
  try {
    await requireAuth()
    const service = createNotificationService()
    await service.markRead(id)
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<null>> {
  try {
    const user = await requireAuth()
    const service = createNotificationService()
    await service.markAllRead(user.id)
    revalidatePath('/notifications')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 配置管理 ----

export async function getConfigGroupsAction(): Promise<ActionResult<string[]>> {
  try {
    await requirePlatform()
    const service = createSystemConfigService()
    const groups = await service.getAllGroups()
    return ok(groups)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getConfigsByGroupAction(
  group: string,
  tenantId?: string
): Promise<ActionResult<ConfigItemVO[]>> {
  try {
    await requirePlatform()
    const service = createSystemConfigService()
    const items = await service.getConfigsByGroup(group, tenantId)
    return ok(items)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function updateConfigAction(input: unknown): Promise<ActionResult<ConfigItemVO>> {
  try {
    await requirePlatform()
    const dto = updateConfigSchema.parse(input)
    const service = createSystemConfigService()
    const result = await service.updateConfig(dto)
    revalidatePath('/platform/settings')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

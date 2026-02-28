'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  getAnnouncementsAction, markAnnouncementReadAction,
  getNotificationsAction, getUnreadCountAction,
  markNotificationReadAction, markAllNotificationsReadAction,
  getConfigGroupsAction, getConfigsByGroupAction, updateConfigAction,
} from '../actions/system.action'
import type { AnnouncementFilters, NotificationFilters } from '../types/system.types'

// ---- 公告 ----

export function useAnnouncements(filters: AnnouncementFilters) {
  return useQuery({
    queryKey: ['announcements', filters],
    queryFn: () => getAnnouncementsAction(filters),
  })
}

export function useMarkAnnouncementRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAnnouncementReadAction,
    onSuccess: (r) => {
      if (r.success) qc.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}

// ---- 通知 ----

export function useNotifications(filters: NotificationFilters) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => getNotificationsAction(filters),
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadCountAction(),
    refetchInterval: 30 * 1000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markNotificationReadAction,
    onSuccess: (r) => {
      if (r.success) qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: markAllNotificationsReadAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('operation_success'))
        qc.invalidateQueries({ queryKey: ['notifications'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 配置管理 ----

export function useConfigGroups() {
  return useQuery({
    queryKey: ['config-groups'],
    queryFn: () => getConfigGroupsAction(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useConfigsByGroup(group: string, tenantId?: string) {
  return useQuery({
    queryKey: ['configs', group, tenantId],
    queryFn: () => getConfigsByGroupAction(group, tenantId),
    enabled: !!group,
  })
}

export function useUpdateConfig() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: updateConfigAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('save_success'))
        qc.invalidateQueries({ queryKey: ['configs'] })
      } else toast.error(r.error)
    },
  })
}

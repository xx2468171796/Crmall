'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  getCustomersAction, getCustomerByIdAction,
  createCustomerAction, updateCustomerAction, deleteCustomerAction,
  getOpportunitiesAction, createOpportunityAction,
  updateOpportunityAction, updateOpportunityStageAction, deleteOpportunityAction,
  getOpportunityStagesAction,
  getFollowUpsAction, createFollowUpAction,
} from '../actions/crm.action'
import type { CustomerFilters, OpportunityFilters } from '../types/crm.types'

// ---- 客户 ----

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => getCustomersAction(filters),
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerByIdAction(id),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: createCustomerAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('save_success'))
        qc.invalidateQueries({ queryKey: ['customers'] })
      } else toast.error(r.error)
    },
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateCustomerAction(id, data),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('save_success'))
        qc.invalidateQueries({ queryKey: ['customers'] })
      } else toast.error(r.error)
    },
  })
}

export function useDeleteCustomer() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: deleteCustomerAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('operation_success'))
        qc.invalidateQueries({ queryKey: ['customers'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 商机 ----

export function useOpportunities(filters: OpportunityFilters) {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => getOpportunitiesAction(filters),
  })
}

export function useCreateOpportunity() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: createOpportunityAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('save_success'))
        qc.invalidateQueries({ queryKey: ['opportunities'] })
      } else toast.error(r.error)
    },
  })
}

export function useUpdateOpportunity() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateOpportunityAction(id, data),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('save_success'))
        qc.invalidateQueries({ queryKey: ['opportunities'] })
      } else toast.error(r.error)
    },
  })
}

export function useUpdateOpportunityStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => updateOpportunityStageAction(id, stage),
    onSuccess: (r) => {
      if (r.success) qc.invalidateQueries({ queryKey: ['opportunities'] })
      else toast.error(r.error)
    },
  })
}

export function useDeleteOpportunity() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: deleteOpportunityAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('operation_success'))
        qc.invalidateQueries({ queryKey: ['opportunities'] })
      } else toast.error(r.error)
    },
  })
}

export function useOpportunityStages() {
  return useQuery({
    queryKey: ['opportunity-stages'],
    queryFn: () => getOpportunityStagesAction(),
    staleTime: 5 * 60 * 1000,
  })
}

// ---- 跟进 ----

export function useFollowUps(customerId?: string, opportunityId?: string) {
  return useQuery({
    queryKey: ['followups', customerId, opportunityId],
    queryFn: () => getFollowUpsAction(customerId, opportunityId),
    enabled: !!(customerId || opportunityId),
  })
}

export function useCreateFollowUp() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: createFollowUpAction,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('save_success'))
        qc.invalidateQueries({ queryKey: ['followups'] })
      } else toast.error(r.error)
    },
  })
}

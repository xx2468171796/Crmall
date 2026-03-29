'use server'

import { requirePermission } from '@/lib/container'
import {
  createCustomerService, createOpportunityService, createFollowUpService,
} from '@/lib/container'
import { getDataScopeFilter } from '@/lib/data-scope'
import {
  createCustomerSchema, updateCustomerSchema,
  createOpportunitySchema, updateOpportunitySchema,
  createFollowUpSchema,
} from '../schemas/crm.schema'
import { withAction, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type {
  CustomerVO, CustomerFilters,
  OpportunityVO, OpportunityFilters,
  FollowUpVO,
} from '../types/crm.types'

// ---- 客户 ----

export function getCustomersAction(
  filters: CustomerFilters
): Promise<ActionResult<PaginatedResult<CustomerVO>>> {
  return withAction(async () => {
    const user = await requirePermission('crm:read:customer')
    const scopeFilter = getDataScopeFilter(user, 'crm:read:customer')
    const service = createCustomerService(user.tenantId, user.isPlatform)
    return service.getCustomers(user.tenantId, { ...filters, ...scopeFilter })
  })
}

export function getCustomerByIdAction(id: string): Promise<ActionResult<CustomerVO | null>> {
  return withAction(async () => {
    const user = await requirePermission('crm:read:customer')
    const service = createCustomerService(user.tenantId, user.isPlatform)
    return service.getCustomerById(id)
  })
}

export function createCustomerAction(input: unknown): Promise<ActionResult<CustomerVO>> {
  return withAction(async () => {
    const user = await requirePermission('crm:create:customer')
    const dto = createCustomerSchema.parse(input)
    const service = createCustomerService(user.tenantId, user.isPlatform)
    const result = await service.createCustomer(user.tenantId, dto, user.id)
    revalidatePath('/customers')
    return result
  })
}

export function updateCustomerAction(id: string, input: unknown): Promise<ActionResult<CustomerVO>> {
  return withAction(async () => {
    const user = await requirePermission('crm:update:customer')
    const dto = updateCustomerSchema.parse(input)
    const service = createCustomerService(user.tenantId, user.isPlatform)
    const result = await service.updateCustomer(id, dto)
    revalidatePath('/customers')
    return result
  })
}

export function deleteCustomerAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('crm:delete:customer')
    const service = createCustomerService(user.tenantId, user.isPlatform)
    await service.deleteCustomer(id)
    revalidatePath('/customers')
    return null
  })
}

// ---- 商机 ----

export function getOpportunitiesAction(
  filters: OpportunityFilters
): Promise<ActionResult<PaginatedResult<OpportunityVO>>> {
  return withAction(async () => {
    const user = await requirePermission('crm:read:opportunity')
    const scopeFilter = getDataScopeFilter(user, 'crm:read:opportunity')
    const service = createOpportunityService(user.tenantId, user.isPlatform)
    return service.getOpportunities(user.tenantId, { ...filters, ...scopeFilter })
  })
}

export function createOpportunityAction(input: unknown): Promise<ActionResult<OpportunityVO>> {
  return withAction(async () => {
    const user = await requirePermission('crm:create:opportunity')
    const dto = createOpportunitySchema.parse(input)
    const service = createOpportunityService(user.tenantId, user.isPlatform)
    const result = await service.createOpportunity(user.tenantId, dto, user.id)
    revalidatePath('/opportunities')
    return result
  })
}

export function updateOpportunityAction(id: string, input: unknown): Promise<ActionResult<OpportunityVO>> {
  return withAction(async () => {
    const user = await requirePermission('crm:update:opportunity')
    const dto = updateOpportunitySchema.parse(input)
    const service = createOpportunityService(user.tenantId, user.isPlatform)
    const result = await service.updateOpportunity(id, dto)
    revalidatePath('/opportunities')
    return result
  })
}

export function updateOpportunityStageAction(id: string, stage: string): Promise<ActionResult<OpportunityVO>> {
  return withAction(async () => {
    const user = await requirePermission('crm:update:opportunity')
    const service = createOpportunityService(user.tenantId, user.isPlatform)
    const result = await service.updateStage(id, stage)
    revalidatePath('/opportunities')
    return result
  })
}

export function deleteOpportunityAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('crm:delete:opportunity')
    const service = createOpportunityService(user.tenantId, user.isPlatform)
    await service.deleteOpportunity(id)
    revalidatePath('/opportunities')
    return null
  })
}

export function getOpportunityStagesAction(): Promise<ActionResult<string[]>> {
  return withAction(async () => {
    const user = await requirePermission('crm:read:opportunity')
    const service = createOpportunityService(user.tenantId, user.isPlatform)
    return service.getStages(user.tenantId)
  })
}

// ---- 跟进 ----

export function getFollowUpsAction(
  customerId?: string,
  opportunityId?: string
): Promise<ActionResult<FollowUpVO[]>> {
  return withAction(async () => {
    const user = await requirePermission('crm:read:followup')
    const service = createFollowUpService(user.tenantId, user.isPlatform)
    return service.getFollowUps(customerId, opportunityId)
  })
}

export function createFollowUpAction(input: unknown): Promise<ActionResult<FollowUpVO>> {
  return withAction(async () => {
    const user = await requirePermission('crm:create:followup')
    const dto = createFollowUpSchema.parse(input)
    const service = createFollowUpService(user.tenantId, user.isPlatform)
    const result = await service.createFollowUp(user.tenantId, dto, user.id)
    revalidatePath('/customers')
    revalidatePath('/opportunities')
    return result
  })
}

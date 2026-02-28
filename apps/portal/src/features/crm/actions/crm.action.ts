'use server'

import { requirePermission } from '@/lib/container'
import {
  createCustomerService, createOpportunityService, createFollowUpService,
} from '@/lib/container'
import {
  createCustomerSchema, updateCustomerSchema,
  createOpportunitySchema, updateOpportunitySchema,
  createFollowUpSchema,
} from '../schemas/crm.schema'
import { ok, fail, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { AppError } from '@twcrm/shared'
import { revalidatePath } from 'next/cache'
import type {
  CustomerVO, CustomerFilters,
  OpportunityVO, OpportunityFilters,
  FollowUpVO,
} from '../types/crm.types'

// ---- 客户 ----

export async function getCustomersAction(
  filters: CustomerFilters
): Promise<ActionResult<PaginatedResult<CustomerVO>>> {
  try {
    const user = await requirePermission('crm:read:customer')
    const service = createCustomerService()
    const result = await service.getCustomers(user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getCustomerByIdAction(id: string): Promise<ActionResult<CustomerVO | null>> {
  try {
    await requirePermission('crm:read:customer')
    const service = createCustomerService()
    return ok(await service.getCustomerById(id))
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createCustomerAction(input: unknown): Promise<ActionResult<CustomerVO>> {
  try {
    const user = await requirePermission('crm:create:customer')
    const dto = createCustomerSchema.parse(input)
    const service = createCustomerService()
    const result = await service.createCustomer(user.tenantId, dto, user.id)
    revalidatePath('/customers')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function updateCustomerAction(id: string, input: unknown): Promise<ActionResult<CustomerVO>> {
  try {
    await requirePermission('crm:update:customer')
    const dto = updateCustomerSchema.parse(input)
    const service = createCustomerService()
    const result = await service.updateCustomer(id, dto)
    revalidatePath('/customers')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('crm:delete:customer')
    const service = createCustomerService()
    await service.deleteCustomer(id)
    revalidatePath('/customers')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 商机 ----

export async function getOpportunitiesAction(
  filters: OpportunityFilters
): Promise<ActionResult<PaginatedResult<OpportunityVO>>> {
  try {
    const user = await requirePermission('crm:read:opportunity')
    const service = createOpportunityService()
    const result = await service.getOpportunities(user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createOpportunityAction(input: unknown): Promise<ActionResult<OpportunityVO>> {
  try {
    const user = await requirePermission('crm:create:opportunity')
    const dto = createOpportunitySchema.parse(input)
    const service = createOpportunityService()
    const result = await service.createOpportunity(user.tenantId, dto, user.id)
    revalidatePath('/opportunities')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function updateOpportunityAction(id: string, input: unknown): Promise<ActionResult<OpportunityVO>> {
  try {
    await requirePermission('crm:update:opportunity')
    const dto = updateOpportunitySchema.parse(input)
    const service = createOpportunityService()
    const result = await service.updateOpportunity(id, dto)
    revalidatePath('/opportunities')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function updateOpportunityStageAction(id: string, stage: string): Promise<ActionResult<OpportunityVO>> {
  try {
    await requirePermission('crm:update:opportunity')
    const service = createOpportunityService()
    const result = await service.updateStage(id, stage)
    revalidatePath('/opportunities')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function deleteOpportunityAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('crm:delete:opportunity')
    const service = createOpportunityService()
    await service.deleteOpportunity(id)
    revalidatePath('/opportunities')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getOpportunityStagesAction(): Promise<ActionResult<string[]>> {
  try {
    const user = await requirePermission('crm:read:opportunity')
    const service = createOpportunityService()
    const stages = await service.getStages(user.tenantId)
    return ok(stages)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ---- 跟进 ----

export async function getFollowUpsAction(
  customerId?: string,
  opportunityId?: string
): Promise<ActionResult<FollowUpVO[]>> {
  try {
    await requirePermission('crm:read:followup')
    const service = createFollowUpService()
    const result = await service.getFollowUps(customerId, opportunityId)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function createFollowUpAction(input: unknown): Promise<ActionResult<FollowUpVO>> {
  try {
    const user = await requirePermission('crm:create:followup')
    const dto = createFollowUpSchema.parse(input)
    const service = createFollowUpService()
    const result = await service.createFollowUp(user.tenantId, dto, user.id)
    revalidatePath('/customers')
    revalidatePath('/opportunities')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

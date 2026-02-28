// ============================================
// CRM — Service 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  CustomerVO, CustomerFilters, CreateCustomerDTO, UpdateCustomerDTO,
  OpportunityVO, OpportunityFilters, CreateOpportunityDTO, UpdateOpportunityDTO,
  FollowUpVO, CreateFollowUpDTO,
} from '../types/crm.types'

export interface ICustomerService {
  getCustomers(tenantId: string, filters: CustomerFilters): Promise<PaginatedResult<CustomerVO>>
  getCustomerById(id: string): Promise<CustomerVO | null>
  createCustomer(tenantId: string, dto: CreateCustomerDTO, createdBy: string): Promise<CustomerVO>
  updateCustomer(id: string, dto: UpdateCustomerDTO): Promise<CustomerVO>
  deleteCustomer(id: string): Promise<void>
}

export interface IOpportunityService {
  getOpportunities(tenantId: string, filters: OpportunityFilters): Promise<PaginatedResult<OpportunityVO>>
  getOpportunityById(id: string): Promise<OpportunityVO | null>
  createOpportunity(tenantId: string, dto: CreateOpportunityDTO, createdBy: string): Promise<OpportunityVO>
  updateOpportunity(id: string, dto: UpdateOpportunityDTO): Promise<OpportunityVO>
  updateStage(id: string, stage: string): Promise<OpportunityVO>
  deleteOpportunity(id: string): Promise<void>
  getStages(tenantId: string): Promise<string[]>
}

export interface IFollowUpService {
  getFollowUps(customerId?: string, opportunityId?: string): Promise<FollowUpVO[]>
  createFollowUp(tenantId: string, dto: CreateFollowUpDTO, createdBy: string): Promise<FollowUpVO>
}

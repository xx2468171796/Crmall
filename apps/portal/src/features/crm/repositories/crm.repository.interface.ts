// ============================================
// CRM — Repository 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  CustomerVO, CustomerFilters, CreateCustomerDTO, UpdateCustomerDTO,
  OpportunityVO, OpportunityFilters, CreateOpportunityDTO, UpdateOpportunityDTO,
  FollowUpVO, CreateFollowUpDTO,
} from '../types/crm.types'

export interface ICustomerRepository {
  findById(id: string): Promise<CustomerVO | null>
  findByTenant(tenantId: string, filters: CustomerFilters): Promise<PaginatedResult<CustomerVO>>
  create(tenantId: string, dto: CreateCustomerDTO, createdBy: string): Promise<CustomerVO>
  update(id: string, dto: UpdateCustomerDTO): Promise<CustomerVO>
  delete(id: string): Promise<void>
}

export interface IOpportunityRepository {
  findById(id: string): Promise<OpportunityVO | null>
  findByTenant(tenantId: string, filters: OpportunityFilters): Promise<PaginatedResult<OpportunityVO>>
  create(tenantId: string, dto: CreateOpportunityDTO, createdBy: string): Promise<OpportunityVO>
  update(id: string, dto: UpdateOpportunityDTO): Promise<OpportunityVO>
  delete(id: string): Promise<void>
}

export interface IFollowUpRepository {
  findByCustomer(customerId: string): Promise<FollowUpVO[]>
  findByOpportunity(opportunityId: string): Promise<FollowUpVO[]>
  create(tenantId: string, dto: CreateFollowUpDTO, createdBy: string): Promise<FollowUpVO>
}

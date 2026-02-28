// ============================================
// CRM — Service 实现
// 商机阶段、客户等级、客户来源等从 ConfigService 读取
// ============================================

import type { IConfigService, PaginatedResult } from '@twcrm/shared'
import { BusinessRuleError, NotFoundError } from '@twcrm/shared'
import type { ICustomerRepository, IOpportunityRepository, IFollowUpRepository } from '../repositories/crm.repository.interface'
import type { ICustomerService, IOpportunityService, IFollowUpService } from './crm.service.interface'
import type {
  CustomerVO, CustomerFilters, CreateCustomerDTO, UpdateCustomerDTO,
  OpportunityVO, OpportunityFilters, CreateOpportunityDTO, UpdateOpportunityDTO,
  FollowUpVO, CreateFollowUpDTO,
} from '../types/crm.types'

// ---- 客户 ----

export class CustomerService implements ICustomerService {
  constructor(
    private readonly customerRepo: ICustomerRepository,
    private readonly configService: IConfigService,
  ) {}

  async getCustomers(tenantId: string, filters: CustomerFilters): Promise<PaginatedResult<CustomerVO>> {
    return this.customerRepo.findByTenant(tenantId, filters)
  }

  async getCustomerById(id: string): Promise<CustomerVO | null> {
    return this.customerRepo.findById(id)
  }

  async createCustomer(tenantId: string, dto: CreateCustomerDTO, createdBy: string): Promise<CustomerVO> {
    // 校验客户等级是否在可配置列表中
    if (dto.level) {
      const levels = await this.configService.getJson<string[]>('crm', 'customer_levels', tenantId, ['vip', 'gold', 'silver', 'normal'])
      if (!levels.includes(dto.level)) {
        throw new BusinessRuleError(`无效的客户等级: ${dto.level}`)
      }
    }
    // 校验客户来源
    if (dto.source) {
      const sources = await this.configService.getJson<string[]>('crm', 'customer_sources', tenantId, ['referral', 'website', 'exhibition', 'cold_call'])
      if (!sources.includes(dto.source)) {
        throw new BusinessRuleError(`无效的客户来源: ${dto.source}`)
      }
    }
    return this.customerRepo.create(tenantId, dto, createdBy)
  }

  async updateCustomer(id: string, dto: UpdateCustomerDTO): Promise<CustomerVO> {
    const existing = await this.customerRepo.findById(id)
    if (!existing) throw new NotFoundError('客户', id)
    return this.customerRepo.update(id, dto)
  }

  async deleteCustomer(id: string): Promise<void> {
    const existing = await this.customerRepo.findById(id)
    if (!existing) throw new NotFoundError('客户', id)
    return this.customerRepo.delete(id)
  }
}

// ---- 商机 ----

export class OpportunityService implements IOpportunityService {
  constructor(
    private readonly opportunityRepo: IOpportunityRepository,
    private readonly configService: IConfigService,
  ) {}

  async getOpportunities(tenantId: string, filters: OpportunityFilters): Promise<PaginatedResult<OpportunityVO>> {
    return this.opportunityRepo.findByTenant(tenantId, filters)
  }

  async getOpportunityById(id: string): Promise<OpportunityVO | null> {
    return this.opportunityRepo.findById(id)
  }

  async createOpportunity(tenantId: string, dto: CreateOpportunityDTO, createdBy: string): Promise<OpportunityVO> {
    // 校验商机阶段是否在可配置列表中
    if (dto.stage) {
      const stages = await this.getStages(tenantId)
      if (!stages.includes(dto.stage)) {
        throw new BusinessRuleError(`无效的商机阶段: ${dto.stage}`)
      }
    }
    return this.opportunityRepo.create(tenantId, dto, createdBy)
  }

  async updateOpportunity(id: string, dto: UpdateOpportunityDTO): Promise<OpportunityVO> {
    const existing = await this.opportunityRepo.findById(id)
    if (!existing) throw new NotFoundError('商机', id)
    return this.opportunityRepo.update(id, dto)
  }

  async updateStage(id: string, stage: string): Promise<OpportunityVO> {
    const existing = await this.opportunityRepo.findById(id)
    if (!existing) throw new NotFoundError('商机', id)
    const stages = await this.getStages(existing.tenantId)
    if (!stages.includes(stage)) {
      throw new BusinessRuleError(`无效的商机阶段: ${stage}`)
    }
    return this.opportunityRepo.update(id, { stage })
  }

  async deleteOpportunity(id: string): Promise<void> {
    const existing = await this.opportunityRepo.findById(id)
    if (!existing) throw new NotFoundError('商机', id)
    return this.opportunityRepo.delete(id)
  }

  async getStages(tenantId: string): Promise<string[]> {
    return this.configService.getJson<string[]>(
      'crm', 'opportunity_stages', tenantId,
      ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    )
  }
}

// ---- 跟进 ----

export class FollowUpService implements IFollowUpService {
  constructor(
    private readonly followUpRepo: IFollowUpRepository,
    private readonly configService: IConfigService,
  ) {}

  async getFollowUps(customerId?: string, opportunityId?: string): Promise<FollowUpVO[]> {
    if (customerId) return this.followUpRepo.findByCustomer(customerId)
    if (opportunityId) return this.followUpRepo.findByOpportunity(opportunityId)
    return []
  }

  async createFollowUp(tenantId: string, dto: CreateFollowUpDTO, createdBy: string): Promise<FollowUpVO> {
    // 校验跟进类型
    const types = await this.configService.getJson<string[]>(
      'crm', 'follow_up_types', tenantId,
      ['call', 'visit', 'email', 'wechat', 'line'],
    )
    if (!types.includes(dto.type)) {
      throw new BusinessRuleError(`无效的跟进类型: ${dto.type}`)
    }
    return this.followUpRepo.create(tenantId, dto, createdBy)
  }
}

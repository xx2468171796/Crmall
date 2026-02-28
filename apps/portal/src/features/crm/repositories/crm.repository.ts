// ============================================
// CRM — Repository 实现
// ============================================

import type { PrismaClient } from '@twcrm/db'
import type { PaginatedResult } from '@twcrm/shared'
import type { ICustomerRepository, IOpportunityRepository, IFollowUpRepository } from './crm.repository.interface'
import type {
  CustomerVO, CustomerFilters, CreateCustomerDTO, UpdateCustomerDTO,
  OpportunityVO, OpportunityFilters, CreateOpportunityDTO, UpdateOpportunityDTO,
  FollowUpVO, CreateFollowUpDTO,
} from '../types/crm.types'

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<CustomerVO | null> {
    const c = await this.prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { contacts: true, opportunities: true } } },
    })
    return c ? this.toVO(c) : null
  }

  async findByTenant(tenantId: string, filters: CustomerFilters): Promise<PaginatedResult<CustomerVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: any = { tenantId }
    if (filters.status) where.status = filters.status
    if (filters.level) where.level = filters.level
    if (filters.source) where.source = filters.source
    if (filters.ownerId) where.ownerId = filters.ownerId
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { contacts: true, opportunities: true } } },
      }),
      this.prisma.customer.count({ where }),
    ])

    return {
      items: items.map((c) => this.toVO(c)),
      total, page, perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(tenantId: string, dto: CreateCustomerDTO, createdBy: string): Promise<CustomerVO> {
    const c = await this.prisma.customer.create({
      data: { ...dto, tenantId, createdBy },
      include: { _count: { select: { contacts: true, opportunities: true } } },
    })
    return this.toVO(c)
  }

  async update(id: string, dto: UpdateCustomerDTO): Promise<CustomerVO> {
    const c = await this.prisma.customer.update({
      where: { id },
      data: dto,
      include: { _count: { select: { contacts: true, opportunities: true } } },
    })
    return this.toVO(c)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({ where: { id } })
  }

  private toVO(c: any): CustomerVO {
    return {
      id: c.id, tenantId: c.tenantId, name: c.name, type: c.type,
      industry: c.industry, source: c.source, phone: c.phone, email: c.email,
      address: c.address, city: c.city, region: c.region, level: c.level,
      status: c.status, ownerId: c.ownerId, tags: c.tags ?? [],
      remark: c.remark,
      contactCount: c._count?.contacts ?? 0,
      opportunityCount: c._count?.opportunities ?? 0,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }
  }
}

export class OpportunityRepository implements IOpportunityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<OpportunityVO | null> {
    const o = await this.prisma.opportunity.findUnique({
      where: { id },
      include: { customer: { select: { name: true } } },
    })
    return o ? this.toVO(o) : null
  }

  async findByTenant(tenantId: string, filters: OpportunityFilters): Promise<PaginatedResult<OpportunityVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: any = { tenantId }
    if (filters.stage) where.stage = filters.stage
    if (filters.ownerId) where.ownerId = filters.ownerId
    if (filters.customerId) where.customerId = filters.customerId
    if (filters.search) {
      where.OR = [{ title: { contains: filters.search, mode: 'insensitive' } }]
    }

    const [items, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { updatedAt: 'desc' },
        include: { customer: { select: { name: true } } },
      }),
      this.prisma.opportunity.count({ where }),
    ])

    return {
      items: items.map((o) => this.toVO(o)),
      total, page, perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(tenantId: string, dto: CreateOpportunityDTO, createdBy: string): Promise<OpportunityVO> {
    const o = await this.prisma.opportunity.create({
      data: { ...dto, tenantId, createdBy },
      include: { customer: { select: { name: true } } },
    })
    return this.toVO(o)
  }

  async update(id: string, dto: UpdateOpportunityDTO): Promise<OpportunityVO> {
    const o = await this.prisma.opportunity.update({
      where: { id },
      data: dto,
      include: { customer: { select: { name: true } } },
    })
    return this.toVO(o)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.opportunity.delete({ where: { id } })
  }

  private toVO(o: any): OpportunityVO {
    return {
      id: o.id, tenantId: o.tenantId, customerId: o.customerId,
      customerName: o.customer?.name ?? '',
      title: o.title, amount: Number(o.amount), currency: o.currency,
      stage: o.stage, probability: o.probability,
      expectedDate: o.expectedDate?.toISOString() ?? null,
      lostReason: o.lostReason, source: o.source, ownerId: o.ownerId,
      tags: o.tags ?? [], remark: o.remark,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }
  }
}

export class FollowUpRepository implements IFollowUpRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCustomer(customerId: string): Promise<FollowUpVO[]> {
    const items = await this.prisma.followUp.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    })
    return items.map(this.toVO)
  }

  async findByOpportunity(opportunityId: string): Promise<FollowUpVO[]> {
    const items = await this.prisma.followUp.findMany({
      where: { opportunityId },
      orderBy: { createdAt: 'desc' },
    })
    return items.map(this.toVO)
  }

  async create(tenantId: string, dto: CreateFollowUpDTO, createdBy: string): Promise<FollowUpVO> {
    const f = await this.prisma.followUp.create({
      data: { ...dto, tenantId, createdBy },
    })
    return this.toVO(f)
  }

  private toVO(f: any): FollowUpVO {
    return {
      id: f.id, type: f.type, content: f.content,
      nextDate: f.nextDate?.toISOString() ?? null,
      createdBy: f.createdBy,
      createdAt: f.createdAt.toISOString(),
    }
  }
}

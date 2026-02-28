// ============================================
// CRM 模块 — 类型定义
// ============================================

// ---- 客户 ----

export interface CustomerVO {
  id: string
  tenantId: string
  name: string
  type: string
  industry: string | null
  source: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  region: string | null
  level: string
  status: string
  ownerId: string | null
  tags: string[]
  remark: string | null
  contactCount: number
  opportunityCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerDTO {
  name: string
  type?: string
  industry?: string
  source?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  region?: string
  level?: string
  ownerId?: string
  tags?: string[]
  remark?: string
}

export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> {}

export interface CustomerFilters {
  search?: string
  status?: string
  level?: string
  source?: string
  ownerId?: string
  page?: number
  perPage?: number
}

// ---- 商机 ----

export interface OpportunityVO {
  id: string
  tenantId: string
  customerId: string
  customerName: string
  title: string
  amount: number
  currency: string
  stage: string
  probability: number
  expectedDate: string | null
  lostReason: string | null
  source: string | null
  ownerId: string
  tags: string[]
  remark: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateOpportunityDTO {
  customerId: string
  title: string
  amount: number
  currency?: string
  stage?: string
  probability?: number
  expectedDate?: string
  source?: string
  ownerId: string
  tags?: string[]
  remark?: string
}

export interface UpdateOpportunityDTO extends Partial<CreateOpportunityDTO> {}

export interface OpportunityFilters {
  search?: string
  stage?: string
  ownerId?: string
  customerId?: string
  page?: number
  perPage?: number
}

// ---- 跟进记录 ----

export interface FollowUpVO {
  id: string
  type: string
  content: string
  nextDate: string | null
  createdBy: string
  createdAt: string
}

export interface CreateFollowUpDTO {
  customerId?: string
  opportunityId?: string
  type: string
  content: string
  nextDate?: string
}

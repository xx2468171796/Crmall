// ============================================
// 财务模块 — Repository 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  PaymentVO, PaymentFilters, CreatePaymentDTO,
  DisbursementVO, DisbursementFilters, CreateDisbursementDTO,
  InvoiceVO, InvoiceFilters,
  ExpenseVO, ExpenseFilters, CreateExpenseDTO,
} from '../types/finance.types'

// ---- 收款 ----

export interface IPaymentRepository {
  findById(id: string): Promise<PaymentVO | null>
  findByTenant(tenantId: string, filters: PaymentFilters): Promise<PaginatedResult<PaymentVO>>
  create(tenantId: string, data: CreatePaymentDTO & { paymentNo: string; status: string; createdBy: string }): Promise<PaymentVO>
  confirm(id: string, confirmedBy: string): Promise<void>
  refund(id: string): Promise<void>
}

// ---- 付款 ----

export interface IDisbursementRepository {
  findById(id: string): Promise<DisbursementVO | null>
  findByTenant(tenantId: string, filters: DisbursementFilters): Promise<PaginatedResult<DisbursementVO>>
  create(tenantId: string, data: CreateDisbursementDTO & { disbNo: string; status: string; requestedBy: string }): Promise<DisbursementVO>
  approve(id: string, approvedBy: string): Promise<void>
  markPaid(id: string): Promise<void>
  reject(id: string): Promise<void>
}

// ---- 发票 ----

export interface IInvoiceRepository {
  findById(id: string): Promise<InvoiceVO | null>
  findByTenant(tenantId: string, filters: InvoiceFilters): Promise<PaginatedResult<InvoiceVO>>
  create(tenantId: string, data: {
    invoiceNo: string
    type: string
    counterpart: string
    amount: number
    taxRate: number
    taxAmount: number
    totalAmount: number
    orderId?: string
    issueDate: string
    dueDate?: string
    status: string
    refType?: string
    refId?: string
    note?: string
    createdBy: string
  }): Promise<InvoiceVO>
  updateStatus(id: string, status: string): Promise<void>
}

// ---- 费用报销 ----

export interface IExpenseRepository {
  findById(id: string): Promise<ExpenseVO | null>
  findByTenant(tenantId: string, filters: ExpenseFilters): Promise<PaginatedResult<ExpenseVO>>
  create(tenantId: string, data: CreateExpenseDTO & { expenseNo: string; status: string; requestedBy: string }): Promise<ExpenseVO>
  approve(id: string, approvedBy: string): Promise<void>
  reject(id: string): Promise<void>
  markPaid(id: string): Promise<void>
}

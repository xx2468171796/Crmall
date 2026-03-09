// ============================================
// 财务模块 — Service 接口
// ============================================

import type { PaginatedResult } from '@twcrm/shared'
import type {
  PaymentVO, PaymentFilters, CreatePaymentDTO,
  DisbursementVO, DisbursementFilters, CreateDisbursementDTO,
  InvoiceVO, InvoiceFilters, CreateInvoiceDTO,
  ExpenseVO, ExpenseFilters, CreateExpenseDTO,
} from '../types/finance.types'

// ---- 收款 ----

export interface IPaymentService {
  create(tenantId: string, userId: string, dto: CreatePaymentDTO): Promise<PaymentVO>
  getPayments(tenantId: string, filters: PaymentFilters): Promise<PaginatedResult<PaymentVO>>
  confirm(id: string, confirmedBy: string): Promise<void>
  refund(id: string): Promise<void>
}

// ---- 付款 ----

export interface IDisbursementService {
  create(tenantId: string, userId: string, dto: CreateDisbursementDTO): Promise<DisbursementVO>
  getDisbursements(tenantId: string, filters: DisbursementFilters): Promise<PaginatedResult<DisbursementVO>>
  approve(id: string, approvedBy: string): Promise<void>
  markPaid(id: string): Promise<void>
}

// ---- 发票 ----

export interface IInvoiceService {
  create(tenantId: string, userId: string, dto: CreateInvoiceDTO): Promise<InvoiceVO>
  getInvoices(tenantId: string, filters: InvoiceFilters): Promise<PaginatedResult<InvoiceVO>>
  issue(id: string): Promise<void>
  void(id: string): Promise<void>
}

// ---- 费用报销 ----

export interface IExpenseService {
  create(tenantId: string, userId: string, dto: CreateExpenseDTO): Promise<ExpenseVO>
  getExpenses(tenantId: string, filters: ExpenseFilters): Promise<PaginatedResult<ExpenseVO>>
  approve(id: string, approvedBy: string): Promise<void>
  reject(id: string): Promise<void>
  markPaid(id: string): Promise<void>
}

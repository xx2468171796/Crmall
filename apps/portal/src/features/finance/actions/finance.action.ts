'use server'

import { requirePermission } from '@/lib/container'
import {
  createPaymentService, createDisbursementService,
  createInvoiceService, createExpenseService,
} from '@/lib/container'
import {
  createPaymentSchema, createDisbursementSchema,
  createInvoiceSchema, createExpenseSchema,
} from '../schemas/finance.schema'
import { withAction, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { getDataScopeFilter } from '@/lib/data-scope'
import { revalidatePath } from 'next/cache'
import type {
  PaymentVO, PaymentFilters,
  DisbursementVO, DisbursementFilters,
  InvoiceVO, InvoiceFilters,
  ExpenseVO, ExpenseFilters,
} from '../types/finance.types'

// ============================================
// 收款 (Payment) Actions
// ============================================

export function createPaymentAction(input: unknown): Promise<ActionResult<PaymentVO>> {
  return withAction(async () => {
    const user = await requirePermission('finance:create:payment')
    const dto = createPaymentSchema.parse(input)
    const service = createPaymentService(user.tenantId, user.isPlatform)
    const result = await service.create(user.tenantId, user.id, dto)
    revalidatePath('/finance/payments')
    return result
  })
}

export function getPaymentsAction(
  filters: PaymentFilters
): Promise<ActionResult<PaginatedResult<PaymentVO>>> {
  return withAction(async () => {
    const user = await requirePermission('finance:read:payment')
    const scopeFilter = getDataScopeFilter(user, 'finance:read:payment')
    const service = createPaymentService(user.tenantId, user.isPlatform)
    return service.getPayments(user.tenantId, { ...filters, ...scopeFilter })
  })
}

export function confirmPaymentAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('finance:approve:payment')
    const service = createPaymentService(user.tenantId, user.isPlatform)
    await service.confirm(id, user.id)
    revalidatePath('/finance/payments')
    return null
  })
}

export function refundPaymentAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('finance:update:payment')
    const service = createPaymentService(user.tenantId, user.isPlatform)
    await service.refund(id)
    revalidatePath('/finance/payments')
    return null
  })
}

// ============================================
// 付款 (Disbursement) Actions
// ============================================

export function createDisbursementAction(input: unknown): Promise<ActionResult<DisbursementVO>> {
  return withAction(async () => {
    const user = await requirePermission('finance:create:disbursement')
    const dto = createDisbursementSchema.parse(input)
    const service = createDisbursementService(user.tenantId, user.isPlatform)
    const result = await service.create(user.tenantId, user.id, dto)
    revalidatePath('/finance/disbursements')
    return result
  })
}

export function getDisbursementsAction(
  filters: DisbursementFilters
): Promise<ActionResult<PaginatedResult<DisbursementVO>>> {
  return withAction(async () => {
    const user = await requirePermission('finance:read:disbursement')
    const scopeFilter = getDataScopeFilter(user, 'finance:read:disbursement')
    const service = createDisbursementService(user.tenantId, user.isPlatform)
    return service.getDisbursements(user.tenantId, { ...filters, ...scopeFilter })
  })
}

export function approveDisbursementAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('finance:approve:disbursement')
    const service = createDisbursementService(user.tenantId, user.isPlatform)
    await service.approve(id, user.id)
    revalidatePath('/finance/disbursements')
    return null
  })
}

export function markDisbursementPaidAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('finance:update:disbursement')
    const service = createDisbursementService(user.tenantId, user.isPlatform)
    await service.markPaid(id)
    revalidatePath('/finance/disbursements')
    return null
  })
}

// ============================================
// 发票 (Invoice) Actions
// ============================================

export function createInvoiceAction(input: unknown): Promise<ActionResult<InvoiceVO>> {
  return withAction(async () => {
    const user = await requirePermission('finance:create:invoice')
    const dto = createInvoiceSchema.parse(input)
    const service = createInvoiceService(user.tenantId, user.isPlatform)
    const result = await service.create(user.tenantId, user.id, dto)
    revalidatePath('/finance/invoices')
    return result
  })
}

export function getInvoicesAction(
  filters: InvoiceFilters
): Promise<ActionResult<PaginatedResult<InvoiceVO>>> {
  return withAction(async () => {
    const user = await requirePermission('finance:read:invoice')
    const scopeFilter = getDataScopeFilter(user, 'finance:read:invoice')
    const service = createInvoiceService(user.tenantId, user.isPlatform)
    return service.getInvoices(user.tenantId, { ...filters, ...scopeFilter })
  })
}

export function issueInvoiceAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('finance:update:invoice')
    const service = createInvoiceService(user.tenantId, user.isPlatform)
    await service.issue(id)
    revalidatePath('/finance/invoices')
    return null
  })
}

export function voidInvoiceAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('finance:delete:invoice')
    const service = createInvoiceService(user.tenantId, user.isPlatform)
    await service.void(id)
    revalidatePath('/finance/invoices')
    return null
  })
}

// ============================================
// 费用报销 (Expense) Actions
// ============================================

export function createExpenseAction(input: unknown): Promise<ActionResult<ExpenseVO>> {
  return withAction(async () => {
    const user = await requirePermission('finance:create:expense')
    const dto = createExpenseSchema.parse(input)
    const service = createExpenseService(user.tenantId, user.isPlatform)
    const result = await service.create(user.tenantId, user.id, dto)
    revalidatePath('/finance/expenses')
    return result
  })
}

export function getExpensesAction(
  filters: ExpenseFilters
): Promise<ActionResult<PaginatedResult<ExpenseVO>>> {
  return withAction(async () => {
    const user = await requirePermission('finance:read:expense')
    const scopeFilter = getDataScopeFilter(user, 'finance:read:expense')
    const service = createExpenseService(user.tenantId, user.isPlatform)
    return service.getExpenses(user.tenantId, { ...filters, ...scopeFilter })
  })
}

export function approveExpenseAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('finance:approve:expense')
    const service = createExpenseService(user.tenantId, user.isPlatform)
    await service.approve(id, user.id)
    revalidatePath('/finance/expenses')
    return null
  })
}

export function rejectExpenseAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('finance:approve:expense')
    const service = createExpenseService(user.tenantId, user.isPlatform)
    await service.reject(id)
    revalidatePath('/finance/expenses')
    return null
  })
}

export function markExpensePaidAction(id: string): Promise<ActionResult<null>> {
  return withAction(async () => {
    const user = await requirePermission('finance:update:expense')
    const service = createExpenseService(user.tenantId, user.isPlatform)
    await service.markPaid(id)
    revalidatePath('/finance/expenses')
    return null
  })
}

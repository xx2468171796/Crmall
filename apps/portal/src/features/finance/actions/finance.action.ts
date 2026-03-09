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
import { ok, fail, type ActionResult, type PaginatedResult } from '@twcrm/shared'
import { AppError } from '@twcrm/shared'
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

export async function createPaymentAction(input: unknown): Promise<ActionResult<PaymentVO>> {
  try {
    const user = await requirePermission('finance:create:payment')
    const dto = createPaymentSchema.parse(input)
    const service = createPaymentService()
    const result = await service.create(user.tenantId, user.id, dto)
    revalidatePath('/finance/payments')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getPaymentsAction(
  filters: PaymentFilters
): Promise<ActionResult<PaginatedResult<PaymentVO>>> {
  try {
    const user = await requirePermission('finance:read:payment')
    const service = createPaymentService()
    const result = await service.getPayments(user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function confirmPaymentAction(id: string): Promise<ActionResult<null>> {
  try {
    const user = await requirePermission('finance:approve:payment')
    const service = createPaymentService()
    await service.confirm(id, user.id)
    revalidatePath('/finance/payments')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function refundPaymentAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('finance:update:payment')
    const service = createPaymentService()
    await service.refund(id)
    revalidatePath('/finance/payments')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ============================================
// 付款 (Disbursement) Actions
// ============================================

export async function createDisbursementAction(input: unknown): Promise<ActionResult<DisbursementVO>> {
  try {
    const user = await requirePermission('finance:create:disbursement')
    const dto = createDisbursementSchema.parse(input)
    const service = createDisbursementService()
    const result = await service.create(user.tenantId, user.id, dto)
    revalidatePath('/finance/disbursements')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getDisbursementsAction(
  filters: DisbursementFilters
): Promise<ActionResult<PaginatedResult<DisbursementVO>>> {
  try {
    const user = await requirePermission('finance:read:disbursement')
    const service = createDisbursementService()
    const result = await service.getDisbursements(user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function approveDisbursementAction(id: string): Promise<ActionResult<null>> {
  try {
    const user = await requirePermission('finance:approve:disbursement')
    const service = createDisbursementService()
    await service.approve(id, user.id)
    revalidatePath('/finance/disbursements')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function markDisbursementPaidAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('finance:update:disbursement')
    const service = createDisbursementService()
    await service.markPaid(id)
    revalidatePath('/finance/disbursements')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ============================================
// 发票 (Invoice) Actions
// ============================================

export async function createInvoiceAction(input: unknown): Promise<ActionResult<InvoiceVO>> {
  try {
    const user = await requirePermission('finance:create:invoice')
    const dto = createInvoiceSchema.parse(input)
    const service = createInvoiceService()
    const result = await service.create(user.tenantId, user.id, dto)
    revalidatePath('/finance/invoices')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getInvoicesAction(
  filters: InvoiceFilters
): Promise<ActionResult<PaginatedResult<InvoiceVO>>> {
  try {
    const user = await requirePermission('finance:read:invoice')
    const service = createInvoiceService()
    const result = await service.getInvoices(user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function issueInvoiceAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('finance:update:invoice')
    const service = createInvoiceService()
    await service.issue(id)
    revalidatePath('/finance/invoices')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function voidInvoiceAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('finance:delete:invoice')
    const service = createInvoiceService()
    await service.void(id)
    revalidatePath('/finance/invoices')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

// ============================================
// 费用报销 (Expense) Actions
// ============================================

export async function createExpenseAction(input: unknown): Promise<ActionResult<ExpenseVO>> {
  try {
    const user = await requirePermission('finance:create:expense')
    const dto = createExpenseSchema.parse(input)
    const service = createExpenseService()
    const result = await service.create(user.tenantId, user.id, dto)
    revalidatePath('/finance/expenses')
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function getExpensesAction(
  filters: ExpenseFilters
): Promise<ActionResult<PaginatedResult<ExpenseVO>>> {
  try {
    const user = await requirePermission('finance:read:expense')
    const service = createExpenseService()
    const result = await service.getExpenses(user.tenantId, filters)
    return ok(result)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function approveExpenseAction(id: string): Promise<ActionResult<null>> {
  try {
    const user = await requirePermission('finance:approve:expense')
    const service = createExpenseService()
    await service.approve(id, user.id)
    revalidatePath('/finance/expenses')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function rejectExpenseAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('finance:approve:expense')
    const service = createExpenseService()
    await service.reject(id)
    revalidatePath('/finance/expenses')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

export async function markExpensePaidAction(id: string): Promise<ActionResult<null>> {
  try {
    await requirePermission('finance:update:expense')
    const service = createExpenseService()
    await service.markPaid(id)
    revalidatePath('/finance/expenses')
    return ok(null)
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.code)
    throw e
  }
}

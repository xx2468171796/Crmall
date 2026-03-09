// ============================================
// 财务模块 — Repository 实现
// ============================================

import type { PrismaClient } from '@twcrm/db'
import type { PaginatedResult } from '@twcrm/shared'
import type {
  IPaymentRepository, IDisbursementRepository,
  IInvoiceRepository, IExpenseRepository,
} from './finance.repository.interface'
import type {
  PaymentVO, PaymentFilters, CreatePaymentDTO,
  DisbursementVO, DisbursementFilters, CreateDisbursementDTO,
  InvoiceVO, InvoiceFilters,
  ExpenseVO, ExpenseFilters, CreateExpenseDTO,
} from '../types/finance.types'

// ---- Row types for Prisma query results ----

interface PaymentRow {
  id: string
  tenantId: string
  paymentNo: string
  contractId: string | null
  orderId: string | null
  customerId: string | null
  amount: { toNumber(): number } | number
  currency: string
  paidAt: Date
  method: string
  status: string
  invoiceId: string | null
  bankRef: string | null
  note: string | null
  confirmedBy: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface DisbursementRow {
  id: string
  tenantId: string
  disbNo: string
  supplierId: string
  purchaseId: string | null
  amount: { toNumber(): number } | number
  currency: string
  paidAt: Date | null
  method: string
  status: string
  bankRef: string | null
  requestedBy: string
  approvedBy: string | null
  note: string | null
  createdAt: Date
  updatedAt: Date
}

interface InvoiceRow {
  id: string
  tenantId: string
  invoiceNo: string
  type: string
  counterpart: string
  amount: { toNumber(): number } | number
  taxRate: { toNumber(): number } | number
  taxAmount: { toNumber(): number } | number
  totalAmount: { toNumber(): number } | number
  orderId: string | null
  issueDate: Date
  dueDate: Date | null
  status: string
  fileUrl: string | null
  einvoiceNo: string | null
  refType: string | null
  refId: string | null
  note: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface ExpenseRow {
  id: string
  tenantId: string
  expenseNo: string
  category: string
  amount: { toNumber(): number } | number
  currency: string
  description: string
  receiptUrl: string | null
  status: string
  requestedBy: string
  approvedBy: string | null
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ---- 收款 (Payment) ----

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<PaymentVO | null> {
    const row = await this.prisma.payment.findUnique({ where: { id } })
    return row ? this.toVO(row as unknown as PaymentRow) : null
  }

  async findByTenant(tenantId: string, filters: PaymentFilters): Promise<PaginatedResult<PaymentVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: Record<string, unknown> = { tenantId }

    if (filters.status) where.status = filters.status
    if (filters.method) where.method = filters.method
    if (filters.search) {
      where.OR = [
        { paymentNo: { contains: filters.search, mode: 'insensitive' } },
        { bankRef: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.dateFrom || filters.dateTo) {
      const paidAt: Record<string, unknown> = {}
      if (filters.dateFrom) paidAt.gte = new Date(filters.dateFrom)
      if (filters.dateTo) paidAt.lte = new Date(filters.dateTo)
      where.paidAt = paidAt
    }

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ])

    return {
      items: items.map((r) => this.toVO(r as unknown as PaymentRow)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(
    tenantId: string,
    data: CreatePaymentDTO & { paymentNo: string; status: string; createdBy: string },
  ): Promise<PaymentVO> {
    const row = await this.prisma.payment.create({
      data: {
        tenantId,
        paymentNo: data.paymentNo,
        contractId: data.contractId,
        orderId: data.orderId,
        customerId: data.customerId,
        amount: data.amount,
        currency: data.currency,
        paidAt: new Date(data.paidAt),
        method: data.method,
        status: data.status,
        bankRef: data.bankRef,
        note: data.note,
        createdBy: data.createdBy,
      },
    })
    return this.toVO(row as unknown as PaymentRow)
  }

  async confirm(id: string, confirmedBy: string): Promise<void> {
    await this.prisma.payment.update({
      where: { id },
      data: { status: 'confirmed', confirmedBy },
    })
  }

  async refund(id: string): Promise<void> {
    await this.prisma.payment.update({
      where: { id },
      data: { status: 'refunded' },
    })
  }

  private toVO(r: PaymentRow): PaymentVO {
    return {
      id: r.id,
      paymentNo: r.paymentNo,
      tenantId: r.tenantId,
      contractId: r.contractId,
      orderId: r.orderId,
      customerId: r.customerId,
      amount: Number(r.amount),
      currency: r.currency,
      paidAt: r.paidAt.toISOString(),
      method: r.method,
      status: r.status,
      invoiceId: r.invoiceId,
      bankRef: r.bankRef,
      note: r.note,
      confirmedBy: r.confirmedBy,
      createdBy: r.createdBy,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }
  }
}

// ---- 付款 (Disbursement) ----

export class DisbursementRepository implements IDisbursementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DisbursementVO | null> {
    const row = await this.prisma.disbursement.findUnique({ where: { id } })
    return row ? this.toVO(row as unknown as DisbursementRow) : null
  }

  async findByTenant(tenantId: string, filters: DisbursementFilters): Promise<PaginatedResult<DisbursementVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: Record<string, unknown> = { tenantId }

    if (filters.status) where.status = filters.status
    if (filters.search) {
      where.OR = [
        { disbNo: { contains: filters.search, mode: 'insensitive' } },
        { bankRef: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.dateFrom || filters.dateTo) {
      const createdAt: Record<string, unknown> = {}
      if (filters.dateFrom) createdAt.gte = new Date(filters.dateFrom)
      if (filters.dateTo) createdAt.lte = new Date(filters.dateTo)
      where.createdAt = createdAt
    }

    const [items, total] = await Promise.all([
      this.prisma.disbursement.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.disbursement.count({ where }),
    ])

    return {
      items: items.map((r) => this.toVO(r as unknown as DisbursementRow)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(
    tenantId: string,
    data: CreateDisbursementDTO & { disbNo: string; status: string; requestedBy: string },
  ): Promise<DisbursementVO> {
    const row = await this.prisma.disbursement.create({
      data: {
        tenantId,
        disbNo: data.disbNo,
        supplierId: data.supplierId,
        purchaseId: data.purchaseId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        status: data.status,
        bankRef: data.bankRef,
        requestedBy: data.requestedBy,
        note: data.note,
      },
    })
    return this.toVO(row as unknown as DisbursementRow)
  }

  async approve(id: string, approvedBy: string): Promise<void> {
    await this.prisma.disbursement.update({
      where: { id },
      data: { status: 'approved', approvedBy },
    })
  }

  async markPaid(id: string): Promise<void> {
    await this.prisma.disbursement.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
    })
  }

  async reject(id: string): Promise<void> {
    await this.prisma.disbursement.update({
      where: { id },
      data: { status: 'rejected' },
    })
  }

  private toVO(r: DisbursementRow): DisbursementVO {
    return {
      id: r.id,
      disbNo: r.disbNo,
      tenantId: r.tenantId,
      supplierId: r.supplierId,
      purchaseId: r.purchaseId,
      amount: Number(r.amount),
      currency: r.currency,
      paidAt: r.paidAt?.toISOString() ?? null,
      method: r.method,
      status: r.status,
      bankRef: r.bankRef,
      requestedBy: r.requestedBy,
      approvedBy: r.approvedBy,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }
  }
}

// ---- 发票 (Invoice) ----

export class InvoiceRepository implements IInvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<InvoiceVO | null> {
    const row = await this.prisma.invoice.findUnique({ where: { id } })
    return row ? this.toVO(row as unknown as InvoiceRow) : null
  }

  async findByTenant(tenantId: string, filters: InvoiceFilters): Promise<PaginatedResult<InvoiceVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: Record<string, unknown> = { tenantId }

    if (filters.type) where.type = filters.type
    if (filters.status) where.status = filters.status
    if (filters.search) {
      where.OR = [
        { invoiceNo: { contains: filters.search, mode: 'insensitive' } },
        { counterpart: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.dateFrom || filters.dateTo) {
      const issueDate: Record<string, unknown> = {}
      if (filters.dateFrom) issueDate.gte = new Date(filters.dateFrom)
      if (filters.dateTo) issueDate.lte = new Date(filters.dateTo)
      where.issueDate = issueDate
    }

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ])

    return {
      items: items.map((r) => this.toVO(r as unknown as InvoiceRow)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(tenantId: string, data: {
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
  }): Promise<InvoiceVO> {
    const row = await this.prisma.invoice.create({
      data: {
        tenantId,
        invoiceNo: data.invoiceNo,
        type: data.type,
        counterpart: data.counterpart,
        amount: data.amount,
        taxRate: data.taxRate,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        orderId: data.orderId,
        issueDate: new Date(data.issueDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
        refType: data.refType,
        refId: data.refId,
        note: data.note,
        createdBy: data.createdBy,
      },
    })
    return this.toVO(row as unknown as InvoiceRow)
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.prisma.invoice.update({
      where: { id },
      data: { status },
    })
  }

  private toVO(r: InvoiceRow): InvoiceVO {
    return {
      id: r.id,
      invoiceNo: r.invoiceNo,
      tenantId: r.tenantId,
      type: r.type,
      counterpart: r.counterpart,
      amount: Number(r.amount),
      taxRate: Number(r.taxRate),
      taxAmount: Number(r.taxAmount),
      totalAmount: Number(r.totalAmount),
      orderId: r.orderId,
      issueDate: r.issueDate.toISOString(),
      dueDate: r.dueDate?.toISOString() ?? null,
      status: r.status,
      fileUrl: r.fileUrl,
      einvoiceNo: r.einvoiceNo,
      refType: r.refType,
      refId: r.refId,
      note: r.note,
      createdBy: r.createdBy,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }
  }
}

// ---- 费用报销 (Expense) ----

export class ExpenseRepository implements IExpenseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ExpenseVO | null> {
    const row = await this.prisma.expense.findUnique({ where: { id } })
    return row ? this.toVO(row as unknown as ExpenseRow) : null
  }

  async findByTenant(tenantId: string, filters: ExpenseFilters): Promise<PaginatedResult<ExpenseVO>> {
    const page = filters.page ?? 1
    const perPage = filters.perPage ?? 20
    const where: Record<string, unknown> = { tenantId }

    if (filters.category) where.category = filters.category
    if (filters.status) where.status = filters.status
    if (filters.search) {
      where.OR = [
        { expenseNo: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.dateFrom || filters.dateTo) {
      const createdAt: Record<string, unknown> = {}
      if (filters.dateFrom) createdAt.gte = new Date(filters.dateFrom)
      if (filters.dateTo) createdAt.lte = new Date(filters.dateTo)
      where.createdAt = createdAt
    }

    const [items, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ])

    return {
      items: items.map((r) => this.toVO(r as unknown as ExpenseRow)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(
    tenantId: string,
    data: CreateExpenseDTO & { expenseNo: string; status: string; requestedBy: string },
  ): Promise<ExpenseVO> {
    const row = await this.prisma.expense.create({
      data: {
        tenantId,
        expenseNo: data.expenseNo,
        category: data.category,
        amount: data.amount,
        currency: data.currency ?? 'TWD',
        description: data.description,
        receiptUrl: data.receiptUrl,
        status: data.status,
        requestedBy: data.requestedBy,
      },
    })
    return this.toVO(row as unknown as ExpenseRow)
  }

  async approve(id: string, approvedBy: string): Promise<void> {
    await this.prisma.expense.update({
      where: { id },
      data: { status: 'approved', approvedBy },
    })
  }

  async reject(id: string): Promise<void> {
    await this.prisma.expense.update({
      where: { id },
      data: { status: 'rejected' },
    })
  }

  async markPaid(id: string): Promise<void> {
    await this.prisma.expense.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
    })
  }

  private toVO(r: ExpenseRow): ExpenseVO {
    return {
      id: r.id,
      expenseNo: r.expenseNo,
      tenantId: r.tenantId,
      category: r.category,
      amount: Number(r.amount),
      currency: r.currency,
      description: r.description,
      receiptUrl: r.receiptUrl,
      status: r.status,
      requestedBy: r.requestedBy,
      approvedBy: r.approvedBy,
      paidAt: r.paidAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }
  }
}

// ============================================
// 财务模块 — Service 实现
// 所有业务参数从 ConfigService 读取，禁止硬编码
// ============================================

import type { IConfigService, PaginatedResult } from '@twcrm/shared'
import { BusinessRuleError, generateDocumentNo, NotFoundError } from '@twcrm/shared'
import type {
  IPaymentRepository, IDisbursementRepository,
  IInvoiceRepository, IExpenseRepository,
} from '../repositories/finance.repository.interface'
import type {
  IPaymentService, IDisbursementService,
  IInvoiceService, IExpenseService,
} from './finance.service.interface'
import type {
  PaymentVO, PaymentFilters, CreatePaymentDTO,
  DisbursementVO, DisbursementFilters, CreateDisbursementDTO,
  InvoiceVO, InvoiceFilters, CreateInvoiceDTO,
  ExpenseVO, ExpenseFilters, CreateExpenseDTO,
} from '../types/finance.types'


// ---- 收款 (Payment) ----

export class PaymentService implements IPaymentService {
  constructor(
    private readonly paymentRepo: IPaymentRepository,
    private readonly configService: IConfigService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreatePaymentDTO): Promise<PaymentVO> {
    // 从 ConfigService 读取默认币别
    const defaultCurrency = await this.configService.get('finance', 'default_currency', tenantId) ?? 'TWD'

    const paymentNo = generateDocumentNo('PAY')
    return this.paymentRepo.create(tenantId, {
      ...dto,
      currency: dto.currency ?? defaultCurrency,
      paymentNo,
      status: 'pending',
      createdBy: userId,
    })
  }

  async getPayments(tenantId: string, filters: PaymentFilters): Promise<PaginatedResult<PaymentVO>> {
    return this.paymentRepo.findByTenant(tenantId, filters)
  }

  async confirm(id: string, confirmedBy: string): Promise<void> {
    const payment = await this.paymentRepo.findById(id)
    if (!payment) throw new NotFoundError('收款记录', id)
    if (payment.status !== 'pending') throw new BusinessRuleError('只能确认待处理的收款')
    await this.paymentRepo.confirm(id, confirmedBy)
  }

  async refund(id: string): Promise<void> {
    const payment = await this.paymentRepo.findById(id)
    if (!payment) throw new NotFoundError('收款记录', id)
    if (payment.status !== 'confirmed') throw new BusinessRuleError('只能退款已确认的收款')
    await this.paymentRepo.refund(id)
  }
}

// ---- 付款 (Disbursement) ----

export class DisbursementService implements IDisbursementService {
  constructor(
    private readonly disbRepo: IDisbursementRepository,
    private readonly configService: IConfigService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateDisbursementDTO): Promise<DisbursementVO> {
    const defaultCurrency = await this.configService.get('finance', 'default_currency', tenantId) ?? 'TWD'

    const disbNo = generateDocumentNo('DIS')
    return this.disbRepo.create(tenantId, {
      ...dto,
      currency: dto.currency ?? defaultCurrency,
      disbNo,
      status: 'pending',
      requestedBy: userId,
    })
  }

  async getDisbursements(tenantId: string, filters: DisbursementFilters): Promise<PaginatedResult<DisbursementVO>> {
    return this.disbRepo.findByTenant(tenantId, filters)
  }

  async approve(id: string, approvedBy: string): Promise<void> {
    const disb = await this.disbRepo.findById(id)
    if (!disb) throw new NotFoundError('付款记录', id)
    if (disb.status !== 'pending') throw new BusinessRuleError('只能审批待处理的付款')
    await this.disbRepo.approve(id, approvedBy)
  }

  async markPaid(id: string): Promise<void> {
    const disb = await this.disbRepo.findById(id)
    if (!disb) throw new NotFoundError('付款记录', id)
    if (disb.status !== 'approved') throw new BusinessRuleError('只能标记已审批的付款为已付')
    await this.disbRepo.markPaid(id)
  }
}

// ---- 发票 (Invoice) ----

export class InvoiceService implements IInvoiceService {
  constructor(
    private readonly invoiceRepo: IInvoiceRepository,
    private readonly configService: IConfigService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateInvoiceDTO): Promise<InvoiceVO> {
    // 如果未提供 taxRate，从 ConfigService 读取默认税率（台湾营业税 5%）
    const defaultTaxRate = await this.configService.getNumber('finance', 'default_tax_rate', tenantId, 0.05)
    const taxRate = dto.taxRate ?? defaultTaxRate

    // 自动计算税额和含税总额
    const taxAmount = Math.round(dto.amount * taxRate * 100) / 100
    const totalAmount = Math.round((dto.amount + taxAmount) * 100) / 100

    const invoiceNo = generateDocumentNo('INV')
    return this.invoiceRepo.create(tenantId, {
      invoiceNo,
      type: dto.type,
      counterpart: dto.counterpart,
      amount: dto.amount,
      taxRate,
      taxAmount,
      totalAmount,
      orderId: dto.orderId,
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      status: 'draft',
      refType: dto.refType,
      refId: dto.refId,
      note: dto.note,
      createdBy: userId,
    })
  }

  async getInvoices(tenantId: string, filters: InvoiceFilters): Promise<PaginatedResult<InvoiceVO>> {
    return this.invoiceRepo.findByTenant(tenantId, filters)
  }

  async issue(id: string): Promise<void> {
    const invoice = await this.invoiceRepo.findById(id)
    if (!invoice) throw new NotFoundError('发票', id)
    if (invoice.status !== 'draft') throw new BusinessRuleError('只能开具草稿状态的发票')
    await this.invoiceRepo.updateStatus(id, 'issued')
  }

  async void(id: string): Promise<void> {
    const invoice = await this.invoiceRepo.findById(id)
    if (!invoice) throw new NotFoundError('发票', id)
    if (!['draft', 'issued'].includes(invoice.status)) {
      throw new BusinessRuleError('只能作废草稿或已开具的发票')
    }
    await this.invoiceRepo.updateStatus(id, 'void')
  }
}

// ---- 费用报销 (Expense) ----

export class ExpenseService implements IExpenseService {
  constructor(
    private readonly expenseRepo: IExpenseRepository,
    private readonly configService: IConfigService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateExpenseDTO): Promise<ExpenseVO> {
    const defaultCurrency = await this.configService.get('finance', 'default_currency', tenantId) ?? 'TWD'

    const expenseNo = generateDocumentNo('EXP')
    return this.expenseRepo.create(tenantId, {
      ...dto,
      currency: dto.currency ?? defaultCurrency,
      expenseNo,
      status: 'pending',
      requestedBy: userId,
    })
  }

  async getExpenses(tenantId: string, filters: ExpenseFilters): Promise<PaginatedResult<ExpenseVO>> {
    return this.expenseRepo.findByTenant(tenantId, filters)
  }

  async approve(id: string, approvedBy: string): Promise<void> {
    const expense = await this.expenseRepo.findById(id)
    if (!expense) throw new NotFoundError('费用报销', id)
    if (expense.status !== 'pending') throw new BusinessRuleError('只能审批待处理的报销')
    await this.expenseRepo.approve(id, approvedBy)
  }

  async reject(id: string): Promise<void> {
    const expense = await this.expenseRepo.findById(id)
    if (!expense) throw new NotFoundError('费用报销', id)
    if (expense.status !== 'pending') throw new BusinessRuleError('只能驳回待处理的报销')
    await this.expenseRepo.reject(id)
  }

  async markPaid(id: string): Promise<void> {
    const expense = await this.expenseRepo.findById(id)
    if (!expense) throw new NotFoundError('费用报销', id)
    if (expense.status !== 'approved') throw new BusinessRuleError('只能标记已审批的报销为已付')
    await this.expenseRepo.markPaid(id)
  }
}

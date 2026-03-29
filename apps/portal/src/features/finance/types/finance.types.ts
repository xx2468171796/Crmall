// ============================================
// 财务模块 — 类型定义
// ============================================

// ---- 收款 (Payment) ----

export interface PaymentVO {
  id: string
  paymentNo: string
  tenantId: string
  contractId: string | null
  orderId: string | null
  customerId: string | null
  amount: number
  currency: string
  paidAt: string
  method: string
  status: string
  invoiceId: string | null
  bankRef: string | null
  note: string | null
  confirmedBy: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentDTO {
  contractId?: string
  orderId?: string
  customerId?: string
  amount: number
  currency: string
  paidAt: string
  method: string
  bankRef?: string
  note?: string
}

export interface PaymentFilters {
  search?: string
  status?: string
  method?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
  createdBy?: string
  departmentId?: string
}

// ---- 付款 (Disbursement) ----

export interface DisbursementVO {
  id: string
  disbNo: string
  tenantId: string
  supplierId: string
  purchaseId: string | null
  amount: number
  currency: string
  paidAt: string | null
  method: string
  status: string
  bankRef: string | null
  requestedBy: string
  approvedBy: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateDisbursementDTO {
  supplierId: string
  purchaseId?: string
  amount: number
  currency: string
  method: string
  bankRef?: string
  note?: string
}

export interface DisbursementFilters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
  createdBy?: string
  departmentId?: string
}

// ---- 发票 (Invoice) ----

export interface InvoiceVO {
  id: string
  invoiceNo: string
  tenantId: string
  type: string
  counterpart: string
  amount: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  orderId: string | null
  issueDate: string
  dueDate: string | null
  status: string
  fileUrl: string | null
  einvoiceNo: string | null
  refType: string | null
  refId: string | null
  note: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceDTO {
  type: string
  counterpart: string
  amount: number
  taxRate?: number
  orderId?: string
  issueDate: string
  dueDate?: string
  refType?: string
  refId?: string
  note?: string
}

export interface InvoiceFilters {
  search?: string
  type?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
  createdBy?: string
  departmentId?: string
}

// ---- 费用报销 (Expense) ----

export interface ExpenseVO {
  id: string
  expenseNo: string
  tenantId: string
  category: string
  amount: number
  currency: string
  description: string
  receiptUrl: string | null
  status: string
  requestedBy: string
  approvedBy: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseDTO {
  category: string
  amount: number
  currency?: string
  description: string
  receiptUrl?: string
}

export interface ExpenseFilters {
  search?: string
  category?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
  createdBy?: string
  departmentId?: string
}

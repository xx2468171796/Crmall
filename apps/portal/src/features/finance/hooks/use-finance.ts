'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  getPaymentsAction, createPaymentAction,
  confirmPaymentAction, refundPaymentAction,
  getDisbursementsAction, createDisbursementAction,
  approveDisbursementAction, markDisbursementPaidAction,
  getInvoicesAction, createInvoiceAction,
  issueInvoiceAction, voidInvoiceAction,
  getExpensesAction, createExpenseAction,
  approveExpenseAction, rejectExpenseAction, markExpensePaidAction,
} from '../actions/finance.action'
import type {
  PaymentFilters, CreatePaymentDTO,
  DisbursementFilters, CreateDisbursementDTO,
  InvoiceFilters, CreateInvoiceDTO,
  ExpenseFilters, CreateExpenseDTO,
} from '../types/finance.types'

// ---- 收款 (Payment) ----

export function usePayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => getPaymentsAction(filters),
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (dto: CreatePaymentDTO) => createPaymentAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('create_success'))
        qc.invalidateQueries({ queryKey: ['payments'] })
      } else toast.error(r.error)
    },
  })
}

export function useConfirmPayment() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (id: string) => confirmPaymentAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('confirm_success'))
        qc.invalidateQueries({ queryKey: ['payments'] })
      } else toast.error(r.error)
    },
  })
}

export function useRefundPayment() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (id: string) => refundPaymentAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('refund_success'))
        qc.invalidateQueries({ queryKey: ['payments'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 付款 (Disbursement) ----

export function useDisbursements(filters: DisbursementFilters) {
  return useQuery({
    queryKey: ['disbursements', filters],
    queryFn: () => getDisbursementsAction(filters),
  })
}

export function useCreateDisbursement() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (dto: CreateDisbursementDTO) => createDisbursementAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('create_success'))
        qc.invalidateQueries({ queryKey: ['disbursements'] })
      } else toast.error(r.error)
    },
  })
}

export function useApproveDisbursement() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (id: string) => approveDisbursementAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('approve_success'))
        qc.invalidateQueries({ queryKey: ['disbursements'] })
      } else toast.error(r.error)
    },
  })
}

export function useMarkDisbursementPaid() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (id: string) => markDisbursementPaidAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('confirm_success'))
        qc.invalidateQueries({ queryKey: ['disbursements'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 发票 (Invoice) ----

export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => getInvoicesAction(filters),
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (dto: CreateInvoiceDTO) => createInvoiceAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('create_success'))
        qc.invalidateQueries({ queryKey: ['invoices'] })
      } else toast.error(r.error)
    },
  })
}

export function useIssueInvoice() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (id: string) => issueInvoiceAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('confirm_success'))
        qc.invalidateQueries({ queryKey: ['invoices'] })
      } else toast.error(r.error)
    },
  })
}

export function useVoidInvoice() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (id: string) => voidInvoiceAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('void_success'))
        qc.invalidateQueries({ queryKey: ['invoices'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 费用报销 (Expense) ----

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => getExpensesAction(filters),
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (dto: CreateExpenseDTO) => createExpenseAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('create_success'))
        qc.invalidateQueries({ queryKey: ['expenses'] })
      } else toast.error(r.error)
    },
  })
}

export function useApproveExpense() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (id: string) => approveExpenseAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('approve_success'))
        qc.invalidateQueries({ queryKey: ['expenses'] })
      } else toast.error(r.error)
    },
  })
}

export function useRejectExpense() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (id: string) => rejectExpenseAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('reject_success'))
        qc.invalidateQueries({ queryKey: ['expenses'] })
      } else toast.error(r.error)
    },
  })
}

export function useMarkExpensePaid() {
  const qc = useQueryClient()
  const t = useTranslations('finance')
  return useMutation({
    mutationFn: (id: string) => markExpensePaidAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('confirm_success'))
        qc.invalidateQueries({ queryKey: ['expenses'] })
      } else toast.error(r.error)
    },
  })
}

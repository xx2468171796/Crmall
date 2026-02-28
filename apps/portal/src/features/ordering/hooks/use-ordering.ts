'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  getCatalogAction, getCartAction, addToCartAction,
  updateCartItemAction, removeCartItemAction,
  getOrdersAction, getOrderByIdAction, createOrderAction,
  cancelOrderAction, confirmReceiveAction, getAccountAction,
} from '../actions/ordering.action'
import type { CatalogFilters, OrderFilters } from '../types/ordering.types'

// ---- 产品目录 ----

export function useCatalog(filters: CatalogFilters) {
  return useQuery({
    queryKey: ['catalog', filters],
    queryFn: () => getCatalogAction(filters),
  })
}

// ---- 购物车 ----

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => getCartAction(),
  })
}

export function useAddToCart() {
  const qc = useQueryClient()
  const t = useTranslations('ordering')
  return useMutation({
    mutationFn: (dto: { productId: string; quantity: number; remark?: string }) =>
      addToCartAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('add_to_cart_success'))
        qc.invalidateQueries({ queryKey: ['cart'] })
      } else toast.error(r.error)
    },
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity, remark }: { id: string; quantity: number; remark?: string }) =>
      updateCartItemAction(id, { quantity, remark }),
    onSuccess: (r) => {
      if (r.success) qc.invalidateQueries({ queryKey: ['cart'] })
      else toast.error(r.error)
    },
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: (id: string) => removeCartItemAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('operation_success'))
        qc.invalidateQueries({ queryKey: ['cart'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 订单 ----

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getOrdersAction(filters),
  })
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderByIdAction(id),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  const t = useTranslations('ordering')
  return useMutation({
    mutationFn: (dto: { paymentMethod?: string; remark?: string }) =>
      createOrderAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('order_created'))
        qc.invalidateQueries({ queryKey: ['orders'] })
        qc.invalidateQueries({ queryKey: ['cart'] })
        qc.invalidateQueries({ queryKey: ['account'] })
      } else toast.error(r.error)
    },
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelOrderAction(id, reason),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('operation_success'))
        qc.invalidateQueries({ queryKey: ['orders'] })
        qc.invalidateQueries({ queryKey: ['order'] })
        qc.invalidateQueries({ queryKey: ['account'] })
      } else toast.error(r.error)
    },
  })
}

export function useConfirmReceive() {
  const qc = useQueryClient()
  const t = useTranslations('common')
  return useMutation({
    mutationFn: (id: string) => confirmReceiveAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('operation_success'))
        qc.invalidateQueries({ queryKey: ['orders'] })
        qc.invalidateQueries({ queryKey: ['order'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 账户 ----

export function useAccount() {
  return useQuery({
    queryKey: ['account'],
    queryFn: () => getAccountAction(),
    staleTime: 60 * 1000,
  })
}

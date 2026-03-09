'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  getWarehousesAction, createWarehouseAction, updateWarehouseAction, deleteWarehouseAction,
  getStockAction, adjustStockAction,
  getSnCodesAction, createSnCodeAction, updateSnCodeAction,
  getSuppliersAction, createSupplierAction, updateSupplierAction, deleteSupplierAction,
  getPurchaseOrdersAction, createPurchaseOrderAction, approvePurchaseOrderAction, receivePurchaseOrderAction,
  getTransferOrdersAction, createTransferOrderAction, approveTransferOrderAction, shipTransferOrderAction, receiveTransferOrderAction,
  getStockMovementsAction,
} from '../actions/inventory.action'
import type {
  StockFilters, StockAdjustDTO,
  SnFilters, CreateSnCodeDTO,
  CreateWarehouseDTO, UpdateWarehouseDTO,
  CreateSupplierDTO, UpdateSupplierDTO,
  PurchaseOrderFilters, CreatePurchaseOrderDTO, ReceivePurchaseItemDTO,
  TransferOrderFilters, CreateTransferOrderDTO,
  StockMovementFilters,
} from '../types/inventory.types'

// ---- 仓库 ----

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehousesAction(),
  })
}

export function useCreateWarehouse() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (dto: CreateWarehouseDTO) => createWarehouseAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('create_success'))
        qc.invalidateQueries({ queryKey: ['warehouses'] })
      } else toast.error(r.error)
    },
  })
}

export function useUpdateWarehouse() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWarehouseDTO }) =>
      updateWarehouseAction(id, dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('update_success'))
        qc.invalidateQueries({ queryKey: ['warehouses'] })
      } else toast.error(r.error)
    },
  })
}

export function useDeleteWarehouse() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (id: string) => deleteWarehouseAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('delete_success'))
        qc.invalidateQueries({ queryKey: ['warehouses'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 库存 ----

export function useStocks(filters: StockFilters) {
  return useQuery({
    queryKey: ['stocks', filters],
    queryFn: () => getStockAction(filters),
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (dto: StockAdjustDTO) => adjustStockAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('update_success'))
        qc.invalidateQueries({ queryKey: ['stocks'] })
        qc.invalidateQueries({ queryKey: ['stockMovements'] })
      } else toast.error(r.error)
    },
  })
}

// ---- SN 码 ----

export function useSnCodes(filters: SnFilters) {
  return useQuery({
    queryKey: ['snCodes', filters],
    queryFn: () => getSnCodesAction(filters),
  })
}

export function useCreateSnCode() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (dto: CreateSnCodeDTO) => createSnCodeAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('create_success'))
        qc.invalidateQueries({ queryKey: ['snCodes'] })
      } else toast.error(r.error)
    },
  })
}

export function useUpdateSnCodeStatus() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateSnCodeAction(id, { status }),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('update_success'))
        qc.invalidateQueries({ queryKey: ['snCodes'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 供应商 ----

export function useSuppliers(filters: { search?: string; status?: string; page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => getSuppliersAction(filters),
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (dto: CreateSupplierDTO) => createSupplierAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('create_success'))
        qc.invalidateQueries({ queryKey: ['suppliers'] })
      } else toast.error(r.error)
    },
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSupplierDTO }) =>
      updateSupplierAction(id, dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('update_success'))
        qc.invalidateQueries({ queryKey: ['suppliers'] })
      } else toast.error(r.error)
    },
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (id: string) => deleteSupplierAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('delete_success'))
        qc.invalidateQueries({ queryKey: ['suppliers'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 采购单 ----

export function usePurchaseOrders(filters: PurchaseOrderFilters) {
  return useQuery({
    queryKey: ['purchaseOrders', filters],
    queryFn: () => getPurchaseOrdersAction(filters),
  })
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (dto: CreatePurchaseOrderDTO) => createPurchaseOrderAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('create_success'))
        qc.invalidateQueries({ queryKey: ['purchaseOrders'] })
      } else toast.error(r.error)
    },
  })
}

export function useApprovePurchaseOrder() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (id: string) => approvePurchaseOrderAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('approve_success'))
        qc.invalidateQueries({ queryKey: ['purchaseOrders'] })
      } else toast.error(r.error)
    },
  })
}

export function useReceivePurchaseOrder() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: ReceivePurchaseItemDTO[] }) =>
      receivePurchaseOrderAction(id, { items }),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('receive_success'))
        qc.invalidateQueries({ queryKey: ['purchaseOrders'] })
        qc.invalidateQueries({ queryKey: ['stocks'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 调拨单 ----

export function useTransferOrders(filters: TransferOrderFilters) {
  return useQuery({
    queryKey: ['transferOrders', filters],
    queryFn: () => getTransferOrdersAction(filters),
  })
}

export function useCreateTransferOrder() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (dto: CreateTransferOrderDTO) => createTransferOrderAction(dto),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('create_success'))
        qc.invalidateQueries({ queryKey: ['transferOrders'] })
      } else toast.error(r.error)
    },
  })
}

export function useApproveTransferOrder() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (id: string) => approveTransferOrderAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('approve_success'))
        qc.invalidateQueries({ queryKey: ['transferOrders'] })
      } else toast.error(r.error)
    },
  })
}

export function useShipTransferOrder() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (id: string) => shipTransferOrderAction(id),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('ship_success'))
        qc.invalidateQueries({ queryKey: ['transferOrders'] })
      } else toast.error(r.error)
    },
  })
}

export function useReceiveTransferOrder() {
  const qc = useQueryClient()
  const t = useTranslations('inventory')
  return useMutation({
    mutationFn: (id: string) => receiveTransferOrderAction(id, { items: [] }),
    onSuccess: (r) => {
      if (r.success) {
        toast.success(t('receive_success'))
        qc.invalidateQueries({ queryKey: ['transferOrders'] })
        qc.invalidateQueries({ queryKey: ['stocks'] })
      } else toast.error(r.error)
    },
  })
}

// ---- 库存变动 ----

export function useStockMovements(filters: StockMovementFilters) {
  return useQuery({
    queryKey: ['stockMovements', filters],
    queryFn: () => getStockMovementsAction(filters),
  })
}

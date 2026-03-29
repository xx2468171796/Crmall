// ============================================
// 进销存 — Repository 实现
// ============================================

import type { PrismaClient } from '@twcrm/db'
import { clampPagination, generateDocumentNo } from '@twcrm/shared'
import type { PaginatedResult } from '@twcrm/shared'
import type {
  IWarehouseRepository, IStockRepository, ISnCodeRepository,
  ISupplierRepository, IPurchaseOrderRepository, ITransferOrderRepository,
  IStockMovementRepository,
} from './inventory.repository.interface'
import type {
  WarehouseVO, CreateWarehouseDTO, UpdateWarehouseDTO,
  StockVO, StockFilters,
  SnCodeVO, CreateSnCodeDTO, UpdateSnCodeDTO, SnFilters,
  SupplierVO, CreateSupplierDTO, UpdateSupplierDTO, SupplierFilters,
  PurchaseOrderVO, PurchaseOrderItemVO, CreatePurchaseOrderDTO, PurchaseOrderFilters,
  TransferOrderVO, TransferOrderItemVO, CreateTransferOrderDTO, TransferOrderFilters,
  StockMovementVO, StockMovementFilters,
} from '../types/inventory.types'

// ---- Row types for Prisma query results ----

interface WarehouseRow {
  id: string
  tenantId: string | null
  name: string
  code: string
  address: string | null
  contact: string | null
  phone: string | null
  isMain: boolean
  status: string
  createdAt: Date
  updatedAt: Date
}

interface StockRow {
  id: string
  variantId: string
  variant: {
    sku: string
    name: string | null
    product: { name: string }
  }
  warehouseId: string
  warehouse: {
    code: string
    name: string
  }
  quantity: number
  lockedQty: number
  updatedAt: Date
}

interface SnCodeRow {
  id: string
  sn: string
  variantId: string
  variant: {
    sku: string
    name: string | null
    product: { name: string }
  }
  warehouseId: string | null
  warehouse: { name: string } | null
  status: string
  customerId: string | null
  workOrderId: string | null
  installedAt: Date | null
  warrantyEnd: Date | null
  createdAt: Date
  updatedAt: Date
}

interface SupplierRow {
  id: string
  tenantId: string | null
  name: string
  contact: string | null
  phone: string | null
  email: string | null
  address: string | null
  bankInfo: unknown
  status: string
  createdAt: Date
  updatedAt: Date
}

interface PurchaseOrderItemRow {
  id: string
  purchaseOrderId: string
  variantId: string
  variant: {
    sku: string
    name: string | null
    product: { name: string }
  }
  quantity: number
  unitPrice: { toNumber(): number } | number
  receivedQty: number
  subtotal: { toNumber(): number } | number
}

interface PurchaseOrderRow {
  id: string
  tenantId: string | null
  poNo: string
  supplierId: string
  supplier: { name: string }
  warehouseId: string
  totalAmount: { toNumber(): number } | number
  currency: string
  status: string
  expectedDate: Date | null
  remark: string | null
  createdBy: string
  approvedBy: string | null
  createdAt: Date
  updatedAt: Date
  items: PurchaseOrderItemRow[]
}

interface TransferOrderItemRow {
  id: string
  transferOrderId: string
  variantId: string
  variant: {
    sku: string
    name: string | null
    product: { name: string }
  }
  quantity: number
  receivedQty: number
}

interface TransferOrderRow {
  id: string
  transferNo: string
  fromWarehouseId: string
  fromWarehouse: { name: string }
  toWarehouseId: string
  toWarehouse: { name: string }
  status: string
  requestedBy: string
  approvedBy: string | null
  remark: string | null
  createdAt: Date
  updatedAt: Date
  items: TransferOrderItemRow[]
}

interface StockMovementRow {
  id: string
  variantId: string
  variant: {
    sku: string
    name: string | null
    product: { name: string }
  }
  warehouseId: string
  warehouse: { name: string }
  type: string
  quantity: number
  refType: string | null
  refId: string | null
  snCodeId: string | null
  remark: string | null
  createdBy: string
  createdAt: Date
}

// ---- 仓库 ----

export class WarehouseRepository implements IWarehouseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<WarehouseVO | null> {
    const w = await this.prisma.warehouse.findUnique({ where: { id } })
    return w ? this.toVO(w as unknown as WarehouseRow) : null
  }

  async findByCode(code: string): Promise<WarehouseVO | null> {
    const w = await this.prisma.warehouse.findUnique({ where: { code } })
    return w ? this.toVO(w as unknown as WarehouseRow) : null
  }

  async findByTenant(tenantId: string | null): Promise<WarehouseVO[]> {
    const where: Record<string, unknown> = {}
    if (tenantId) where.tenantId = tenantId
    const items = await this.prisma.warehouse.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return items.map((w) => this.toVO(w as unknown as WarehouseRow))
  }

  async create(tenantId: string | null, dto: CreateWarehouseDTO): Promise<WarehouseVO> {
    const w = await this.prisma.warehouse.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        address: dto.address,
        contact: dto.contact,
        phone: dto.phone,
        isMain: dto.isMain ?? false,
      },
    })
    return this.toVO(w as unknown as WarehouseRow)
  }

  async update(id: string, dto: UpdateWarehouseDTO): Promise<WarehouseVO> {
    const w = await this.prisma.warehouse.update({
      where: { id },
      data: dto,
    })
    return this.toVO(w as unknown as WarehouseRow)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.warehouse.delete({ where: { id } })
  }

  private toVO(w: WarehouseRow): WarehouseVO {
    return {
      id: w.id,
      tenantId: w.tenantId,
      name: w.name,
      code: w.code,
      address: w.address,
      contact: w.contact,
      phone: w.phone,
      isMain: w.isMain,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    }
  }
}

// ---- 库存 ----

export class StockRepository implements IStockRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly stockInclude = {
    variant: { include: { product: true } },
    warehouse: true,
  }

  async findByWarehouse(warehouseId: string, filters: StockFilters): Promise<PaginatedResult<StockVO>> {
    return this.query({ ...filters, warehouseId })
  }

  async findByVariant(variantId: string): Promise<StockVO[]> {
    const items = await this.prisma.stock.findMany({
      where: { variantId },
      include: this.stockInclude,
    })
    return items.map((s) => this.toVO(s as unknown as StockRow))
  }

  async findByVariantAndWarehouse(variantId: string, warehouseId: string): Promise<StockVO | null> {
    const s = await this.prisma.stock.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      include: this.stockInclude,
    })
    return s ? this.toVO(s as unknown as StockRow) : null
  }

  async adjustStock(variantId: string, warehouseId: string, quantity: number): Promise<void> {
    await this.prisma.stock.upsert({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      update: { quantity: { increment: quantity } },
      create: { variantId, warehouseId, quantity: Math.max(0, quantity), lockedQty: 0 },
    })
  }

  async lockStock(variantId: string, warehouseId: string, quantity: number): Promise<void> {
    await this.prisma.stock.update({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      data: { lockedQty: { increment: quantity } },
    })
  }

  async unlockStock(variantId: string, warehouseId: string, quantity: number): Promise<void> {
    await this.prisma.stock.update({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      data: { lockedQty: { decrement: quantity } },
    })
  }

  async findAll(filters: StockFilters): Promise<PaginatedResult<StockVO>> {
    return this.query(filters)
  }

  private async query(filters: StockFilters): Promise<PaginatedResult<StockVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = {}
    if (filters.warehouseId) where.warehouseId = filters.warehouseId
    if (filters.variantId) where.variantId = filters.variantId
    if (filters.search) {
      where.variant = {
        OR: [
          { sku: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
          { product: { name: { contains: filters.search, mode: 'insensitive' } } },
        ],
      }
    }
    if (filters.createdBy) where.createdBy = filters.createdBy
    if (filters.departmentId) where.departmentId = filters.departmentId

    const [items, total] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: this.stockInclude,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.stock.count({ where }),
    ])

    return {
      items: items.map((s) => this.toVO(s as unknown as StockRow)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  private toVO(s: StockRow): StockVO {
    return {
      id: s.id,
      variantId: s.variantId,
      variantSku: s.variant.sku,
      variantName: s.variant.name,
      productName: s.variant.product.name,
      warehouseId: s.warehouseId,
      warehouseCode: s.warehouse.code,
      warehouseName: s.warehouse.name,
      quantity: s.quantity,
      lockedQty: s.lockedQty,
      availableQty: s.quantity - s.lockedQty,
      updatedAt: s.updatedAt.toISOString(),
    }
  }
}

// ---- SN 码 ----

export class SnCodeRepository implements ISnCodeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly snInclude = {
    variant: { include: { product: true } },
    warehouse: true,
  }

  async findById(id: string): Promise<SnCodeVO | null> {
    const s = await this.prisma.snCode.findUnique({
      where: { id },
      include: this.snInclude,
    })
    return s ? this.toVO(s as unknown as SnCodeRow) : null
  }

  async findBySn(sn: string): Promise<SnCodeVO | null> {
    const s = await this.prisma.snCode.findUnique({
      where: { sn },
      include: this.snInclude,
    })
    return s ? this.toVO(s as unknown as SnCodeRow) : null
  }

  async findByVariant(variantId: string, filters: SnFilters): Promise<PaginatedResult<SnCodeVO>> {
    return this.query({ ...filters, variantId })
  }

  async findAll(filters: SnFilters): Promise<PaginatedResult<SnCodeVO>> {
    return this.query(filters)
  }

  async create(dto: CreateSnCodeDTO): Promise<SnCodeVO> {
    const s = await this.prisma.snCode.create({
      data: {
        sn: dto.sn,
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        status: dto.status ?? 'in_stock',
      },
      include: this.snInclude,
    })
    return this.toVO(s as unknown as SnCodeRow)
  }

  async update(id: string, dto: UpdateSnCodeDTO): Promise<SnCodeVO> {
    const data: Record<string, unknown> = {}
    if (dto.warehouseId !== undefined) data.warehouseId = dto.warehouseId
    if (dto.status !== undefined) data.status = dto.status
    if (dto.customerId !== undefined) data.customerId = dto.customerId
    if (dto.workOrderId !== undefined) data.workOrderId = dto.workOrderId
    if (dto.installedAt !== undefined) data.installedAt = new Date(dto.installedAt)
    if (dto.warrantyEnd !== undefined) data.warrantyEnd = new Date(dto.warrantyEnd)

    const s = await this.prisma.snCode.update({
      where: { id },
      data,
      include: this.snInclude,
    })
    return this.toVO(s as unknown as SnCodeRow)
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.prisma.snCode.update({
      where: { id },
      data: { status },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.snCode.delete({ where: { id } })
  }

  private async query(filters: SnFilters): Promise<PaginatedResult<SnCodeVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = {}
    if (filters.variantId) where.variantId = filters.variantId
    if (filters.warehouseId) where.warehouseId = filters.warehouseId
    if (filters.status) where.status = filters.status
    if (filters.search) {
      where.OR = [
        { sn: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      this.prisma.snCode.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: this.snInclude,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.snCode.count({ where }),
    ])

    return {
      items: items.map((s) => this.toVO(s as unknown as SnCodeRow)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  private toVO(s: SnCodeRow): SnCodeVO {
    return {
      id: s.id,
      sn: s.sn,
      variantId: s.variantId,
      variantSku: s.variant.sku,
      variantName: s.variant.name,
      productName: s.variant.product.name,
      warehouseId: s.warehouseId,
      warehouseName: s.warehouse?.name ?? null,
      status: s.status,
      customerId: s.customerId,
      workOrderId: s.workOrderId,
      installedAt: s.installedAt?.toISOString() ?? null,
      warrantyEnd: s.warrantyEnd?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }
  }
}

// ---- 供应商 ----

export class SupplierRepository implements ISupplierRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<SupplierVO | null> {
    const s = await this.prisma.supplier.findUnique({ where: { id } })
    return s ? this.toVO(s as unknown as SupplierRow) : null
  }

  async findAll(tenantId: string | null, filters: SupplierFilters): Promise<PaginatedResult<SupplierVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = {}
    if (tenantId) where.tenantId = tenantId
    if (filters.status) where.status = filters.status
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { contact: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.createdBy) where.createdBy = filters.createdBy
    if (filters.departmentId) where.departmentId = filters.departmentId

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplier.count({ where }),
    ])

    return {
      items: items.map((s) => this.toVO(s as unknown as SupplierRow)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(tenantId: string | null, dto: CreateSupplierDTO): Promise<SupplierVO> {
    const s = await this.prisma.supplier.create({
      data: {
        tenantId,
        name: dto.name,
        contact: dto.contact,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        ...(dto.bankInfo ? { bankInfo: dto.bankInfo as unknown as Record<string, never> } : {}),
      },
    })
    return this.toVO(s as unknown as SupplierRow)
  }

  async update(id: string, dto: UpdateSupplierDTO): Promise<SupplierVO> {
    const data: Record<string, unknown> = {}
    if (dto.name !== undefined) data.name = dto.name
    if (dto.contact !== undefined) data.contact = dto.contact
    if (dto.phone !== undefined) data.phone = dto.phone
    if (dto.email !== undefined) data.email = dto.email
    if (dto.address !== undefined) data.address = dto.address
    if (dto.bankInfo !== undefined) data.bankInfo = dto.bankInfo
    if (dto.status !== undefined) data.status = dto.status

    const s = await this.prisma.supplier.update({
      where: { id },
      data,
    })
    return this.toVO(s as unknown as SupplierRow)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplier.delete({ where: { id } })
  }

  private toVO(s: SupplierRow): SupplierVO {
    return {
      id: s.id,
      tenantId: s.tenantId,
      name: s.name,
      contact: s.contact,
      phone: s.phone,
      email: s.email,
      address: s.address,
      bankInfo: s.bankInfo as Record<string, unknown> | null,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }
  }
}

// ---- 采购单 ----

export class PurchaseOrderRepository implements IPurchaseOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly poInclude = {
    items: {
      include: {
        variant: { include: { product: true } },
      },
    },
    supplier: true,
  }

  async findById(id: string): Promise<PurchaseOrderVO | null> {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: this.poInclude,
    })
    return po ? this.toVO(po as unknown as PurchaseOrderRow) : null
  }

  async findByTenant(tenantId: string | null, filters: PurchaseOrderFilters): Promise<PaginatedResult<PurchaseOrderVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = {}
    if (tenantId) where.tenantId = tenantId
    if (filters.status) where.status = filters.status
    if (filters.supplierId) where.supplierId = filters.supplierId
    if (filters.search) {
      where.OR = [
        { poNo: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.createdBy) where.createdBy = filters.createdBy
    if (filters.departmentId) where.departmentId = filters.departmentId

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: this.poInclude,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ])

    return {
      items: items.map((po) => this.toVO(po as unknown as PurchaseOrderRow)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(tenantId: string | null, createdBy: string, dto: CreatePurchaseOrderDTO): Promise<PurchaseOrderVO> {
    const poNo = generateDocumentNo('PO')
    const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const po = await this.prisma.purchaseOrder.create({
      data: {
        tenantId,
        poNo,
        supplierId: dto.supplierId,
        warehouseId: dto.warehouseId,
        totalAmount,
        currency: dto.currency ?? 'TWD',
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        remark: dto.remark,
        createdBy,
        items: {
          create: dto.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: this.poInclude,
    })
    return this.toVO(po as unknown as PurchaseOrderRow)
  }

  async updateStatus(id: string, status: string, approvedBy?: string): Promise<void> {
    const data: Record<string, unknown> = { status }
    if (approvedBy) data.approvedBy = approvedBy
    await this.prisma.purchaseOrder.update({ where: { id }, data })
  }

  async updateItemReceivedQty(itemId: string, receivedQty: number): Promise<void> {
    await this.prisma.purchaseOrderItem.update({
      where: { id: itemId },
      data: { receivedQty },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.purchaseOrder.delete({ where: { id } })
  }

  private toVO(po: PurchaseOrderRow): PurchaseOrderVO {
    return {
      id: po.id,
      tenantId: po.tenantId,
      poNo: po.poNo,
      supplierId: po.supplierId,
      supplierName: po.supplier.name,
      warehouseId: po.warehouseId,
      totalAmount: Number(po.totalAmount),
      currency: po.currency,
      status: po.status,
      expectedDate: po.expectedDate?.toISOString() ?? null,
      remark: po.remark,
      createdBy: po.createdBy,
      approvedBy: po.approvedBy,
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
      items: (po.items ?? []).map((i: PurchaseOrderItemRow) => this.toItemVO(i)),
    }
  }

  private toItemVO(i: PurchaseOrderItemRow): PurchaseOrderItemVO {
    return {
      id: i.id,
      purchaseOrderId: i.purchaseOrderId,
      variantId: i.variantId,
      variantSku: i.variant.sku,
      variantName: i.variant.name,
      productName: i.variant.product.name,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      receivedQty: i.receivedQty,
      subtotal: Number(i.subtotal),
    }
  }
}

// ---- 调拨单 ----

export class TransferOrderRepository implements ITransferOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly transferInclude = {
    items: {
      include: {
        variant: { include: { product: true } },
      },
    },
    // TransferOrder 没有直接的 warehouse relation，需要手动查询
  }

  async findById(id: string): Promise<TransferOrderVO | null> {
    const t = await this.prisma.transferOrder.findUnique({
      where: { id },
      include: this.transferInclude,
    })
    if (!t) return null
    return this.toVO(await this.enrichWithWarehouses(t))
  }

  async findAll(filters: TransferOrderFilters): Promise<PaginatedResult<TransferOrderVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = {}
    if (filters.status) where.status = filters.status
    if (filters.fromWarehouseId) where.fromWarehouseId = filters.fromWarehouseId
    if (filters.toWarehouseId) where.toWarehouseId = filters.toWarehouseId
    if (filters.search) {
      where.OR = [
        { transferNo: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.createdBy) where.createdBy = filters.createdBy
    if (filters.departmentId) where.departmentId = filters.departmentId

    const [items, total] = await Promise.all([
      this.prisma.transferOrder.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: this.transferInclude,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transferOrder.count({ where }),
    ])

    const enriched = await Promise.all(items.map((t) => this.enrichWithWarehouses(t)))

    return {
      items: enriched.map((t) => this.toVO(t)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async create(requestedBy: string, dto: CreateTransferOrderDTO): Promise<TransferOrderVO> {
    const transferNo = generateDocumentNo('TF')

    const t = await this.prisma.transferOrder.create({
      data: {
        transferNo,
        fromWarehouseId: dto.fromWarehouseId,
        toWarehouseId: dto.toWarehouseId,
        remark: dto.remark,
        requestedBy,
        items: {
          create: dto.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        },
      },
      include: this.transferInclude,
    })
    return this.toVO(await this.enrichWithWarehouses(t))
  }

  async updateStatus(id: string, status: string, approvedBy?: string): Promise<void> {
    const data: Record<string, unknown> = { status }
    if (approvedBy) data.approvedBy = approvedBy
    await this.prisma.transferOrder.update({ where: { id }, data })
  }

  async updateItemReceivedQty(itemId: string, receivedQty: number): Promise<void> {
    await this.prisma.transferOrderItem.update({
      where: { id: itemId },
      data: { receivedQty },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transferOrder.delete({ where: { id } })
  }

  /** 补充仓库名称信息 */
  private async enrichWithWarehouses(t: Record<string, unknown>): Promise<TransferOrderRow> {
    const [fromWarehouse, toWarehouse] = await Promise.all([
      this.prisma.warehouse.findUnique({ where: { id: t.fromWarehouseId as string }, select: { name: true } }),
      this.prisma.warehouse.findUnique({ where: { id: t.toWarehouseId as string }, select: { name: true } }),
    ])
    return {
      ...(t as unknown as TransferOrderRow),
      fromWarehouse: fromWarehouse ?? { name: '' },
      toWarehouse: toWarehouse ?? { name: '' },
    }
  }

  private toVO(t: TransferOrderRow): TransferOrderVO {
    return {
      id: t.id,
      transferNo: t.transferNo,
      fromWarehouseId: t.fromWarehouseId,
      fromWarehouseName: t.fromWarehouse.name,
      toWarehouseId: t.toWarehouseId,
      toWarehouseName: t.toWarehouse.name,
      status: t.status,
      requestedBy: t.requestedBy,
      approvedBy: t.approvedBy,
      remark: t.remark,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      items: (t.items ?? []).map((i: TransferOrderItemRow) => this.toItemVO(i)),
    }
  }

  private toItemVO(i: TransferOrderItemRow): TransferOrderItemVO {
    return {
      id: i.id,
      transferOrderId: i.transferOrderId,
      variantId: i.variantId,
      variantSku: i.variant.sku,
      variantName: i.variant.name,
      productName: i.variant.product.name,
      quantity: i.quantity,
      receivedQty: i.receivedQty,
    }
  }
}

// ---- 库存变动 ----

export class StockMovementRepository implements IStockMovementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private readonly movementInclude = {
    variant: { include: { product: true } },
  }

  async create(data: {
    variantId: string
    warehouseId: string
    type: string
    quantity: number
    refType?: string
    refId?: string
    snCodeId?: string
    remark?: string
    createdBy: string
  }): Promise<StockMovementVO> {
    const m = await this.prisma.stockMovement.create({
      data,
      include: this.movementInclude,
    })
    return this.toVO(await this.enrichWithWarehouse(m))
  }

  async findByVariant(variantId: string, filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>> {
    return this.query({ ...filters, variantId })
  }

  async findByWarehouse(warehouseId: string, filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>> {
    return this.query({ ...filters, warehouseId })
  }

  async findAll(filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>> {
    return this.query(filters)
  }

  private async query(filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>> {
    const { page, perPage } = clampPagination(filters.page, filters.perPage)
    const where: Record<string, unknown> = {}
    if (filters.variantId) where.variantId = filters.variantId
    if (filters.warehouseId) where.warehouseId = filters.warehouseId
    if (filters.type) where.type = filters.type
    if (filters.refType) where.refType = filters.refType
    if (filters.createdBy) where.createdBy = filters.createdBy
    if (filters.departmentId) where.departmentId = filters.departmentId

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: this.movementInclude,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ])

    const enriched = await Promise.all(items.map((m) => this.enrichWithWarehouse(m)))

    return {
      items: enriched.map((m) => this.toVO(m)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  /** 补充仓库名称 */
  private async enrichWithWarehouse(m: Record<string, unknown>): Promise<StockMovementRow> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: m.warehouseId as string },
      select: { name: true },
    })
    return {
      ...(m as unknown as StockMovementRow),
      warehouse: warehouse ?? { name: '' },
    }
  }

  private toVO(m: StockMovementRow): StockMovementVO {
    return {
      id: m.id,
      variantId: m.variantId,
      variantSku: m.variant.sku,
      variantName: m.variant.name,
      productName: m.variant.product.name,
      warehouseId: m.warehouseId,
      warehouseName: m.warehouse.name,
      type: m.type,
      quantity: m.quantity,
      refType: m.refType,
      refId: m.refId,
      snCodeId: m.snCodeId,
      remark: m.remark,
      createdBy: m.createdBy,
      createdAt: m.createdAt.toISOString(),
    }
  }
}

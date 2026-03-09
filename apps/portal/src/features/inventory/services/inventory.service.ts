// ============================================
// 进销存 — Service 实现
// 所有业务参数从 ConfigService 读取，禁止硬编码
// ============================================

import type { IConfigService, PaginatedResult } from '@twcrm/shared'
import {
  BusinessRuleError,
  InsufficientStockError,
  NotFoundError,
  DuplicateError,
} from '@twcrm/shared'
import { prisma } from '@twcrm/db'
import type {
  IWarehouseRepository, IStockRepository, ISnCodeRepository,
  ISupplierRepository, IPurchaseOrderRepository, ITransferOrderRepository,
  IStockMovementRepository,
} from '../repositories/inventory.repository.interface'
import type {
  IWarehouseService, IStockService, ISnCodeService,
  ISupplierService, IPurchaseOrderService, ITransferOrderService,
  IStockMovementService,
} from './inventory.service.interface'
import type {
  WarehouseVO, CreateWarehouseDTO, UpdateWarehouseDTO,
  StockVO, StockFilters, StockAdjustDTO,
  SnCodeVO, CreateSnCodeDTO, UpdateSnCodeDTO, SnFilters,
  SupplierVO, CreateSupplierDTO, UpdateSupplierDTO,
  PurchaseOrderVO, CreatePurchaseOrderDTO, PurchaseOrderFilters, ReceivePurchaseItemDTO,
  TransferOrderVO, CreateTransferOrderDTO, TransferOrderFilters, ReceiveTransferItemDTO,
  StockMovementVO, StockMovementFilters,
} from '../types/inventory.types'

// ---- 仓库 ----

export class WarehouseService implements IWarehouseService {
  constructor(
    private readonly warehouseRepo: IWarehouseRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getWarehouses(tenantId: string | null): Promise<WarehouseVO[]> {
    return this.warehouseRepo.findByTenant(tenantId)
  }

  async getWarehouseById(id: string): Promise<WarehouseVO | null> {
    return this.warehouseRepo.findById(id)
  }

  async createWarehouse(tenantId: string | null, dto: CreateWarehouseDTO): Promise<WarehouseVO> {
    // 检查仓库编码是否重复
    const existing = await this.warehouseRepo.findByCode(dto.code)
    if (existing) throw new DuplicateError('仓库', 'code')
    return this.warehouseRepo.create(tenantId, dto)
  }

  async updateWarehouse(id: string, dto: UpdateWarehouseDTO): Promise<WarehouseVO> {
    const warehouse = await this.warehouseRepo.findById(id)
    if (!warehouse) throw new NotFoundError('仓库', id)
    return this.warehouseRepo.update(id, dto)
  }

  async deleteWarehouse(id: string): Promise<void> {
    const warehouse = await this.warehouseRepo.findById(id)
    if (!warehouse) throw new NotFoundError('仓库', id)
    return this.warehouseRepo.delete(id)
  }
}

// ---- 库存 ----

export class StockService implements IStockService {
  constructor(
    private readonly stockRepo: IStockRepository,
    protected readonly movementRepo: IStockMovementRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getStockByWarehouse(warehouseId: string, filters: StockFilters): Promise<PaginatedResult<StockVO>> {
    return this.stockRepo.findByWarehouse(warehouseId, filters)
  }

  async getStockByVariant(variantId: string): Promise<StockVO[]> {
    return this.stockRepo.findByVariant(variantId)
  }

  async getAllStock(filters: StockFilters): Promise<PaginatedResult<StockVO>> {
    return this.stockRepo.findAll(filters)
  }

  async adjustStock(dto: StockAdjustDTO, userId: string): Promise<void> {
    // 在事务中完成库存调整 + 生成变动记录
    await prisma.$transaction(async (tx) => {
      // 调整库存
      await tx.stock.upsert({
        where: { variantId_warehouseId: { variantId: dto.variantId, warehouseId: dto.warehouseId } },
        update: { quantity: { increment: dto.quantity } },
        create: { variantId: dto.variantId, warehouseId: dto.warehouseId, quantity: Math.max(0, dto.quantity), lockedQty: 0 },
      })

      // 如果是减少，校验库存是否足够
      if (dto.quantity < 0) {
        const stock = await tx.stock.findUnique({
          where: { variantId_warehouseId: { variantId: dto.variantId, warehouseId: dto.warehouseId } },
        })
        if (stock && stock.quantity < 0) {
          throw new BusinessRuleError('库存不足，无法调整')
        }
      }

      // 创建库存变动记录
      await tx.stockMovement.create({
        data: {
          variantId: dto.variantId,
          warehouseId: dto.warehouseId,
          type: 'adjust',
          quantity: dto.quantity,
          refType: 'adjust',
          remark: dto.remark,
          createdBy: userId,
        },
      })
    })
  }
}

// ---- SN 码 ----

export class SnCodeService implements ISnCodeService {
  constructor(
    private readonly snCodeRepo: ISnCodeRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getSnCodes(filters: SnFilters): Promise<PaginatedResult<SnCodeVO>> {
    return this.snCodeRepo.findAll(filters)
  }

  async getSnCodeById(id: string): Promise<SnCodeVO | null> {
    return this.snCodeRepo.findById(id)
  }

  async getSnCodeBySn(sn: string): Promise<SnCodeVO | null> {
    return this.snCodeRepo.findBySn(sn)
  }

  async createSnCode(dto: CreateSnCodeDTO): Promise<SnCodeVO> {
    // 检查 SN 码是否重复
    const existing = await this.snCodeRepo.findBySn(dto.sn)
    if (existing) throw new DuplicateError('SN 码', 'sn')
    return this.snCodeRepo.create(dto)
  }

  async updateSnCode(id: string, dto: UpdateSnCodeDTO): Promise<SnCodeVO> {
    const snCode = await this.snCodeRepo.findById(id)
    if (!snCode) throw new NotFoundError('SN 码', id)

    // 状态流转校验
    if (dto.status) {
      this.validateStatusTransition(snCode.status, dto.status)
    }

    return this.snCodeRepo.update(id, dto)
  }

  async deleteSnCode(id: string): Promise<void> {
    const snCode = await this.snCodeRepo.findById(id)
    if (!snCode) throw new NotFoundError('SN 码', id)
    if (snCode.status !== 'in_stock') {
      throw new BusinessRuleError('只能删除在库状态的 SN 码')
    }
    return this.snCodeRepo.delete(id)
  }

  /** 校验 SN 码状态流转合法性 */
  private validateStatusTransition(current: string, next: string): void {
    const transitions: Record<string, string[]> = {
      in_stock: ['allocated', 'returned', 'scrapped'],
      allocated: ['shipped', 'in_stock'],
      shipped: ['installed', 'returned'],
      installed: ['returned', 'scrapped'],
      returned: ['in_stock', 'scrapped'],
      scrapped: [],
    }
    const allowed = transitions[current] ?? []
    if (!allowed.includes(next)) {
      throw new BusinessRuleError(`SN 码状态不允许从 ${current} 变更为 ${next}`)
    }
  }
}

// ---- 供应商 ----

export class SupplierService implements ISupplierService {
  constructor(
    private readonly supplierRepo: ISupplierRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getSuppliers(tenantId: string | null, filters: { search?: string; status?: string; page?: number; perPage?: number }): Promise<PaginatedResult<SupplierVO>> {
    return this.supplierRepo.findAll(tenantId, filters)
  }

  async getSupplierById(id: string): Promise<SupplierVO | null> {
    return this.supplierRepo.findById(id)
  }

  async createSupplier(tenantId: string | null, dto: CreateSupplierDTO): Promise<SupplierVO> {
    return this.supplierRepo.create(tenantId, dto)
  }

  async updateSupplier(id: string, dto: UpdateSupplierDTO): Promise<SupplierVO> {
    const supplier = await this.supplierRepo.findById(id)
    if (!supplier) throw new NotFoundError('供应商', id)
    return this.supplierRepo.update(id, dto)
  }

  async deleteSupplier(id: string): Promise<void> {
    const supplier = await this.supplierRepo.findById(id)
    if (!supplier) throw new NotFoundError('供应商', id)
    return this.supplierRepo.delete(id)
  }
}

// ---- 采购单 ----

export class PurchaseOrderService implements IPurchaseOrderService {
  constructor(
    private readonly poRepo: IPurchaseOrderRepository,
    protected readonly stockRepo: IStockRepository,
    protected readonly movementRepo: IStockMovementRepository,
    private readonly configService: IConfigService,
  ) {}

  async getPurchaseOrders(tenantId: string | null, filters: PurchaseOrderFilters): Promise<PaginatedResult<PurchaseOrderVO>> {
    return this.poRepo.findByTenant(tenantId, filters)
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrderVO | null> {
    return this.poRepo.findById(id)
  }

  async createPurchaseOrder(tenantId: string | null, userId: string, dto: CreatePurchaseOrderDTO): Promise<PurchaseOrderVO> {
    // 从 ConfigService 读取默认币种
    const defaultCurrency = await this.configService.get('inventory', 'default_currency', tenantId ?? undefined) ?? 'TWD'
    if (!dto.currency) dto.currency = defaultCurrency
    return this.poRepo.create(tenantId, userId, dto)
  }

  async approvePurchaseOrder(id: string, userId: string): Promise<void> {
    const po = await this.poRepo.findById(id)
    if (!po) throw new NotFoundError('采购单', id)
    if (po.status !== 'draft') throw new BusinessRuleError('只能审批草稿状态的采购单')
    await this.poRepo.updateStatus(id, 'approved', userId)
  }

  async receivePurchaseOrder(id: string, items: ReceivePurchaseItemDTO[], userId: string): Promise<void> {
    const po = await this.poRepo.findById(id)
    if (!po) throw new NotFoundError('采购单', id)
    if (!['approved', 'ordered', 'partial_received'].includes(po.status)) {
      throw new BusinessRuleError('该采购单状态不允许收货')
    }

    // 在事务中处理收货
    await prisma.$transaction(async (tx) => {
      let allReceived = true

      for (const receiveItem of items) {
        // 查找采购明细
        const poItem = po.items.find((i) => i.id === receiveItem.itemId)
        if (!poItem) throw new NotFoundError('采购明细', receiveItem.itemId)

        const newReceivedQty = poItem.receivedQty + receiveItem.receivedQty
        if (newReceivedQty > poItem.quantity) {
          throw new BusinessRuleError(`${poItem.variantSku} 收货数量超过采购数量`)
        }

        // 更新采购明细收货数量
        await tx.purchaseOrderItem.update({
          where: { id: receiveItem.itemId },
          data: { receivedQty: newReceivedQty },
        })

        // 增加库存
        await tx.stock.upsert({
          where: { variantId_warehouseId: { variantId: poItem.variantId, warehouseId: po.warehouseId } },
          update: { quantity: { increment: receiveItem.receivedQty } },
          create: { variantId: poItem.variantId, warehouseId: po.warehouseId, quantity: receiveItem.receivedQty, lockedQty: 0 },
        })

        // 创建库存变动记录
        await tx.stockMovement.create({
          data: {
            variantId: poItem.variantId,
            warehouseId: po.warehouseId,
            type: 'in',
            quantity: receiveItem.receivedQty,
            refType: 'purchase',
            refId: po.id,
            remark: `采购入库 ${po.poNo}`,
            createdBy: userId,
          },
        })

        if (newReceivedQty < poItem.quantity) {
          allReceived = false
        }
      }

      // 检查是否所有明细都已收齐（也需检查未在本次收货中出现的明细）
      for (const poItem of po.items) {
        const receiveItem = items.find((i) => i.itemId === poItem.id)
        if (!receiveItem) {
          if (poItem.receivedQty < poItem.quantity) allReceived = false
        }
      }

      // 更新采购单状态
      const newStatus = allReceived ? 'received' : 'partial_received'
      await tx.purchaseOrder.update({
        where: { id },
        data: { status: newStatus },
      })
    })
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    const po = await this.poRepo.findById(id)
    if (!po) throw new NotFoundError('采购单', id)
    if (po.status !== 'draft') throw new BusinessRuleError('只能删除草稿状态的采购单')
    return this.poRepo.delete(id)
  }
}

// ---- 调拨单 ----

export class TransferOrderService implements ITransferOrderService {
  constructor(
    private readonly transferRepo: ITransferOrderRepository,
    private readonly stockRepo: IStockRepository,
    protected readonly movementRepo: IStockMovementRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getTransferOrders(filters: TransferOrderFilters): Promise<PaginatedResult<TransferOrderVO>> {
    return this.transferRepo.findAll(filters)
  }

  async getTransferOrderById(id: string): Promise<TransferOrderVO | null> {
    return this.transferRepo.findById(id)
  }

  async createTransferOrder(userId: string, dto: CreateTransferOrderDTO): Promise<TransferOrderVO> {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BusinessRuleError('源仓库和目标仓库不能相同')
    }

    // 校验源仓库库存是否充足
    for (const item of dto.items) {
      const stock = await this.stockRepo.findByVariantAndWarehouse(item.variantId, dto.fromWarehouseId)
      const available = stock ? stock.availableQty : 0
      if (available < item.quantity) {
        const sku = stock?.variantSku ?? item.variantId
        throw new InsufficientStockError(sku, available, item.quantity)
      }
    }

    return this.transferRepo.create(userId, dto)
  }

  async approveTransferOrder(id: string, userId: string): Promise<void> {
    const transfer = await this.transferRepo.findById(id)
    if (!transfer) throw new NotFoundError('调拨单', id)
    if (transfer.status !== 'pending') throw new BusinessRuleError('只能审批待审批状态的调拨单')
    await this.transferRepo.updateStatus(id, 'approved', userId)
  }

  async shipTransferOrder(id: string): Promise<void> {
    const transfer = await this.transferRepo.findById(id)
    if (!transfer) throw new NotFoundError('调拨单', id)
    if (transfer.status !== 'approved') throw new BusinessRuleError('只能发货已审批的调拨单')

    // 在事务中锁定源仓库库存
    await prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        // 校验源仓库库存
        const stock = await tx.stock.findUnique({
          where: { variantId_warehouseId: { variantId: item.variantId, warehouseId: transfer.fromWarehouseId } },
        })
        const available = stock ? stock.quantity - stock.lockedQty : 0
        if (available < item.quantity) {
          throw new InsufficientStockError(item.variantSku, available, item.quantity)
        }

        // 锁定库存
        await tx.stock.update({
          where: { variantId_warehouseId: { variantId: item.variantId, warehouseId: transfer.fromWarehouseId } },
          data: { lockedQty: { increment: item.quantity } },
        })
      }

      await tx.transferOrder.update({
        where: { id },
        data: { status: 'shipping' },
      })
    })
  }

  async receiveTransferOrder(id: string, items: ReceiveTransferItemDTO[], userId: string): Promise<void> {
    const transfer = await this.transferRepo.findById(id)
    if (!transfer) throw new NotFoundError('调拨单', id)
    if (transfer.status !== 'shipping') throw new BusinessRuleError('只能收货发货中的调拨单')

    await prisma.$transaction(async (tx) => {
      let allReceived = true

      for (const receiveItem of items) {
        const transferItem = transfer.items.find((i) => i.id === receiveItem.itemId)
        if (!transferItem) throw new NotFoundError('调拨明细', receiveItem.itemId)

        const newReceivedQty = transferItem.receivedQty + receiveItem.receivedQty
        if (newReceivedQty > transferItem.quantity) {
          throw new BusinessRuleError(`${transferItem.variantSku} 收货数量超过调拨数量`)
        }

        // 更新调拨明细收货数量
        await tx.transferOrderItem.update({
          where: { id: receiveItem.itemId },
          data: { receivedQty: newReceivedQty },
        })

        // 源仓库扣减库存 + 解锁
        await tx.stock.update({
          where: { variantId_warehouseId: { variantId: transferItem.variantId, warehouseId: transfer.fromWarehouseId } },
          data: {
            quantity: { decrement: receiveItem.receivedQty },
            lockedQty: { decrement: receiveItem.receivedQty },
          },
        })

        // 目标仓库增加库存
        await tx.stock.upsert({
          where: { variantId_warehouseId: { variantId: transferItem.variantId, warehouseId: transfer.toWarehouseId } },
          update: { quantity: { increment: receiveItem.receivedQty } },
          create: { variantId: transferItem.variantId, warehouseId: transfer.toWarehouseId, quantity: receiveItem.receivedQty, lockedQty: 0 },
        })

        // 创建出库变动记录
        await tx.stockMovement.create({
          data: {
            variantId: transferItem.variantId,
            warehouseId: transfer.fromWarehouseId,
            type: 'transfer_out',
            quantity: -receiveItem.receivedQty,
            refType: 'transfer',
            refId: transfer.id,
            remark: `调拨出库 ${transfer.transferNo}`,
            createdBy: userId,
          },
        })

        // 创建入库变动记录
        await tx.stockMovement.create({
          data: {
            variantId: transferItem.variantId,
            warehouseId: transfer.toWarehouseId,
            type: 'transfer_in',
            quantity: receiveItem.receivedQty,
            refType: 'transfer',
            refId: transfer.id,
            remark: `调拨入库 ${transfer.transferNo}`,
            createdBy: userId,
          },
        })

        if (newReceivedQty < transferItem.quantity) {
          allReceived = false
        }
      }

      // 检查未在本次收货中出现的明细
      for (const transferItem of transfer.items) {
        const receiveItem = items.find((i) => i.itemId === transferItem.id)
        if (!receiveItem) {
          if (transferItem.receivedQty < transferItem.quantity) allReceived = false
        }
      }

      // 更新调拨单状态
      const newStatus = allReceived ? 'received' : 'shipping'
      await tx.transferOrder.update({
        where: { id },
        data: { status: newStatus },
      })
    })
  }

  async deleteTransferOrder(id: string): Promise<void> {
    const transfer = await this.transferRepo.findById(id)
    if (!transfer) throw new NotFoundError('调拨单', id)
    if (transfer.status !== 'pending') throw new BusinessRuleError('只能删除待审批状态的调拨单')
    return this.transferRepo.delete(id)
  }
}

// ---- 库存变动 ----

export class StockMovementService implements IStockMovementService {
  constructor(
    private readonly movementRepo: IStockMovementRepository,
    protected readonly configService: IConfigService,
  ) {}

  async getMovements(filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>> {
    return this.movementRepo.findAll(filters)
  }

  async getMovementsByVariant(variantId: string, filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>> {
    return this.movementRepo.findByVariant(variantId, filters)
  }

  async getMovementsByWarehouse(warehouseId: string, filters: StockMovementFilters): Promise<PaginatedResult<StockMovementVO>> {
    return this.movementRepo.findByWarehouse(warehouseId, filters)
  }
}

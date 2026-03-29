// ============================================
// DI 容器 — 工厂函数统一管理 Service 实例
// 所有 Service 通过此文件创建，禁止直接 new
// ============================================

import { prisma, withTenant } from '@twcrm/db'
import type { PrismaClient } from '@twcrm/db'
import { ConfigService } from './services/config.service'
import { RbacService } from './services/rbac.service'
import type { IConfigService, SessionUser } from '@twcrm/shared'
import type { IRbacService } from './services/rbac.service'

/**
 * 创建租户隔离的 Prisma Client
 * 平台用户（isPlatform=true）直接使用原始 prisma，不注入 tenantId 过滤
 */
function getTenantPrisma(tenantId: string, isPlatform: boolean): PrismaClient {
  if (isPlatform) return prisma
  return withTenant(prisma, tenantId) as unknown as PrismaClient
}

// ---- 单例 ----

let _configService: ConfigService | null = null
let _rbacService: RbacService | null = null

/** 获取 ConfigService 单例 */
export function getConfigService(): IConfigService {
  if (!_configService) _configService = new ConfigService(prisma)
  return _configService
}

/** 获取 RbacService 单例 */
export function getRbacService(): IRbacService {
  if (!_rbacService) _rbacService = new RbacService()
  return _rbacService
}

// ---- 快捷方法（Server Action 中直接调用） ----

/** 校验登录 */
export async function requireAuth() {
  return getRbacService().requireAuth()
}

/** 校验权限 */
export async function requirePermission(permission: string) {
  return getRbacService().requirePermission(permission)
}

/** 校验任一权限 */
export async function requireAnyPermission(permissions: string[]) {
  return getRbacService().requireAnyPermission(permissions)
}

/** 校验所有权限 */
export async function requireAllPermissions(permissions: string[]) {
  return getRbacService().requireAllPermissions(permissions)
}

/** 校验总部 */
export async function requirePlatform() {
  return getRbacService().requirePlatform()
}

/** 获取数据范围 */
export function getDataScope(user: SessionUser, permission: string): string {
  return getRbacService().getDataScope(user, permission)
}

// ---- 业务 Service 工厂 ----

// B2B 订货
import { CatalogRepository, CartRepository, OrderRepository, ShipmentRepository, AccountRepository } from '@/features/ordering/repositories/ordering.repository'
import { CatalogService, CartService, OrderService, AccountService } from '@/features/ordering/services/ordering.service'
import type { ICatalogService, ICartService, IOrderService, IAccountService } from '@/features/ordering/services/ordering.service.interface'

export function createCatalogService(tenantId: string, isPlatform: boolean): ICatalogService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new CatalogService(new CatalogRepository(db), getConfigService())
}

export function createCartService(tenantId: string, isPlatform: boolean): ICartService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new CartService(new CartRepository(db), new CatalogRepository(db), getConfigService())
}

export function createOrderService(tenantId: string, isPlatform: boolean): IOrderService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new OrderService(
    new OrderRepository(db),
    new CartRepository(db),
    new CatalogRepository(db),
    new AccountRepository(db),
    new ShipmentRepository(db),
    getConfigService(),
  )
}

export function createAccountService(tenantId: string, isPlatform: boolean): IAccountService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new AccountService(new AccountRepository(db), getConfigService())
}

// TODO: CRM 模块
import { CustomerRepository, OpportunityRepository, FollowUpRepository } from '@/features/crm/repositories/crm.repository'
import { CustomerService, OpportunityService, FollowUpService } from '@/features/crm/services/crm.service'
import type { ICustomerService, IOpportunityService, IFollowUpService } from '@/features/crm/services/crm.service.interface'

export function createCustomerService(tenantId: string, isPlatform: boolean): ICustomerService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new CustomerService(new CustomerRepository(db), getConfigService())
}

export function createOpportunityService(tenantId: string, isPlatform: boolean): IOpportunityService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new OpportunityService(new OpportunityRepository(db), getConfigService())
}

export function createFollowUpService(tenantId: string, isPlatform: boolean): IFollowUpService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new FollowUpService(new FollowUpRepository(db), getConfigService())
}

// TODO: 通知模块
import { AnnouncementRepository, NotificationRepository, ConfigRepository } from '@/features/system/repositories/system.repository'
import { AnnouncementService, NotificationService, SystemConfigService } from '@/features/system/services/system.service'
import type { IAnnouncementService, INotificationService, ISystemConfigService } from '@/features/system/services/system.service.interface'

export function createAnnouncementService(tenantId: string, isPlatform: boolean): IAnnouncementService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new AnnouncementService(new AnnouncementRepository(db), getConfigService())
}

export function createNotificationService(tenantId: string, isPlatform: boolean): INotificationService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new NotificationService(new NotificationRepository(db), getConfigService())
}

export function createSystemConfigService(tenantId: string, isPlatform: boolean): ISystemConfigService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new SystemConfigService(new ConfigRepository(db), getConfigService())
}

// RBAC 管理
import { RbacRepository } from '@/features/system/repositories/rbac.repository'
import { RbacManagementService } from '@/features/system/services/rbac-management.service'
import type { IRbacManagementService } from '@/features/system/services/rbac-management.service.interface'

export function createRbacManagementService(tenantId: string, isPlatform: boolean): IRbacManagementService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new RbacManagementService(new RbacRepository(db), getConfigService())
}

// Finance 财务
import { PaymentRepository, DisbursementRepository, InvoiceRepository, ExpenseRepository } from '@/features/finance/repositories/finance.repository'
import { PaymentService, DisbursementService, InvoiceService, ExpenseService } from '@/features/finance/services/finance.service'
import type { IPaymentService, IDisbursementService, IInvoiceService, IExpenseService } from '@/features/finance/services/finance.service.interface'

export function createPaymentService(tenantId: string, isPlatform: boolean): IPaymentService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new PaymentService(new PaymentRepository(db), getConfigService())
}

export function createDisbursementService(tenantId: string, isPlatform: boolean): IDisbursementService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new DisbursementService(new DisbursementRepository(db), getConfigService())
}

export function createInvoiceService(tenantId: string, isPlatform: boolean): IInvoiceService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new InvoiceService(new InvoiceRepository(db), getConfigService())
}

export function createExpenseService(tenantId: string, isPlatform: boolean): IExpenseService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new ExpenseService(new ExpenseRepository(db), getConfigService())
}

// Inventory 进销存
import {
  WarehouseRepository, StockRepository, SnCodeRepository,
  SupplierRepository, PurchaseOrderRepository, TransferOrderRepository,
  StockMovementRepository,
} from '@/features/inventory/repositories/inventory.repository'
import {
  WarehouseService, StockService, SnCodeService,
  SupplierService, PurchaseOrderService, TransferOrderService,
  StockMovementService,
} from '@/features/inventory/services/inventory.service'
import type {
  IWarehouseService, IStockService, ISnCodeService,
  ISupplierService, IPurchaseOrderService, ITransferOrderService,
  IStockMovementService,
} from '@/features/inventory/services/inventory.service.interface'

export function createWarehouseService(tenantId: string, isPlatform: boolean): IWarehouseService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new WarehouseService(new WarehouseRepository(db), getConfigService())
}

export function createStockService(tenantId: string, isPlatform: boolean): IStockService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new StockService(new StockRepository(db), new StockMovementRepository(db), getConfigService())
}

export function createSnCodeService(tenantId: string, isPlatform: boolean): ISnCodeService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new SnCodeService(new SnCodeRepository(db), getConfigService())
}

export function createSupplierService(tenantId: string, isPlatform: boolean): ISupplierService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new SupplierService(new SupplierRepository(db), getConfigService())
}

export function createPurchaseOrderService(tenantId: string, isPlatform: boolean): IPurchaseOrderService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new PurchaseOrderService(
    new PurchaseOrderRepository(db),
    new StockRepository(db),
    new StockMovementRepository(db),
    getConfigService(),
  )
}

export function createTransferOrderService(tenantId: string, isPlatform: boolean): ITransferOrderService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new TransferOrderService(
    new TransferOrderRepository(db),
    new StockRepository(db),
    new StockMovementRepository(db),
    getConfigService(),
  )
}

export function createStockMovementService(tenantId: string, isPlatform: boolean): IStockMovementService {
  const db = getTenantPrisma(tenantId, isPlatform)
  return new StockMovementService(new StockMovementRepository(db), getConfigService())
}

// ============================================
// DI 容器 — 工厂函数统一管理 Service 实例
// 所有 Service 通过此文件创建，禁止直接 new
// ============================================

import { prisma } from '@twcrm/db'
import { ConfigService } from './services/config.service'
import { RbacService } from './services/rbac.service'
import type { IConfigService, SessionUser } from '@twcrm/shared'
import type { IRbacService } from './services/rbac.service'

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
import { CatalogRepository, CartRepository, OrderRepository, AccountRepository } from '@/features/ordering/repositories/ordering.repository'
import { CatalogService, CartService, OrderService, AccountService } from '@/features/ordering/services/ordering.service'
import type { ICatalogService, ICartService, IOrderService, IAccountService } from '@/features/ordering/services/ordering.service.interface'

export function createCatalogService(): ICatalogService {
  return new CatalogService(new CatalogRepository(prisma), getConfigService())
}

export function createCartService(): ICartService {
  return new CartService(new CartRepository(prisma), new CatalogRepository(prisma), getConfigService())
}

export function createOrderService(): IOrderService {
  return new OrderService(
    new OrderRepository(prisma),
    new CartRepository(prisma),
    new CatalogRepository(prisma),
    new AccountRepository(prisma),
    getConfigService(),
  )
}

export function createAccountService(): IAccountService {
  return new AccountService(new AccountRepository(prisma), getConfigService())
}

// TODO: CRM 模块
import { CustomerRepository, OpportunityRepository, FollowUpRepository } from '@/features/crm/repositories/crm.repository'
import { CustomerService, OpportunityService, FollowUpService } from '@/features/crm/services/crm.service'
import type { ICustomerService, IOpportunityService, IFollowUpService } from '@/features/crm/services/crm.service.interface'

export function createCustomerService(): ICustomerService {
  return new CustomerService(new CustomerRepository(prisma), getConfigService())
}

export function createOpportunityService(): IOpportunityService {
  return new OpportunityService(new OpportunityRepository(prisma), getConfigService())
}

export function createFollowUpService(): IFollowUpService {
  return new FollowUpService(new FollowUpRepository(prisma), getConfigService())
}

// TODO: 通知模块
import { AnnouncementRepository, NotificationRepository, ConfigRepository } from '@/features/system/repositories/system.repository'
import { AnnouncementService, NotificationService, SystemConfigService } from '@/features/system/services/system.service'
import type { IAnnouncementService, INotificationService, ISystemConfigService } from '@/features/system/services/system.service.interface'

export function createAnnouncementService(): IAnnouncementService {
  return new AnnouncementService(new AnnouncementRepository(prisma), getConfigService())
}

export function createNotificationService(): INotificationService {
  return new NotificationService(new NotificationRepository(prisma), getConfigService())
}

export function createSystemConfigService(): ISystemConfigService {
  return new SystemConfigService(new ConfigRepository(prisma), getConfigService())
}

// RBAC 管理
import { RbacRepository } from '@/features/system/repositories/rbac.repository'
import { RbacManagementService } from '@/features/system/services/rbac-management.service'
import type { IRbacManagementService } from '@/features/system/services/rbac-management.service.interface'

export function createRbacManagementService(): IRbacManagementService {
  return new RbacManagementService(new RbacRepository(prisma), getConfigService())
}

// Finance 财务
import { PaymentRepository, DisbursementRepository, InvoiceRepository, ExpenseRepository } from '@/features/finance/repositories/finance.repository'
import { PaymentService, DisbursementService, InvoiceService, ExpenseService } from '@/features/finance/services/finance.service'
import type { IPaymentService, IDisbursementService, IInvoiceService, IExpenseService } from '@/features/finance/services/finance.service.interface'

export function createPaymentService(): IPaymentService {
  return new PaymentService(new PaymentRepository(prisma), getConfigService())
}

export function createDisbursementService(): IDisbursementService {
  return new DisbursementService(new DisbursementRepository(prisma), getConfigService())
}

export function createInvoiceService(): IInvoiceService {
  return new InvoiceService(new InvoiceRepository(prisma), getConfigService())
}

export function createExpenseService(): IExpenseService {
  return new ExpenseService(new ExpenseRepository(prisma), getConfigService())
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

export function createWarehouseService(): IWarehouseService {
  return new WarehouseService(new WarehouseRepository(prisma), getConfigService())
}

export function createStockService(): IStockService {
  return new StockService(new StockRepository(prisma), new StockMovementRepository(prisma), getConfigService())
}

export function createSnCodeService(): ISnCodeService {
  return new SnCodeService(new SnCodeRepository(prisma), getConfigService())
}

export function createSupplierService(): ISupplierService {
  return new SupplierService(new SupplierRepository(prisma), getConfigService())
}

export function createPurchaseOrderService(): IPurchaseOrderService {
  return new PurchaseOrderService(
    new PurchaseOrderRepository(prisma),
    new StockRepository(prisma),
    new StockMovementRepository(prisma),
    getConfigService(),
  )
}

export function createTransferOrderService(): ITransferOrderService {
  return new TransferOrderService(
    new TransferOrderRepository(prisma),
    new StockRepository(prisma),
    new StockMovementRepository(prisma),
    getConfigService(),
  )
}

export function createStockMovementService(): IStockMovementService {
  return new StockMovementService(new StockMovementRepository(prisma), getConfigService())
}

// ============================================
// DI 容器 — 工厂函数统一管理 Service 实例
// 所有 Service 通过此文件创建，禁止直接 new
// ============================================

import { prisma } from '@twcrm/db'
import { ConfigService } from './services/config.service'
import { RbacService } from './services/rbac.service'
import type { IConfigService } from '@twcrm/shared'
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

/** 校验总部 */
export async function requirePlatform() {
  return getRbacService().requirePlatform()
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

// ============================================
// 全局常量
// ============================================

// ---------- 语言 ----------
export const LOCALES = ['zh-CN', 'zh-TW', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'zh-CN'

export const LOCALE_LABELS: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
}

// ---------- 角色 ----------
export const ROLES = {
  PLATFORM_ADMIN: 'platform_admin',
  PLATFORM_VIEWER: 'platform_viewer',
  TENANT_ADMIN: 'tenant_admin',
  TENANT_MANAGER: 'tenant_manager',
  TENANT_USER: 'tenant_user',
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

// ---------- 数据范围 ----------
export const DATA_SCOPE = {
  ALL: 'all',           // 租户内所有数据
  DEPARTMENT: 'department', // 仅本部门数据
  OWN: 'own',           // 仅自己的数据
} as const

export type DataScope = (typeof DATA_SCOPE)[keyof typeof DATA_SCOPE]

// ---------- 权限定义 ----------
// 格式: module:action:resource
export const PERMISSIONS = {
  // CRM
  CRM_CREATE_CUSTOMER: 'crm:create:customer',
  CRM_READ_CUSTOMER: 'crm:read:customer',
  CRM_UPDATE_CUSTOMER: 'crm:update:customer',
  CRM_DELETE_CUSTOMER: 'crm:delete:customer',
  CRM_EXPORT_CUSTOMER: 'crm:export:customer',
  CRM_ASSIGN_CUSTOMER: 'crm:assign:customer',
  CRM_CREATE_CONTACT: 'crm:create:contact',
  CRM_READ_CONTACT: 'crm:read:contact',
  CRM_UPDATE_CONTACT: 'crm:update:contact',
  CRM_DELETE_CONTACT: 'crm:delete:contact',
  CRM_CREATE_OPPORTUNITY: 'crm:create:opportunity',
  CRM_READ_OPPORTUNITY: 'crm:read:opportunity',
  CRM_UPDATE_OPPORTUNITY: 'crm:update:opportunity',
  CRM_DELETE_OPPORTUNITY: 'crm:delete:opportunity',
  CRM_EXPORT_OPPORTUNITY: 'crm:export:opportunity',
  CRM_ASSIGN_OPPORTUNITY: 'crm:assign:opportunity',
  CRM_CREATE_CONTRACT: 'crm:create:contract',
  CRM_READ_CONTRACT: 'crm:read:contract',
  CRM_UPDATE_CONTRACT: 'crm:update:contract',
  CRM_DELETE_CONTRACT: 'crm:delete:contract',
  CRM_APPROVE_CONTRACT: 'crm:approve:contract',
  CRM_EXPORT_CONTRACT: 'crm:export:contract',
  CRM_CREATE_WORKORDER: 'crm:create:workorder',
  CRM_READ_WORKORDER: 'crm:read:workorder',
  CRM_UPDATE_WORKORDER: 'crm:update:workorder',
  CRM_DELETE_WORKORDER: 'crm:delete:workorder',
  CRM_ASSIGN_WORKORDER: 'crm:assign:workorder',
  CRM_CREATE_FOLLOWUP: 'crm:create:followup',
  CRM_READ_FOLLOWUP: 'crm:read:followup',
  CRM_UPDATE_FOLLOWUP: 'crm:update:followup',
  CRM_DELETE_FOLLOWUP: 'crm:delete:followup',

  // Ordering
  ORDERING_READ_CATALOG: 'ordering:read:catalog',
  ORDERING_CREATE_CATALOG: 'ordering:create:catalog',
  ORDERING_UPDATE_CATALOG: 'ordering:update:catalog',
  ORDERING_DELETE_CATALOG: 'ordering:delete:catalog',
  ORDERING_CREATE_ORDER: 'ordering:create:order',
  ORDERING_READ_ORDER: 'ordering:read:order',
  ORDERING_UPDATE_ORDER: 'ordering:update:order',
  ORDERING_DELETE_ORDER: 'ordering:delete:order',
  ORDERING_APPROVE_ORDER: 'ordering:approve:order',
  ORDERING_EXPORT_ORDER: 'ordering:export:order',
  ORDERING_READ_PRICE: 'ordering:read:price',
  ORDERING_UPDATE_PRICE: 'ordering:update:price',
  ORDERING_READ_ACCOUNT: 'ordering:read:account',
  ORDERING_UPDATE_ACCOUNT: 'ordering:update:account',
  ORDERING_READ_SHIPMENT: 'ordering:read:shipment',
  ORDERING_UPDATE_SHIPMENT: 'ordering:update:shipment',
  ORDERING_READ_CART: 'ordering:read:cart',
  ORDERING_CREATE_CART: 'ordering:create:cart',
  ORDERING_UPDATE_CART: 'ordering:update:cart',
  ORDERING_DELETE_CART: 'ordering:delete:cart',

  // Inventory
  INVENTORY_CREATE_WAREHOUSE: 'inventory:create:warehouse',
  INVENTORY_READ_WAREHOUSE: 'inventory:read:warehouse',
  INVENTORY_UPDATE_WAREHOUSE: 'inventory:update:warehouse',
  INVENTORY_DELETE_WAREHOUSE: 'inventory:delete:warehouse',
  INVENTORY_CREATE_PRODUCT: 'inventory:create:product',
  INVENTORY_READ_PRODUCT: 'inventory:read:product',
  INVENTORY_UPDATE_PRODUCT: 'inventory:update:product',
  INVENTORY_DELETE_PRODUCT: 'inventory:delete:product',
  INVENTORY_READ_STOCK: 'inventory:read:stock',
  INVENTORY_UPDATE_STOCK: 'inventory:update:stock',
  INVENTORY_EXPORT_STOCK: 'inventory:export:stock',
  INVENTORY_CREATE_SN: 'inventory:create:sn',
  INVENTORY_READ_SN: 'inventory:read:sn',
  INVENTORY_UPDATE_SN: 'inventory:update:sn',
  INVENTORY_CREATE_PURCHASE: 'inventory:create:purchase',
  INVENTORY_READ_PURCHASE: 'inventory:read:purchase',
  INVENTORY_UPDATE_PURCHASE: 'inventory:update:purchase',
  INVENTORY_DELETE_PURCHASE: 'inventory:delete:purchase',
  INVENTORY_APPROVE_PURCHASE: 'inventory:approve:purchase',
  INVENTORY_CREATE_TRANSFER: 'inventory:create:transfer',
  INVENTORY_READ_TRANSFER: 'inventory:read:transfer',
  INVENTORY_UPDATE_TRANSFER: 'inventory:update:transfer',
  INVENTORY_APPROVE_TRANSFER: 'inventory:approve:transfer',
  INVENTORY_CREATE_SUPPLIER: 'inventory:create:supplier',
  INVENTORY_READ_SUPPLIER: 'inventory:read:supplier',
  INVENTORY_UPDATE_SUPPLIER: 'inventory:update:supplier',
  INVENTORY_DELETE_SUPPLIER: 'inventory:delete:supplier',

  // Finance
  FINANCE_CREATE_PAYMENT: 'finance:create:payment',
  FINANCE_READ_PAYMENT: 'finance:read:payment',
  FINANCE_UPDATE_PAYMENT: 'finance:update:payment',
  FINANCE_APPROVE_PAYMENT: 'finance:approve:payment',
  FINANCE_EXPORT_PAYMENT: 'finance:export:payment',
  FINANCE_CREATE_DISBURSEMENT: 'finance:create:disbursement',
  FINANCE_READ_DISBURSEMENT: 'finance:read:disbursement',
  FINANCE_UPDATE_DISBURSEMENT: 'finance:update:disbursement',
  FINANCE_APPROVE_DISBURSEMENT: 'finance:approve:disbursement',
  FINANCE_CREATE_INVOICE: 'finance:create:invoice',
  FINANCE_READ_INVOICE: 'finance:read:invoice',
  FINANCE_UPDATE_INVOICE: 'finance:update:invoice',
  FINANCE_DELETE_INVOICE: 'finance:delete:invoice',
  FINANCE_CREATE_EXPENSE: 'finance:create:expense',
  FINANCE_READ_EXPENSE: 'finance:read:expense',
  FINANCE_UPDATE_EXPENSE: 'finance:update:expense',
  FINANCE_APPROVE_EXPENSE: 'finance:approve:expense',
  FINANCE_READ_REPORT: 'finance:read:report',
  FINANCE_EXPORT_REPORT: 'finance:export:report',

  // OKR
  OKR_CREATE_OBJECTIVE: 'okr:create:objective',
  OKR_READ_OBJECTIVE: 'okr:read:objective',
  OKR_UPDATE_OBJECTIVE: 'okr:update:objective',
  OKR_DELETE_OBJECTIVE: 'okr:delete:objective',
  OKR_CREATE_KEYRESULT: 'okr:create:keyresult',
  OKR_READ_KEYRESULT: 'okr:read:keyresult',
  OKR_UPDATE_KEYRESULT: 'okr:update:keyresult',
  OKR_DELETE_KEYRESULT: 'okr:delete:keyresult',
  OKR_READ_KPI: 'okr:read:kpi',
  OKR_UPDATE_KPI: 'okr:update:kpi',
  OKR_CREATE_PROJECT: 'okr:create:project',
  OKR_READ_PROJECT: 'okr:read:project',
  OKR_UPDATE_PROJECT: 'okr:update:project',
  OKR_DELETE_PROJECT: 'okr:delete:project',
  OKR_CREATE_TASK: 'okr:create:task',
  OKR_READ_TASK: 'okr:read:task',
  OKR_UPDATE_TASK: 'okr:update:task',
  OKR_DELETE_TASK: 'okr:delete:task',
  OKR_ASSIGN_TASK: 'okr:assign:task',
  OKR_CREATE_TODO: 'okr:create:todo',
  OKR_READ_TODO: 'okr:read:todo',
  OKR_UPDATE_TODO: 'okr:update:todo',
  OKR_DELETE_TODO: 'okr:delete:todo',

  // Docs
  DOCS_CREATE_SPACE: 'docs:create:space',
  DOCS_READ_SPACE: 'docs:read:space',
  DOCS_UPDATE_SPACE: 'docs:update:space',
  DOCS_DELETE_SPACE: 'docs:delete:space',
  DOCS_CREATE_DOCUMENT: 'docs:create:document',
  DOCS_READ_DOCUMENT: 'docs:read:document',
  DOCS_UPDATE_DOCUMENT: 'docs:update:document',
  DOCS_DELETE_DOCUMENT: 'docs:delete:document',
  DOCS_EXPORT_DOCUMENT: 'docs:export:document',
  DOCS_CREATE_COMMENT: 'docs:create:comment',
  DOCS_READ_COMMENT: 'docs:read:comment',
  DOCS_DELETE_COMMENT: 'docs:delete:comment',

  // LMS
  LMS_CREATE_COURSE: 'lms:create:course',
  LMS_READ_COURSE: 'lms:read:course',
  LMS_UPDATE_COURSE: 'lms:update:course',
  LMS_DELETE_COURSE: 'lms:delete:course',
  LMS_APPROVE_COURSE: 'lms:approve:course',
  LMS_CREATE_CHAPTER: 'lms:create:chapter',
  LMS_READ_CHAPTER: 'lms:read:chapter',
  LMS_UPDATE_CHAPTER: 'lms:update:chapter',
  LMS_DELETE_CHAPTER: 'lms:delete:chapter',
  LMS_CREATE_QUIZ: 'lms:create:quiz',
  LMS_READ_QUIZ: 'lms:read:quiz',
  LMS_UPDATE_QUIZ: 'lms:update:quiz',
  LMS_CREATE_ASSIGNMENT: 'lms:create:assignment',
  LMS_READ_ASSIGNMENT: 'lms:read:assignment',
  LMS_READ_CERTIFICATE: 'lms:read:certificate',
  LMS_CREATE_CERTIFICATE: 'lms:create:certificate',

  // System
  SYSTEM_CREATE_ANNOUNCEMENT: 'system:create:announcement',
  SYSTEM_READ_ANNOUNCEMENT: 'system:read:announcement',
  SYSTEM_UPDATE_ANNOUNCEMENT: 'system:update:announcement',
  SYSTEM_DELETE_ANNOUNCEMENT: 'system:delete:announcement',
  SYSTEM_READ_NOTIFICATION: 'system:read:notification',
  SYSTEM_UPDATE_NOTIFICATION: 'system:update:notification',
  SYSTEM_READ_CONFIG: 'system:read:config',
  SYSTEM_UPDATE_CONFIG: 'system:update:config',
  SYSTEM_READ_AUDIT: 'system:read:audit',
  SYSTEM_EXPORT_AUDIT: 'system:export:audit',
  SYSTEM_CREATE_ATTACHMENT: 'system:create:attachment',
  SYSTEM_READ_ATTACHMENT: 'system:read:attachment',
  SYSTEM_DELETE_ATTACHMENT: 'system:delete:attachment',

  // Platform (HQ only)
  PLATFORM_CREATE_TENANT: 'platform:create:tenant',
  PLATFORM_READ_TENANT: 'platform:read:tenant',
  PLATFORM_UPDATE_TENANT: 'platform:update:tenant',
  PLATFORM_DELETE_TENANT: 'platform:delete:tenant',
  PLATFORM_CREATE_USER: 'platform:create:user',
  PLATFORM_READ_USER: 'platform:read:user',
  PLATFORM_UPDATE_USER: 'platform:update:user',
  PLATFORM_DELETE_USER: 'platform:delete:user',
  PLATFORM_CREATE_ROLE: 'platform:create:role',
  PLATFORM_READ_ROLE: 'platform:read:role',
  PLATFORM_UPDATE_ROLE: 'platform:update:role',
  PLATFORM_DELETE_ROLE: 'platform:delete:role',
  PLATFORM_READ_PERMISSION: 'platform:read:permission',
  PLATFORM_CREATE_DEPARTMENT: 'platform:create:department',
  PLATFORM_READ_DEPARTMENT: 'platform:read:department',
  PLATFORM_UPDATE_DEPARTMENT: 'platform:update:department',
  PLATFORM_DELETE_DEPARTMENT: 'platform:delete:department',
  PLATFORM_READ_DASHBOARD: 'platform:read:dashboard',
} as const

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// ---------- 权限模块分组（用于 UI 展示） ----------
export const PERMISSION_MODULES = {
  crm: { label: 'CRM 客户管理', icon: 'Users' },
  ordering: { label: '订货管理', icon: 'ShoppingCart' },
  inventory: { label: '库存管理', icon: 'Warehouse' },
  finance: { label: '财务管理', icon: 'DollarSign' },
  okr: { label: 'OKR 目标管理', icon: 'Target' },
  docs: { label: '文档管理', icon: 'BookOpen' },
  lms: { label: '培训管理', icon: 'GraduationCap' },
  system: { label: '系统管理', icon: 'Settings' },
  platform: { label: '平台管理', icon: 'Shield' },
} as const

// ---------- 默认角色权限矩阵 ----------
// 定义每个角色默认拥有的权限
export const DEFAULT_ROLE_PERMISSIONS: Record<string, { permissions: string[]; dataScope: string }[]> = {
  // platform_admin: 拥有所有权限 (代码中直接 bypass)
  // platform_viewer: 所有模块只读
  platform_viewer: [
    ...Object.values(PERMISSIONS)
      .filter((p) => p.includes(':read:') || p.includes(':export:'))
      .map((p) => ({ permissions: [p], dataScope: 'all' })),
  ],
  // tenant_admin: 租户内所有权限
  tenant_admin: [
    ...Object.values(PERMISSIONS)
      .filter((p) => !p.startsWith('platform:'))
      .map((p) => ({ permissions: [p], dataScope: 'all' })),
  ],
  // tenant_manager: 租户内大部分权限，无 delete 关键数据
  tenant_manager: [
    ...Object.values(PERMISSIONS)
      .filter((p) => !p.startsWith('platform:') && !p.includes(':delete:') && !p.includes(':approve:'))
      .map((p) => ({ permissions: [p], dataScope: 'all' })),
    // 可以删除自己创建的跟进记录和待办
    { permissions: [PERMISSIONS.CRM_DELETE_FOLLOWUP], dataScope: 'own' },
    { permissions: [PERMISSIONS.OKR_DELETE_TODO], dataScope: 'own' },
    { permissions: [PERMISSIONS.OKR_DELETE_TASK], dataScope: 'own' },
  ],
  // tenant_user: 基本读写权限
  tenant_user: [
    // CRM: 读全部，写自己的
    { permissions: [PERMISSIONS.CRM_READ_CUSTOMER, PERMISSIONS.CRM_READ_CONTACT, PERMISSIONS.CRM_READ_OPPORTUNITY, PERMISSIONS.CRM_READ_CONTRACT, PERMISSIONS.CRM_READ_WORKORDER, PERMISSIONS.CRM_READ_FOLLOWUP], dataScope: 'all' },
    { permissions: [PERMISSIONS.CRM_CREATE_CUSTOMER, PERMISSIONS.CRM_UPDATE_CUSTOMER], dataScope: 'own' },
    { permissions: [PERMISSIONS.CRM_CREATE_CONTACT, PERMISSIONS.CRM_UPDATE_CONTACT], dataScope: 'own' },
    { permissions: [PERMISSIONS.CRM_CREATE_OPPORTUNITY, PERMISSIONS.CRM_UPDATE_OPPORTUNITY], dataScope: 'own' },
    { permissions: [PERMISSIONS.CRM_CREATE_FOLLOWUP, PERMISSIONS.CRM_UPDATE_FOLLOWUP, PERMISSIONS.CRM_DELETE_FOLLOWUP], dataScope: 'own' },
    { permissions: [PERMISSIONS.CRM_CREATE_WORKORDER], dataScope: 'own' },
    // Ordering: 购物车和下单
    { permissions: [PERMISSIONS.ORDERING_READ_CATALOG, PERMISSIONS.ORDERING_READ_CART, PERMISSIONS.ORDERING_CREATE_CART, PERMISSIONS.ORDERING_UPDATE_CART, PERMISSIONS.ORDERING_DELETE_CART, PERMISSIONS.ORDERING_CREATE_ORDER, PERMISSIONS.ORDERING_READ_ORDER, PERMISSIONS.ORDERING_READ_ACCOUNT], dataScope: 'own' },
    // OKR: 读全部，写自己的
    { permissions: [PERMISSIONS.OKR_READ_OBJECTIVE, PERMISSIONS.OKR_READ_KEYRESULT, PERMISSIONS.OKR_READ_KPI, PERMISSIONS.OKR_READ_PROJECT, PERMISSIONS.OKR_READ_TASK, PERMISSIONS.OKR_READ_TODO], dataScope: 'all' },
    { permissions: [PERMISSIONS.OKR_CREATE_TODO, PERMISSIONS.OKR_UPDATE_TODO, PERMISSIONS.OKR_DELETE_TODO], dataScope: 'own' },
    { permissions: [PERMISSIONS.OKR_UPDATE_TASK], dataScope: 'own' },
    // Docs: 读和评论
    { permissions: [PERMISSIONS.DOCS_READ_SPACE, PERMISSIONS.DOCS_READ_DOCUMENT, PERMISSIONS.DOCS_CREATE_DOCUMENT, PERMISSIONS.DOCS_UPDATE_DOCUMENT, PERMISSIONS.DOCS_READ_COMMENT, PERMISSIONS.DOCS_CREATE_COMMENT], dataScope: 'own' },
    // LMS: 学习
    { permissions: [PERMISSIONS.LMS_READ_COURSE, PERMISSIONS.LMS_READ_CHAPTER, PERMISSIONS.LMS_READ_QUIZ, PERMISSIONS.LMS_READ_CERTIFICATE], dataScope: 'all' },
    // System: 通知
    { permissions: [PERMISSIONS.SYSTEM_READ_NOTIFICATION, PERMISSIONS.SYSTEM_UPDATE_NOTIFICATION, PERMISSIONS.SYSTEM_READ_ANNOUNCEMENT], dataScope: 'own' },
  ],
}

// ---------- 租户状态 ----------
export const TENANT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
} as const

// ---------- 用户状态 ----------
export const USER_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  LOCKED: 'locked',
} as const

// ---------- 客户 ----------
export const CUSTOMER_TYPE = {
  COMPANY: 'company',
  INDIVIDUAL: 'individual',
} as const

export const CUSTOMER_LEVEL = {
  VIP: 'vip',
  IMPORTANT: 'important',
  NORMAL: 'normal',
  POTENTIAL: 'potential',
} as const

export const CUSTOMER_SOURCE = {
  WEBSITE: 'website',
  REFERRAL: 'referral',
  EXHIBITION: 'exhibition',
  COLD_CALL: 'cold_call',
  AD: 'ad',
} as const

// ---------- 商机阶段 ----------
export const OPPORTUNITY_STAGE = {
  LEAD: 'lead',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
} as const

// ---------- 合同状态 ----------
export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  TERMINATED: 'terminated',
} as const

// ---------- 工单 ----------
export const WORKORDER_TYPE = {
  INSTALL: 'install',
  REPAIR: 'repair',
  MAINTAIN: 'maintain',
  INSPECT: 'inspect',
} as const

export const WORKORDER_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

// ---------- 订单状态 ----------
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

// ---------- 物流状态 ----------
export const SHIPMENT_STATUS = {
  PENDING: 'pending',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  RECEIVED: 'received',
} as const

// ---------- 库存 ----------
export const SN_STATUS = {
  IN_STOCK: 'in_stock',
  ALLOCATED: 'allocated',
  SHIPPED: 'shipped',
  INSTALLED: 'installed',
  RETURNED: 'returned',
  SCRAPPED: 'scrapped',
} as const

export const PRODUCT_CATEGORY = {
  CURTAIN: 'curtain',
  LOCK: 'lock',
  LIGHT: 'light',
  SENSOR: 'sensor',
  GATEWAY: 'gateway',
  PANEL: 'panel',
  OTHER: 'other',
} as const

// ---------- 财务 ----------
export const PAYMENT_METHOD = {
  CASH: 'cash',
  TRANSFER: 'transfer',
  CHECK: 'check',
  CREDIT_CARD: 'credit_card',
  ONLINE: 'online',
} as const

export const INVOICE_TYPE = {
  ISSUED: 'issued',
  RECEIVED: 'received',
} as const

// ---------- OKR ----------
export const OKR_STATUS = {
  ON_TRACK: 'on_track',
  AT_RISK: 'at_risk',
  BEHIND: 'behind',
  COMPLETED: 'completed',
} as const

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const

// ---------- 文档 ----------
export const DOC_VISIBILITY = {
  PRIVATE: 'private',
  TEAM: 'team',
  DEPARTMENT: 'department',
  PUBLIC: 'public',
} as const

export const DOC_PERMISSION_LEVEL = {
  VIEW: 'view',
  COMMENT: 'comment',
  EDIT: 'edit',
  ADMIN: 'admin',
} as const

// ---------- 课程 ----------
export const COURSE_STATUS = {
  DRAFT: 'draft',
  REVIEW: 'review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

// ---------- 通知类型 ----------
export const NOTIFICATION_TYPE = {
  SYSTEM: 'system',
  ORDER: 'order',
  STOCK: 'stock',
  WORKORDER: 'workorder',
  TASK: 'task',
  APPROVAL: 'approval',
  CHAT: 'chat',
} as const

// ---------- 公告类型 ----------
export const ANNOUNCEMENT_TYPE = {
  INFO: 'info',
  WARNING: 'warning',
  URGENT: 'urgent',
  MAINTENANCE: 'maintenance',
} as const

// ---------- 审计操作 ----------
export const AUDIT_ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  APPROVE: 'approve',
} as const

// ---------- 模块列表 ----------
export const MODULES = {
  AUTH: 'auth',
  CRM: 'crm',
  ORDERING: 'ordering',
  INVENTORY: 'inventory',
  FINANCE: 'finance',
  OKR: 'okr',
  DOCS: 'docs',
  LMS: 'lms',
  SYSTEM: 'system',
  PLATFORM: 'platform',
} as const

// ---------- 币种 ----------
export const CURRENCIES = {
  TWD: { code: 'TWD', symbol: 'NT$', name: '新台币' },
  CNY: { code: 'CNY', symbol: '¥', name: '人民币' },
  USD: { code: 'USD', symbol: '$', name: '美元' },
} as const

// ---------- 分页默认值 ----------
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100,
} as const

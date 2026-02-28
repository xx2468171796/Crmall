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

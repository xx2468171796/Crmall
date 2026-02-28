// ============================================
// TWCRM 全局设计系统 — 设计令牌 (Design Tokens)
// 统一颜色、间距、圆角、阴影、动画
// ============================================

/**
 * 品牌色系 — Zinc 主题 (Shadcn UI 默认)
 * 所有页面、组件必须使用这套色系，禁止自定义颜色
 */
export const colors = {
  // 品牌主色
  brand: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // 功能色 — 状态指示
  status: {
    success: { light: '#dcfce7', DEFAULT: '#22c55e', dark: '#15803d' },
    warning: { light: '#fef9c3', DEFAULT: '#eab308', dark: '#a16207' },
    error: { light: '#fee2e2', DEFAULT: '#ef4444', dark: '#b91c1c' },
    info: { light: '#dbeafe', DEFAULT: '#3b82f6', dark: '#1d4ed8' },
  },

  // 业务模块色 — 每个模块有专属强调色
  module: {
    crm: '#3b82f6',       // 蓝色 — 客户/商机
    ordering: '#8b5cf6',  // 紫色 — 订货
    inventory: '#f59e0b', // 琥珀 — 库存
    finance: '#10b981',   // 绿色 — 财务
    okr: '#f97316',       // 橙色 — OKR
    docs: '#6366f1',      // 靛蓝 — 文档
    lms: '#ec4899',       // 粉色 — 培训
    platform: '#14b8a6',  // 青色 — 总部管理
  },

  // 订单状态色
  orderStatus: {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipped: '#6366f1',
    delivered: '#10b981',
    completed: '#22c55e',
    cancelled: '#ef4444',
    refunded: '#f97316',
  },

  // 优先级色
  priority: {
    low: '#a1a1aa',
    normal: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
  },

  // 客户等级色
  customerLevel: {
    vip: '#f59e0b',
    important: '#8b5cf6',
    normal: '#3b82f6',
    potential: '#a1a1aa',
  },
} as const

/**
 * 间距系统 (基于 4px 网格)
 */
export const spacing = {
  page: {
    padding: '1.5rem',       // 页面内边距
    paddingMobile: '1rem',
  },
  card: {
    padding: '1.5rem',       // 卡片内边距
    gap: '1rem',             // 卡片间距
  },
  section: {
    gap: '2rem',             // 区块间距
  },
  form: {
    gap: '1rem',             // 表单项间距
    labelGap: '0.5rem',      // 标签与输入框间距
  },
  table: {
    cellPadding: '0.75rem',  // 表格单元格内边距
  },
} as const

/**
 * 圆角
 */
export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const

/**
 * 阴影
 */
export const shadows = {
  card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  dropdown: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

/**
 * 字体大小
 */
export const fontSize = {
  xs: '0.75rem',     // 12px — 辅助文字
  sm: '0.875rem',    // 14px — 正文小
  base: '1rem',      // 16px — 正文
  lg: '1.125rem',    // 18px — 小标题
  xl: '1.25rem',     // 20px — 标题
  '2xl': '1.5rem',   // 24px — 页面标题
  '3xl': '1.875rem', // 30px — 大标题
  '4xl': '2.25rem',  // 36px — 大屏数字
} as const

/**
 * 动画时长
 */
export const animation = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const

/**
 * 断点 (与 Tailwind 一致)
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Z-Index 层级管理
 */
export const zIndex = {
  dropdown: 50,
  sticky: 100,
  overlay: 200,
  modal: 300,
  popover: 400,
  toast: 500,
  tooltip: 600,
} as const

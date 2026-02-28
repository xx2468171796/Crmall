// ============================================
// 全局布局常量
// 统一侧边栏、头部、内容区尺寸
// ============================================

/**
 * 布局尺寸 — 所有页面必须遵循
 */
export const layout = {
  sidebar: {
    width: 280,           // 侧边栏展开宽度 px
    collapsedWidth: 68,   // 侧边栏收起宽度 px
    mobileBreakpoint: 768, // 移动端断点
  },
  header: {
    height: 56,           // 顶部导航高度 px
  },
  content: {
    maxWidth: 1440,       // 内容区最大宽度 px
    padding: 24,          // 内容区内边距 px
    paddingMobile: 16,
  },
  table: {
    rowHeight: 48,        // 表格行高 px
    headerHeight: 44,     // 表格头高 px
  },
  modal: {
    sm: 400,
    md: 560,
    lg: 720,
    xl: 960,
    full: '90vw',
  },
} as const

/**
 * 导航配置 — 侧边栏菜单结构
 * permission 字段用于 RBAC 控制菜单可见性
 */
export const navConfig = {
  main: [
    {
      title: 'nav.dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      permission: null, // 所有人可见
    },
    {
      title: 'nav.crm',
      icon: 'Users',
      children: [
        { title: 'nav.customers', href: '/customers', icon: 'Building2', permission: 'crm:read:customer' },
        { title: 'nav.opportunities', href: '/opportunities', icon: 'TrendingUp', permission: 'crm:read:opportunity' },
        { title: 'nav.contracts', href: '/contracts', icon: 'FileText', permission: 'crm:read:contract' },
        { title: 'nav.workorders', href: '/workorders', icon: 'Wrench', permission: 'crm:read:workorder' },
      ],
    },
    {
      title: 'nav.ordering',
      icon: 'ShoppingCart',
      children: [
        { title: 'nav.catalog', href: '/ordering', icon: 'Package', permission: 'ordering:read:catalog' },
        { title: 'nav.cart', href: '/ordering/cart', icon: 'ShoppingBag', permission: 'ordering:read:cart' },
        { title: 'nav.orders', href: '/ordering/orders', icon: 'ClipboardList', permission: 'ordering:read:order' },
        { title: 'nav.account', href: '/ordering/account', icon: 'Wallet', permission: 'ordering:read:account' },
      ],
    },
    {
      title: 'nav.inventory',
      icon: 'Warehouse',
      children: [
        { title: 'nav.products', href: '/inventory/products', icon: 'Box', permission: 'inventory:read:product' },
        { title: 'nav.stock', href: '/inventory/stock', icon: 'BarChart3', permission: 'inventory:read:stock' },
        { title: 'nav.purchase', href: '/inventory/purchase', icon: 'Truck', permission: 'inventory:read:purchase' },
        { title: 'nav.transfer', href: '/inventory/transfer', icon: 'ArrowLeftRight', permission: 'inventory:read:transfer' },
      ],
    },
    {
      title: 'nav.finance',
      icon: 'DollarSign',
      children: [
        { title: 'nav.payments', href: '/finance/payments', icon: 'CreditCard', permission: 'finance:read:payment' },
        { title: 'nav.disbursements', href: '/finance/disbursements', icon: 'Send', permission: 'finance:read:disbursement' },
        { title: 'nav.invoices', href: '/finance/invoices', icon: 'Receipt', permission: 'finance:read:invoice' },
      ],
    },
    {
      title: 'nav.okr',
      icon: 'Target',
      children: [
        { title: 'nav.objectives', href: '/okr/objectives', icon: 'Flag', permission: 'okr:read:objective' },
        { title: 'nav.projects', href: '/okr/projects', icon: 'FolderKanban', permission: 'okr:read:project' },
        { title: 'nav.tasks', href: '/okr/tasks', icon: 'CheckSquare', permission: 'okr:read:task' },
        { title: 'nav.todos', href: '/okr/todos', icon: 'ListTodo', permission: 'okr:read:todo' },
      ],
    },
    {
      title: 'nav.docs',
      href: '/docs',
      icon: 'BookOpen',
      permission: 'docs:read:document',
    },
    {
      title: 'nav.learning',
      icon: 'GraduationCap',
      children: [
        { title: 'nav.courses', href: '/learning/courses', icon: 'Video', permission: 'lms:read:course' },
        { title: 'nav.my_learning', href: '/learning/my', icon: 'BookMarked', permission: null },
        { title: 'nav.certificates', href: '/learning/certificates', icon: 'Award', permission: null },
      ],
    },
  ],
  platform: [
    {
      title: 'nav.platform',
      icon: 'Shield',
      children: [
        { title: 'nav.platform_dashboard', href: '/platform/dashboard', icon: 'Monitor', permission: 'platform:read:dashboard' },
        { title: 'nav.tenants', href: '/platform/tenants', icon: 'Building', permission: 'platform:read:tenant' },
        { title: 'nav.users', href: '/platform/users', icon: 'UserCog', permission: 'platform:read:user' },
        { title: 'nav.roles', href: '/platform/roles', icon: 'Key', permission: 'platform:read:role' },
        { title: 'nav.announcements', href: '/platform/announcements', icon: 'Megaphone', permission: 'system:read:announcement' },
        { title: 'nav.platform_orders', href: '/platform/orders', icon: 'ClipboardList', permission: 'ordering:read:order' },
        { title: 'nav.platform_products', href: '/platform/products', icon: 'Package', permission: 'ordering:read:catalog' },
        { title: 'nav.platform_pricing', href: '/platform/pricing', icon: 'Tag', permission: 'ordering:read:price' },
        { title: 'nav.platform_accounts', href: '/platform/accounts', icon: 'Wallet', permission: 'ordering:read:account' },
        { title: 'nav.audit_logs', href: '/platform/audit', icon: 'ScrollText', permission: 'system:read:audit' },
      ],
    },
  ],
  settings: [
    { title: 'nav.settings', href: '/settings', icon: 'Settings', permission: null },
    { title: 'nav.profile', href: '/settings/profile', icon: 'User', permission: null },
  ],
} as const

// ============================================
// 数据库 Seed — 初始化基础数据
// ============================================

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client'
import { PERMISSIONS } from '@twcrm/shared'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 开始初始化数据...')

  // 1. 创建系统角色 (tenantId=null 表示系统角色)
  // 注意: Prisma compound unique (tenantId, name) 不支持 null 作为 findUnique/upsert 参数
  // 因此使用 findFirst + create 模式
  const systemRoleDefs = [
    { name: 'platform_admin', displayName: '总部超级管理员', description: '拥有所有权限，可查看所有租户数据', level: 0 },
    { name: 'platform_viewer', displayName: '总部查看者', description: '只读权限，用于大屏展示', level: 1 },
    { name: 'tenant_admin', displayName: '子公司管理员', description: '子公司最高权限', level: 10 },
    { name: 'tenant_manager', displayName: '子公司经理', description: '子公司管理权限', level: 20 },
    { name: 'tenant_user', displayName: '子公司员工', description: '子公司普通员工', level: 30 },
  ]
  const roles = []
  for (const def of systemRoleDefs) {
    const existing = await prisma.role.findFirst({ where: { tenantId: null, name: def.name } })
    if (existing) {
      roles.push(existing)
    } else {
      const created = await prisma.role.create({
        data: { ...def, isSystem: true },
      })
      roles.push(created)
    }
  }
  console.log(`✅ 创建 ${roles.length} 个系统角色`)

  // 2. 创建总部租户
  const hq = await prisma.tenant.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      name: '总部',
      code: 'HQ',
      timezone: 'Asia/Taipei',
      currency: 'TWD',
      status: 'active',
    },
  })
  console.log(`✅ 创建总部租户: ${hq.name} (${hq.code})`)

  // 3. 创建示例子公司
  const subsidiaries = await Promise.all([
    prisma.tenant.upsert({
      where: { code: 'TW-TPE' },
      update: {},
      create: {
        name: '台北分部',
        code: 'TW-TPE',
        parentId: hq.id,
        timezone: 'Asia/Taipei',
        currency: 'TWD',
      },
    }),
    prisma.tenant.upsert({
      where: { code: 'TW-TXG' },
      update: {},
      create: {
        name: '台中分部',
        code: 'TW-TXG',
        parentId: hq.id,
        timezone: 'Asia/Taipei',
        currency: 'TWD',
      },
    }),
    prisma.tenant.upsert({
      where: { code: 'TW-KHH' },
      update: {},
      create: {
        name: '高雄分部',
        code: 'TW-KHH',
        parentId: hq.id,
        timezone: 'Asia/Taipei',
        currency: 'TWD',
      },
    }),
  ])
  console.log(`✅ 创建 ${subsidiaries.length} 个子公司`)

  // 4. 创建超级管理员
  const passwordHash = process.env.SEED_PASSWORD_HASH
    ?? '$2b$10$.PwLX5.FFSESHa6P60fXGen82v/7Gbo8eYGdG7JhgvLKpe5pLsAva'
  const admin = await prisma.user.upsert({
    where: { email: 'admin@twcrm.com' },
    update: { passwordHash },
    create: {
      tenantId: hq.id,
      email: 'admin@twcrm.com',
      name: '系统管理员',
      passwordHash,
      locale: 'zh-TW',
      status: 'active',
    },
  })

  // 分配 platform_admin 角色
  const platformAdminRole = roles[0]
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: admin.id, roleId: platformAdminRole.id },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: platformAdminRole.id,
    },
  })
  console.log(`✅ 创建超级管理员: ${admin.email}`)

  // 4.1 创建子公司测试用户
  const tenantAdminRole = roles[2]
  const tenantUserRole = roles[4]

  const tpeAdmin = await prisma.user.upsert({
    where: { email: 'tpe_admin' },
    update: { passwordHash },
    create: {
      tenantId: subsidiaries[0].id,
      email: 'tpe_admin',
      name: '台北管理员',
      passwordHash,
      locale: 'zh-TW',
      status: 'active',
    },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: tpeAdmin.id, roleId: tenantAdminRole.id } },
    update: {},
    create: { userId: tpeAdmin.id, roleId: tenantAdminRole.id },
  })

  const tpeUser = await prisma.user.upsert({
    where: { email: 'tpe_user' },
    update: { passwordHash },
    create: {
      tenantId: subsidiaries[0].id,
      email: 'tpe_user',
      name: '台北员工',
      passwordHash,
      locale: 'zh-TW',
      status: 'active',
    },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: tpeUser.id, roleId: tenantUserRole.id } },
    update: {},
    create: { userId: tpeUser.id, roleId: tenantUserRole.id },
  })
  console.log(`✅ 创建子公司测试用户: tpe_admin, tpe_user`)

  // 5. 创建基础权限（仅创建 PERMISSIONS 常量中定义的有意义权限）
  const permValues = Object.values(PERMISSIONS)
  let permCount = 0
  for (const code of permValues) {
    const [module, action, resource] = code.split(':')
    await prisma.permission.upsert({
      where: {
        module_action_resource: { module, action, resource },
      },
      update: {},
      create: { module, action, resource, description: `${module}:${action}:${resource}` },
    })
    permCount++
  }
  console.log(`✅ 创建 ${permCount} 个权限（基于 PERMISSIONS 常量）`)

  // 6. 给 platform_admin 分配所有权限
  const allPerms = await prisma.permission.findMany()
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: platformAdminRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: platformAdminRole.id, permissionId: perm.id, dataScope: 'all' },
    })
  }
  console.log(`✅ 为 platform_admin 分配 ${allPerms.length} 个权限`)

  // 6.1 给 platform_viewer 分配只读权限
  const readPerms = allPerms.filter((p) => p.action === 'read' || p.action === 'export')
  const platformViewerRole = roles[1]
  for (const perm of readPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: platformViewerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: platformViewerRole.id, permissionId: perm.id, dataScope: 'all' },
    })
  }
  console.log(`✅ 为 platform_viewer 分配 ${readPerms.length} 个只读权限`)

  // 6.2 给 tenant_admin 分配非平台权限
  const tenantPerms = allPerms.filter((p) => p.module !== 'platform')
  for (const perm of tenantPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: tenantAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: tenantAdminRole.id, permissionId: perm.id, dataScope: 'all' },
    })
  }
  console.log(`✅ 为 tenant_admin 分配 ${tenantPerms.length} 个权限`)

  // 6.3 给 tenant_manager 分配管理权限（排除 delete 关键资源 + 排除 platform）
  const tenantManagerRole = roles[3]
  const criticalResources = ['tenant', 'user', 'role', 'permission', 'department', 'warehouse', 'customer', 'contract']
  const managerPerms = allPerms.filter((p) => {
    if (p.module === 'platform') return false
    if (p.action === 'delete' && criticalResources.includes(p.resource)) return false
    return true
  })
  for (const perm of managerPerms) {
    const scope = (perm.action === 'delete' || perm.action === 'assign') ? 'own' : 'all'
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: tenantManagerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: tenantManagerRole.id, permissionId: perm.id, dataScope: scope },
    })
  }
  console.log(`✅ 为 tenant_manager 分配 ${managerPerms.length} 个权限`)

  // 6.4 给 tenant_user 分配基本权限
  const userAllowedActions: Record<string, string[]> = {
    crm: ['read', 'create', 'update'],
    ordering: ['read', 'create', 'update'],
    inventory: ['read'],
    finance: ['read'],
    okr: ['read', 'create', 'update'],
    docs: ['read', 'create', 'update'],
    lms: ['read'],
    system: ['read', 'update'],
  }
  const userPerms = allPerms.filter((p) => {
    const allowed = userAllowedActions[p.module]
    if (!allowed) return false
    return allowed.includes(p.action)
  })
  for (const perm of userPerms) {
    const scope = (perm.action === 'create' || perm.action === 'update') ? 'own' : 'all'
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: tenantUserRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: tenantUserRole.id, permissionId: perm.id, dataScope: scope },
    })
  }
  console.log(`✅ 为 tenant_user 分配 ${userPerms.length} 个权限`)

  // 7. 创建子公司余额账户
  for (const sub of subsidiaries) {
    await prisma.tenantAccount.upsert({
      where: { tenantId: sub.id },
      update: {},
      create: {
        tenantId: sub.id,
        balance: 0,
        creditLimit: 0,
        currency: 'TWD',
      },
    })
  }
  console.log(`✅ 创建 ${subsidiaries.length} 个子公司余额账户`)

  // 8. 创建系统配置（按 configurable.md 规则完整覆盖）
  const configs = [
    // ---- general ----
    { group: 'general', key: 'app_name', value: '"TWCRM 台湾智能家居 CRM"', label: '系统名称' },
    { group: 'general', key: 'app_logo', value: '"/logo.svg"', label: '系统 Logo' },
    { group: 'general', key: 'default_locale', value: '"zh-TW"', label: '默认语言' },
    { group: 'general', key: 'supported_locales', value: '["zh-CN","zh-TW","en"]', label: '支持语言' },
    { group: 'general', key: 'date_format', value: '"YYYY-MM-DD"', label: '日期格式' },
    { group: 'general', key: 'timezone', value: '"Asia/Taipei"', label: '默认时区' },

    // ---- theme ----
    { group: 'theme', key: 'primary_color', value: '"zinc"', label: '主题色' },
    { group: 'theme', key: 'border_radius', value: '"0.5rem"', label: '圆角大小' },
    { group: 'theme', key: 'logo_url', value: '""', label: 'Logo URL' },
    { group: 'theme', key: 'sidebar_style', value: '"default"', label: '侧边栏风格' },

    // ---- ordering ----
    { group: 'ordering', key: 'auto_confirm_order', value: 'false', label: '订单自动确认' },
    { group: 'ordering', key: 'default_currency', value: '"TWD"', label: '默认币种' },
    { group: 'ordering', key: 'min_order_amount', value: '0', label: '最低订单金额' },
    { group: 'ordering', key: 'allow_credit_order', value: 'false', label: '允许信用下单' },
    { group: 'ordering', key: 'order_expire_hours', value: '72', label: '订单过期时间(小时)' },
    { group: 'ordering', key: 'shipping_carriers', value: '["顺丰","黑猫","新竹货运"]', label: '物流公司' },
    { group: 'ordering', key: 'payment_methods', value: '["balance","bank_transfer"]', label: '支付方式' },

    // ---- crm ----
    { group: 'crm', key: 'opportunity_stages', value: '["lead","qualified","proposal","negotiation","won","lost"]', label: '商机阶段' },
    { group: 'crm', key: 'customer_levels', value: '["vip","gold","silver","normal"]', label: '客户等级' },
    { group: 'crm', key: 'customer_sources', value: '["referral","website","exhibition","cold_call"]', label: '客户来源' },
    { group: 'crm', key: 'workorder_types', value: '["install","repair","maintain","inspect"]', label: '工单类型' },
    { group: 'crm', key: 'follow_up_types', value: '["call","visit","email","wechat","line"]', label: '跟进类型' },

    // ---- inventory ----
    { group: 'inventory', key: 'low_stock_threshold', value: '10', label: '低库存预警阈值' },
    { group: 'inventory', key: 'enable_sn_tracking', value: 'true', label: '启用 SN 码追踪' },
    { group: 'inventory', key: 'auto_deduct_on_install', value: 'true', label: '安装完成自动扣库存' },

    // ---- notification ----
    { group: 'notification', key: 'email_enabled', value: 'false', label: '邮件通知' },
    { group: 'notification', key: 'ws_enabled', value: 'true', label: 'WebSocket 通知' },
    { group: 'notification', key: 'digest_interval', value: '60', label: '通知摘要间隔(分钟)' },
  ]
  for (const cfg of configs) {
    const existingCfg = await prisma.systemConfig.findFirst({
      where: { tenantId: null, group: cfg.group, key: cfg.key },
    })
    if (existingCfg) {
      await prisma.systemConfig.update({
        where: { id: existingCfg.id },
        data: { value: cfg.value },
      })
    } else {
      await prisma.systemConfig.create({
        data: { tenantId: null, group: cfg.group, key: cfg.key, value: cfg.value, label: cfg.label },
      })
    }
  }
  console.log(`✅ 创建 ${configs.length} 个系统配置`)

  // 9. 创建产品分类（订货系统）
  const categories = [
    { name: '智能窗帘', slug: 'curtain', icon: '🪟' },
    { name: '智能门锁', slug: 'lock', icon: '🔐' },
    { name: '智能灯光', slug: 'light', icon: '💡' },
    { name: '传感器', slug: 'sensor', icon: '📡' },
    { name: '网关/中控', slug: 'gateway', icon: '🖥️' },
    { name: '智能面板', slug: 'panel', icon: '🎛️' },
    { name: '配件', slug: 'accessory', icon: '🔧' },
  ]
  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, sortOrder: categories.indexOf(cat) },
    })
  }
  console.log(`✅ 创建 ${categories.length} 个产品分类`)

  // 10. 创建课程分类（LMS）
  const courseCategories = [
    { name: '产品培训', slug: 'product' },
    { name: '安装技术', slug: 'service' },
    { name: '销售技巧', slug: 'sales' },
    { name: '合规制度', slug: 'compliance' },
  ]
  for (const cat of courseCategories) {
    await prisma.courseCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, sortOrder: courseCategories.indexOf(cat) },
    })
  }
  console.log(`✅ 创建 ${courseCategories.length} 个课程分类`)

  console.log('\n🎉 数据初始化完成！')
}

main()
  .catch((e) => {
    console.error('❌ Seed 失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// ============================================
// 数据库 Seed — 初始化基础数据
// ============================================

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 开始初始化数据...')

  // 1. 创建系统角色
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'platform_admin' },
      update: {},
      create: {
        name: 'platform_admin',
        displayName: '总部超级管理员',
        description: '拥有所有权限，可查看所有租户数据',
        level: 0,
        isSystem: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'platform_viewer' },
      update: {},
      create: {
        name: 'platform_viewer',
        displayName: '总部查看者',
        description: '只读权限，用于大屏展示',
        level: 1,
        isSystem: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'tenant_admin' },
      update: {},
      create: {
        name: 'tenant_admin',
        displayName: '子公司管理员',
        description: '子公司最高权限',
        level: 10,
        isSystem: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'tenant_manager' },
      update: {},
      create: {
        name: 'tenant_manager',
        displayName: '子公司经理',
        description: '子公司管理权限',
        level: 20,
        isSystem: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'tenant_user' },
      update: {},
      create: {
        name: 'tenant_user',
        displayName: '子公司员工',
        description: '子公司普通员工',
        level: 30,
        isSystem: true,
      },
    }),
  ])
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
      locale: 'zh-CN',
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

  // 5. 创建基础权限
  const modules = ['crm', 'ordering', 'inventory', 'finance', 'okr', 'docs', 'lms', 'system', 'platform']
  const actions = ['create', 'read', 'update', 'delete', 'export', 'approve', 'assign']
  const resources: Record<string, string[]> = {
    crm: ['customer', 'contact', 'opportunity', 'contract', 'workorder', 'followup'],
    ordering: ['catalog', 'order', 'price', 'account', 'shipment', 'cart'],
    inventory: ['warehouse', 'product', 'stock', 'sn', 'purchase', 'transfer', 'supplier'],
    finance: ['payment', 'disbursement', 'invoice', 'expense', 'report'],
    okr: ['objective', 'keyresult', 'kpi', 'project', 'task', 'todo'],
    docs: ['space', 'document', 'comment'],
    lms: ['course', 'chapter', 'quiz', 'assignment', 'certificate'],
    system: ['announcement', 'notification', 'config', 'audit', 'attachment'],
    platform: ['tenant', 'user', 'role', 'permission', 'department', 'dashboard'],
  }

  let permCount = 0
  for (const mod of modules) {
    const modResources = resources[mod] || []
    for (const resource of modResources) {
      for (const action of actions) {
        await prisma.permission.upsert({
          where: {
            module_action_resource: { module: mod, action, resource },
          },
          update: {},
          create: { module: mod, action, resource, description: `${mod}.${resource}.${action}` },
        })
        permCount++
      }
    }
  }
  console.log(`✅ 创建 ${permCount} 个权限`)

  // 6. 给 platform_admin 分配所有权限
  const allPerms = await prisma.permission.findMany()
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: platformAdminRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: platformAdminRole.id, permissionId: perm.id },
    })
  }
  console.log(`✅ 为 platform_admin 分配 ${allPerms.length} 个权限`)

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
    { group: 'general', key: 'default_locale', value: '"zh-CN"', label: '默认语言' },
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
    await prisma.systemConfig.upsert({
      where: {
        tenantId_group_key: { tenantId: '', group: cfg.group, key: cfg.key },
      },
      update: { value: cfg.value },
      create: { tenantId: null, group: cfg.group, key: cfg.key, value: cfg.value, label: cfg.label },
    })
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

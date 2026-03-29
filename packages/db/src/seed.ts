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
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      tenantId: hq.id,
      username: 'admin',
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
  console.log(`✅ 创建超级管理员: ${admin.username}`)

  // 4.1 创建子公司测试用户
  const tenantAdminRole = roles[2]
  const tenantUserRole = roles[4]

  const tpeAdmin = await prisma.user.upsert({
    where: { username: 'tpe_admin' },
    update: { passwordHash },
    create: {
      tenantId: subsidiaries[0].id,
      username: 'tpe_admin',
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
    where: { username: 'tpe_user' },
    update: { passwordHash },
    create: {
      tenantId: subsidiaries[0].id,
      username: 'tpe_user',
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

  // 10. 创建仓库（总仓 + 子公司仓库）
  const warehouseDefs = [
    { name: '总部主仓', code: 'WH-HQ', tenantId: null, isMain: true, address: '台北市内湖区' },
    { name: '台北仓库', code: 'WH-TPE', tenantId: subsidiaries[0].id, isMain: false, address: '台北市南港区' },
    { name: '台中仓库', code: 'WH-TXG', tenantId: subsidiaries[1].id, isMain: false, address: '台中市西屯区' },
    { name: '高雄仓库', code: 'WH-KHH', tenantId: subsidiaries[2].id, isMain: false, address: '高雄市前镇区' },
  ]
  const warehouses: Record<string, string> = {}
  for (const wh of warehouseDefs) {
    const warehouse = await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: {},
      create: wh,
    })
    warehouses[wh.code] = warehouse.id
  }
  console.log(`✅ 创建 ${warehouseDefs.length} 个仓库`)

  // 11. 创建供应商
  const supplierDefs = [
    { name: 'Aqara 绿米联创', contact: '张经理', phone: '+86-755-12345678', email: 'sales@aqara.com' },
    { name: '易来智能 Yeelight', contact: '李经理', phone: '+86-755-87654321', email: 'sales@yeelight.com' },
  ]
  const suppliers: Record<string, string> = {}
  for (const sup of supplierDefs) {
    const existing = await prisma.supplier.findFirst({ where: { name: sup.name } })
    if (existing) {
      suppliers[sup.name] = existing.id
    } else {
      const created = await prisma.supplier.create({ data: sup })
      suppliers[sup.name] = created.id
    }
  }
  console.log(`✅ 创建 ${supplierDefs.length} 个供应商`)

  // 12. 创建 SPU 产品 + SKU 变体
  // 清除旧的变体/库存相关数据（确保重复运行安全）
  await prisma.stockMovement.deleteMany({})
  await prisma.stock.deleteMany({})
  await prisma.snCode.deleteMany({})
  await prisma.cartItem.deleteMany({})
  await prisma.variantAttributeValue.deleteMany({})
  await prisma.productVariant.deleteMany({})
  await prisma.productAttributeValue.deleteMany({})
  await prisma.productAttribute.deleteMany({})
  await prisma.tenantPrice.deleteMany({})
  await prisma.catalogProduct.deleteMany({})

  const allCategories = await prisma.productCategory.findMany()
  const catMap = Object.fromEntries(allCategories.map(c => [c.slug, c.id]))

  const spuProducts = [
    { sku: 'AQ-B1', name: 'Aqara 智能窗帘电机 B1', brand: 'Aqara', category: 'curtain', basePrice: 2899, unit: '台', description: '静音设计，支持 Zigbee/WiFi' },
    { sku: 'AQ-E1', name: 'Aqara 智能窗帘电机 E1', brand: 'Aqara', category: 'curtain', basePrice: 1999, unit: '台', description: '入门级窗帘电机' },
    { sku: 'AQ-RB-E1', name: 'Aqara 卷帘电机 E1', brand: 'Aqara', category: 'curtain', basePrice: 1599, unit: '台', description: '适用于卷帘窗帘' },
    { sku: 'AQ-CT-TK', name: 'Aqara 窗帘轨道套件', brand: 'Aqara', category: 'curtain', basePrice: 899, unit: '套', description: '铝合金轨道含安装配件' },
    { sku: 'AQ-D100', name: 'Aqara 智能门锁 D100', brand: 'Aqara', category: 'lock', basePrice: 5999, unit: '台', description: '指纹/密码/NFC/钥匙四合一' },
    { sku: 'AQ-N100', name: 'Aqara 智能门锁 N100', brand: 'Aqara', category: 'lock', basePrice: 3999, unit: '台', description: '支持 HomeKit' },
    { sku: 'AQ-A100', name: 'Aqara 智能门锁 A100', brand: 'Aqara', category: 'lock', basePrice: 4599, unit: '台', description: '全自动推拉锁' },
    { sku: 'AQ-LED-T1', name: 'Aqara LED 灯泡 T1', brand: 'Aqara', category: 'light', basePrice: 299, unit: '个', description: '智能 LED 灯泡，支持调色调光' },
    { sku: 'AQ-LED-T2', name: 'Aqara 吸顶灯 T2', brand: 'Aqara', category: 'light', basePrice: 1299, unit: '台', description: '36W 智能吸顶灯' },
    { sku: 'AQ-LED-S1', name: 'Aqara 灯带 S1', brand: 'Aqara', category: 'light', basePrice: 599, unit: '条', description: 'RGB 智能灯带 2m' },
    { sku: 'AQ-DIM-H1', name: 'Aqara 调光器 H1', brand: 'Aqara', category: 'light', basePrice: 399, unit: '台', description: '嵌入式智能调光模块' },
    { sku: 'AQ-MS-P2', name: 'Aqara 人体传感器 P2', brand: 'Aqara', category: 'sensor', basePrice: 299, unit: '个', description: 'mmWave 毫米波人体存在传感器' },
    { sku: 'AQ-DW-S2', name: 'Aqara 门窗传感器 2', brand: 'Aqara', category: 'sensor', basePrice: 129, unit: '个', description: '门窗开关检测' },
    { sku: 'AQ-TH-S1', name: 'Aqara 温湿度传感器', brand: 'Aqara', category: 'sensor', basePrice: 99, unit: '个', description: '温湿度+气压' },
    { sku: 'AQ-WL-S1', name: 'Aqara 水浸传感器', brand: 'Aqara', category: 'sensor', basePrice: 149, unit: '个', description: '漏水检测告警' },
    { sku: 'AQ-SM-S1', name: 'Aqara 烟雾报警器', brand: 'Aqara', category: 'sensor', basePrice: 249, unit: '个', description: '烟雾+温度异常检测' },
    { sku: 'AQ-VB-S1', name: 'Aqara 振动传感器', brand: 'Aqara', category: 'sensor', basePrice: 129, unit: '个', description: '振动/倾斜/跌落检测' },
    { sku: 'AQ-HUB-M3', name: 'Aqara 智能中控 M3', brand: 'Aqara', category: 'gateway', basePrice: 2999, unit: '台', description: '旗舰中控，Matter/Thread/Zigbee' },
    { sku: 'AQ-HUB-M2', name: 'Aqara 网关 M2', brand: 'Aqara', category: 'gateway', basePrice: 899, unit: '台', description: 'Zigbee 3.0 网关' },
    { sku: 'AQ-HUB-E1', name: 'Aqara 网关 E1', brand: 'Aqara', category: 'gateway', basePrice: 499, unit: '台', description: '入门级网关' },
    { sku: 'AQ-S1-SGL', name: 'Aqara 智能开关 S1（单键）', brand: 'Aqara', category: 'panel', basePrice: 399, unit: '台', description: '零火版智能墙壁开关' },
    { sku: 'AQ-S1-DBL', name: 'Aqara 智能开关 S1（双键）', brand: 'Aqara', category: 'panel', basePrice: 499, unit: '台', description: '双键智能墙壁开关' },
    { sku: 'AQ-S1-TRI', name: 'Aqara 智能开关 S1（三键）', brand: 'Aqara', category: 'panel', basePrice: 599, unit: '台', description: '三键智能墙壁开关' },
    { sku: 'AQ-SCENE-S1', name: 'Aqara 场景面板 S1', brand: 'Aqara', category: 'panel', basePrice: 1299, unit: '台', description: '4 寸触控场景面板' },
    { sku: 'AQ-BTN-MINI', name: 'Aqara 无线开关（贴墙式）', brand: 'Aqara', category: 'accessory', basePrice: 129, unit: '个', description: '免布线无线场景开关' },
    { sku: 'AQ-CUBE-T1', name: 'Aqara 魔方控制器 T1', brand: 'Aqara', category: 'accessory', basePrice: 199, unit: '个', description: '六面体手势控制' },
  ]

  const createdProducts: Record<string, string> = {}
  for (let i = 0; i < spuProducts.length; i++) {
    const p = spuProducts[i]
    const product = await prisma.catalogProduct.create({
      data: {
        categoryId: catMap[p.category],
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        description: p.description,
        unit: p.unit,
        basePrice: p.basePrice,
        moq: 1,
        sortOrder: i,
      },
    })
    createdProducts[p.sku] = product.id
  }
  console.log(`✅ 创建 ${spuProducts.length} 个 SPU 产品`)

  // 12a. 为重点产品创建属性和变体
  // --- B1 窗帘电机: 颜色 × 版本 = 4 SKU ---
  const b1Id = createdProducts['AQ-B1']
  const b1ColorAttr = await prisma.productAttribute.create({ data: { productId: b1Id, name: '颜色', sortOrder: 0 } })
  const b1VersionAttr = await prisma.productAttribute.create({ data: { productId: b1Id, name: '版本', sortOrder: 1 } })
  const [b1White, b1Gray] = await Promise.all([
    prisma.productAttributeValue.create({ data: { attributeId: b1ColorAttr.id, value: '白色', sortOrder: 0 } }),
    prisma.productAttributeValue.create({ data: { attributeId: b1ColorAttr.id, value: '灰色', sortOrder: 1 } }),
  ])
  const [b1Zigbee, b1WiFi] = await Promise.all([
    prisma.productAttributeValue.create({ data: { attributeId: b1VersionAttr.id, value: 'Zigbee', sortOrder: 0 } }),
    prisma.productAttributeValue.create({ data: { attributeId: b1VersionAttr.id, value: 'WiFi', sortOrder: 1 } }),
  ])
  const b1Variants = [
    { sku: 'B1-WHT-ZB', name: '白色-Zigbee', basePrice: 2899, stock: 50, attrs: [b1White.id, b1Zigbee.id] },
    { sku: 'B1-WHT-WF', name: '白色-WiFi', basePrice: 3299, stock: 30, attrs: [b1White.id, b1WiFi.id] },
    { sku: 'B1-GRY-ZB', name: '灰色-Zigbee', basePrice: 2899, stock: 40, attrs: [b1Gray.id, b1Zigbee.id] },
    { sku: 'B1-GRY-WF', name: '灰色-WiFi', basePrice: 3299, stock: 25, attrs: [b1Gray.id, b1WiFi.id] },
  ]

  // --- D100 门锁: 颜色 × 连接 = 4 SKU ---
  const d100Id = createdProducts['AQ-D100']
  const d100ColorAttr = await prisma.productAttribute.create({ data: { productId: d100Id, name: '颜色', sortOrder: 0 } })
  const d100ConnAttr = await prisma.productAttribute.create({ data: { productId: d100Id, name: '连接', sortOrder: 1 } })
  const [d100Silver, d100Black] = await Promise.all([
    prisma.productAttributeValue.create({ data: { attributeId: d100ColorAttr.id, value: '太空银', sortOrder: 0 } }),
    prisma.productAttributeValue.create({ data: { attributeId: d100ColorAttr.id, value: '曜石黑', sortOrder: 1 } }),
  ])
  const [d100Zigbee, d100WiFi] = await Promise.all([
    prisma.productAttributeValue.create({ data: { attributeId: d100ConnAttr.id, value: 'Zigbee', sortOrder: 0 } }),
    prisma.productAttributeValue.create({ data: { attributeId: d100ConnAttr.id, value: 'WiFi', sortOrder: 1 } }),
  ])
  const d100Variants = [
    { sku: 'D100-SLV-ZB', name: '太空银-Zigbee', basePrice: 5999, stock: 20, attrs: [d100Silver.id, d100Zigbee.id] },
    { sku: 'D100-SLV-WF', name: '太空银-WiFi', basePrice: 6499, stock: 15, attrs: [d100Silver.id, d100WiFi.id] },
    { sku: 'D100-BLK-ZB', name: '曜石黑-Zigbee', basePrice: 5999, stock: 25, attrs: [d100Black.id, d100Zigbee.id] },
    { sku: 'D100-BLK-WF', name: '曜石黑-WiFi', basePrice: 6499, stock: 20, attrs: [d100Black.id, d100WiFi.id] },
  ]

  // --- LED T1 灯泡: 色温 × 接口 = 6 SKU ---
  const t1Id = createdProducts['AQ-LED-T1']
  const t1TempAttr = await prisma.productAttribute.create({ data: { productId: t1Id, name: '色温', sortOrder: 0 } })
  const t1SocketAttr = await prisma.productAttribute.create({ data: { productId: t1Id, name: '接口', sortOrder: 1 } })
  const [t1WarmWhite, t1CoolWhite, t1RGB] = await Promise.all([
    prisma.productAttributeValue.create({ data: { attributeId: t1TempAttr.id, value: '暖白光', sortOrder: 0 } }),
    prisma.productAttributeValue.create({ data: { attributeId: t1TempAttr.id, value: '冷白光', sortOrder: 1 } }),
    prisma.productAttributeValue.create({ data: { attributeId: t1TempAttr.id, value: 'RGB调色', sortOrder: 2 } }),
  ])
  const [t1E27, t1E14] = await Promise.all([
    prisma.productAttributeValue.create({ data: { attributeId: t1SocketAttr.id, value: 'E27', sortOrder: 0 } }),
    prisma.productAttributeValue.create({ data: { attributeId: t1SocketAttr.id, value: 'E14', sortOrder: 1 } }),
  ])
  const t1Variants = [
    { sku: 'T1-WW-E27', name: '暖白光-E27', basePrice: 299, stock: 200, attrs: [t1WarmWhite.id, t1E27.id] },
    { sku: 'T1-CW-E27', name: '冷白光-E27', basePrice: 299, stock: 180, attrs: [t1CoolWhite.id, t1E27.id] },
    { sku: 'T1-RGB-E27', name: 'RGB调色-E27', basePrice: 499, stock: 100, attrs: [t1RGB.id, t1E27.id] },
    { sku: 'T1-WW-E14', name: '暖白光-E14', basePrice: 299, stock: 150, attrs: [t1WarmWhite.id, t1E14.id] },
    { sku: 'T1-CW-E14', name: '冷白光-E14', basePrice: 299, stock: 120, attrs: [t1CoolWhite.id, t1E14.id] },
    { sku: 'T1-RGB-E14', name: 'RGB调色-E14', basePrice: 499, stock: 80, attrs: [t1RGB.id, t1E14.id] },
  ]

  // 创建多属性变体
  const allMultiVariants = [
    { productId: b1Id, variants: b1Variants },
    { productId: d100Id, variants: d100Variants },
    { productId: t1Id, variants: t1Variants },
  ]
  const variantIds: Record<string, string> = {}
  for (const group of allMultiVariants) {
    for (const v of group.variants) {
      const variant = await prisma.productVariant.create({
        data: { productId: group.productId, sku: v.sku, name: v.name, basePrice: v.basePrice, stock: v.stock, status: 'active' },
      })
      variantIds[v.sku] = variant.id
      for (const attrValId of v.attrs) {
        await prisma.variantAttributeValue.create({ data: { variantId: variant.id, attributeValueId: attrValId } })
      }
    }
  }

  // 为没有多属性的产品创建默认变体
  const multiVariantSkus = new Set(['AQ-B1', 'AQ-D100', 'AQ-LED-T1'])
  for (const p of spuProducts) {
    if (multiVariantSkus.has(p.sku)) continue
    const variant = await prisma.productVariant.create({
      data: { productId: createdProducts[p.sku], sku: `${p.sku}-DEFAULT`, name: '默认', basePrice: p.basePrice, stock: 0, status: 'active' },
    })
    variantIds[`${p.sku}-DEFAULT`] = variant.id
  }

  const totalVariants = b1Variants.length + d100Variants.length + t1Variants.length + (spuProducts.length - multiVariantSkus.size)
  console.log(`✅ 创建 ${totalVariants} 个 SKU 变体（含 ${spuProducts.length - multiVariantSkus.size} 个默认变体）`)

  // 13. 初始化总仓库存（所有变体入库到总仓）
  const hqWarehouseId = warehouses['WH-HQ']
  let stockCount = 0
  for (const [sku, variantId] of Object.entries(variantIds)) {
    const stockQty = sku.includes('-DEFAULT') ? 100 : undefined
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } })
    if (!variant) continue
    const qty = stockQty ?? variant.stock
    if (qty > 0) {
      await prisma.stock.create({
        data: { variantId, warehouseId: hqWarehouseId, quantity: qty },
      })
      await prisma.stockMovement.create({
        data: {
          variantId,
          warehouseId: hqWarehouseId,
          type: 'in',
          quantity: qty,
          refType: 'purchase',
          remark: '初始入库',
          createdBy: admin.id,
        },
      })
      stockCount++
    }
  }
  console.log(`✅ 初始化 ${stockCount} 条总仓库存`)

  // 14. 子公司专属价格（台北 95 折，台中 93 折，高雄 92 折）
  const discountMap: Record<string, number> = {
    [subsidiaries[0].id]: 0.95,
    [subsidiaries[1].id]: 0.93,
    [subsidiaries[2].id]: 0.92,
  }
  let priceCount = 0
  for (const p of spuProducts) {
    for (const [tenantId, discount] of Object.entries(discountMap)) {
      await prisma.tenantPrice.create({
        data: {
          productId: createdProducts[p.sku],
          tenantId,
          price: Math.round(p.basePrice * discount),
          currency: 'TWD',
        },
      })
      priceCount++
    }
  }
  console.log(`✅ 创建 ${priceCount} 条子公司专属价格`)

  // 16. 创建课程分类（LMS）
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

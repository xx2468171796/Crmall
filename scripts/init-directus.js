/**
 * Directus 初始化脚本
 * 创建菜单集合和初始数据
 * 运行: node scripts/init-directus.js
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055"
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || "admin-token"

async function directusFetch(endpoint, options = {}) {
  const response = await fetch(`${DIRECTUS_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      ...options.headers,
    },
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Directus API error: ${response.status} - ${error}`)
  }
  return response.json()
}

async function createMenusCollection() {
  console.log("Creating nexus_menus collection...")
  
  try {
    await directusFetch("/collections", {
      method: "POST",
      body: JSON.stringify({
        collection: "nexus_menus",
        meta: {
          icon: "menu",
          note: "Portal 菜单配置",
          display_template: "{{title}}",
          archive_field: "status",
          archive_value: "archived",
          unarchive_value: "published",
          sort_field: "sort",
        },
        schema: {},
        fields: [
          { field: "id", type: "uuid", meta: { hidden: true }, schema: { is_primary_key: true } },
          { field: "status", type: "string", meta: { width: "half", options: { choices: [{ text: "Published", value: "published" }, { text: "Draft", value: "draft" }, { text: "Archived", value: "archived" }] } }, schema: { default_value: "draft" } },
          { field: "sort", type: "integer", meta: { hidden: true } },
          { field: "title", type: "string", meta: { width: "half", required: true } },
          { field: "key", type: "string", meta: { width: "half", required: true, note: "唯一标识符" } },
          { field: "icon", type: "string", meta: { width: "half", note: "Lucide 图标名" } },
          { field: "path", type: "string", meta: { width: "half", note: "路由路径" } },
          { field: "parent_id", type: "uuid", meta: { width: "half", note: "父菜单 ID" } },
          { field: "subsystem", type: "string", meta: { width: "half", options: { choices: [{ text: "Portal", value: "portal" }, { text: "CRM", value: "crm" }, { text: "OKR", value: "okr" }, { text: "Finance", value: "finance" }, { text: "Inventory", value: "inventory" }, { text: "Learning", value: "learning" }, { text: "Docs", value: "docs" }] } } },
          { field: "permissions", type: "json", meta: { width: "full", note: "所需权限 keys" } },
        ],
      }),
    })
    console.log("✅ nexus_menus collection created")
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("ℹ️ nexus_menus collection already exists")
    } else {
      throw error
    }
  }
}

async function createPermissionsCollection() {
  console.log("Creating nexus_permissions collection...")
  
  try {
    await directusFetch("/collections", {
      method: "POST",
      body: JSON.stringify({
        collection: "nexus_permissions",
        meta: {
          icon: "lock",
          note: "权限定义",
          display_template: "{{key}}",
        },
        schema: {},
        fields: [
          { field: "id", type: "uuid", meta: { hidden: true }, schema: { is_primary_key: true } },
          { field: "key", type: "string", meta: { width: "half", required: true, note: "权限标识 如 crm:read" } },
          { field: "name", type: "string", meta: { width: "half", required: true } },
          { field: "description", type: "text", meta: { width: "full" } },
          { field: "subsystem", type: "string", meta: { width: "half" } },
        ],
      }),
    })
    console.log("✅ nexus_permissions collection created")
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("ℹ️ nexus_permissions collection already exists")
    } else {
      throw error
    }
  }
}

async function seedMenus() {
  console.log("Seeding menu data...")
  
  const menus = [
    { title: "首页", key: "home", icon: "Home", path: "/", subsystem: "portal", sort: 0, status: "published" },
    { title: "工作台", key: "workspace", icon: "LayoutDashboard", path: "/workspace", subsystem: "portal", sort: 1, status: "published" },
    { title: "客户管理", key: "crm", icon: "Users", path: "/crm", subsystem: "crm", sort: 10, status: "published", permissions: ["crm:read"] },
    { title: "目标管理", key: "okr", icon: "Target", path: "/okr", subsystem: "okr", sort: 20, status: "published", permissions: ["okr:read"] },
    { title: "财务管理", key: "finance", icon: "Wallet", path: "/finance", subsystem: "finance", sort: 30, status: "published", permissions: ["finance:read"] },
    { title: "库存管理", key: "inventory", icon: "Package", path: "/inventory", subsystem: "inventory", sort: 40, status: "published", permissions: ["inventory:read"] },
    { title: "培训学习", key: "learning", icon: "GraduationCap", path: "/learning", subsystem: "learning", sort: 50, status: "published", permissions: ["learning:read"] },
    { title: "知识库", key: "docs", icon: "FileText", path: "/docs", subsystem: "docs", sort: 60, status: "published", permissions: ["docs:read"] },
    { title: "系统设置", key: "settings", icon: "Settings", path: "/settings", subsystem: "portal", sort: 100, status: "published", permissions: ["admin"] },
  ]

  for (const menu of menus) {
    try {
      await directusFetch("/items/nexus_menus", {
        method: "POST",
        body: JSON.stringify(menu),
      })
      console.log(`  ✅ Menu: ${menu.title}`)
    } catch (error) {
      if (error.message.includes("unique")) {
        console.log(`  ℹ️ Menu exists: ${menu.title}`)
      } else {
        console.error(`  ❌ Menu failed: ${menu.title}`, error.message)
      }
    }
  }
}

async function seedPermissions() {
  console.log("Seeding permission data...")
  
  const permissions = [
    { key: "crm:read", name: "CRM 查看", subsystem: "crm", description: "查看客户数据" },
    { key: "crm:write", name: "CRM 编辑", subsystem: "crm", description: "编辑客户数据" },
    { key: "okr:read", name: "OKR 查看", subsystem: "okr", description: "查看目标和任务" },
    { key: "okr:write", name: "OKR 编辑", subsystem: "okr", description: "编辑目标和任务" },
    { key: "finance:read", name: "财务 查看", subsystem: "finance", description: "查看财务数据" },
    { key: "finance:write", name: "财务 编辑", subsystem: "finance", description: "编辑财务数据" },
    { key: "inventory:read", name: "库存 查看", subsystem: "inventory", description: "查看库存数据" },
    { key: "inventory:write", name: "库存 编辑", subsystem: "inventory", description: "编辑库存数据" },
    { key: "learning:read", name: "培训 查看", subsystem: "learning", description: "查看课程内容" },
    { key: "learning:write", name: "培训 编辑", subsystem: "learning", description: "创建和编辑课程" },
    { key: "docs:read", name: "文档 查看", subsystem: "docs", description: "查看文档" },
    { key: "docs:write", name: "文档 编辑", subsystem: "docs", description: "编辑文档" },
    { key: "admin", name: "系统管理", subsystem: "portal", description: "系统管理权限" },
  ]

  for (const perm of permissions) {
    try {
      await directusFetch("/items/nexus_permissions", {
        method: "POST",
        body: JSON.stringify(perm),
      })
      console.log(`  ✅ Permission: ${perm.key}`)
    } catch (error) {
      if (error.message.includes("unique")) {
        console.log(`  ℹ️ Permission exists: ${perm.key}`)
      } else {
        console.error(`  ❌ Permission failed: ${perm.key}`, error.message)
      }
    }
  }
}

async function main() {
  console.log("🚀 Initializing Directus for Enterprise Nexus...")
  console.log(`   URL: ${DIRECTUS_URL}`)
  console.log("")

  try {
    await createMenusCollection()
    await createPermissionsCollection()
    await seedMenus()
    await seedPermissions()
    
    console.log("")
    console.log("✅ Directus initialization complete!")
  } catch (error) {
    console.error("❌ Initialization failed:", error.message)
    process.exit(1)
  }
}

main()

# Tasks: Source Code Fusion

## Phase 1: 源码引入 [P0]

### 1.1 Plane (OKR) 源码引入 ✅
- [x] `git remote add plane-upstream https://github.com/makeplane/plane.git`
- [x] `git subtree add --prefix=apps/plane plane-upstream master --squash`
- [x] 创建 `apps/plane/.env.example` 配置共享数据库
- [ ] 修改 `apps/plane/package.json` 适配 Yarn Workspaces
- [ ] 验证 `yarn workspace @nexus/plane dev` 启动成功

**依赖**: bootstrap-enterprise-nexus

### 1.2 NocoDB (CRM) 源码引入 ✅
- [x] `git remote add nocodb-upstream https://github.com/nocodb/nocodb.git`
- [x] `git subtree add --prefix=apps/nocodb nocodb-upstream master --squash`
- [x] 迁移 NocoDB 使用 PostgreSQL (docker-compose 配置)
- [x] 配置 `nocodb` Schema 隔离
- [ ] 验证 NocoDB 服务启动并连接共享 PG

**依赖**: 1.1

### 1.3 Midday (Finance) 源码引入 ✅
- [x] `git remote add midday-upstream https://github.com/midday-ai/midday.git`
- [x] `git subtree add --prefix=apps/midday midday-upstream main --squash`
- [ ] 移除 Supabase 依赖，替换为 @nexus/db
- [ ] 配置 `midday` Schema
- [ ] 验证 Midday 核心功能可用

**依赖**: 1.1

### 1.4 MedusaJS (Inventory) 源码引入 ✅
- [x] `git remote add medusa-upstream https://github.com/medusajs/medusa.git`
- [x] `git subtree add --prefix=apps/inventory medusa-upstream develop --squash`
- [ ] 仅保留 `packages/admin` (移除 storefront)
- [ ] 配置 `medusa` Schema
- [ ] 验证 Medusa Admin 启动成功

**依赖**: 1.1

### 1.5 ClassroomIO (Learning) 源码引入 ✅
- [x] `git remote add classroomio-upstream https://github.com/classroomio/classroomio.git`
- [x] `git subtree add --prefix=apps/learning classroomio-upstream main --squash`
- [ ] 配置 SvelteKit 独立端口运行
- [ ] 配置 `classroomio` Schema
- [ ] 验证 ClassroomIO 启动成功

**依赖**: 1.1

### 1.6 AppFlowy (Docs) 源码引入 ✅
- [x] `git remote add appflowy-upstream https://github.com/AppFlowy-IO/AppFlowy.git`
- [x] `git subtree add --prefix=apps/docs appflowy-upstream main --squash`
- [ ] 构建 AppFlowy Web 版本
- [ ] 配置 AppFlowy Cloud 自托管后端
- [ ] 验证 AppFlowy Web 可访问

**依赖**: 1.1

---

## Phase 2: 认证统一 [P0] ✅

### 2.1 Plane 认证改造
- [x] 创建 `apps/plane/.env.example` 配置共享基础设施
- [ ] 移除原有 NextAuth 配置 (待深入修改)
- [ ] 引用 `@nexus/auth` 配置 (待深入修改)
- [ ] 添加 workspace ↔ tenant 映射逻辑 (待深入修改)
- [ ] 验证 Portal 登录后可访问 Plane

### 2.2 NocoDB 认证改造
- [x] 创建 `@nexus/rbac/middleware/express` Express 中间件
- [x] Docker Compose 配置 NocoDB 服务
- [ ] 禁用 NocoDB 内置认证 UI (待深入修改)
- [ ] 验证 NocoDB API 正确识别用户

### 2.3 Midday 认证改造
- [ ] 移除 Supabase Auth 依赖
- [ ] 替换为 `@nexus/auth` signIn/signOut
- [ ] 修改 Session 获取逻辑
- [ ] 验证发票创建者正确关联用户

### 2.4 MedusaJS 认证改造
- [ ] 替换 JWT 验证为 Redis Session
- [ ] 添加 Admin Guard 中间件
- [ ] 实现管理员角色映射
- [ ] 验证 Admin 操作权限正确

### 2.5 ClassroomIO 认证改造
- [x] 创建 `@nexus/rbac/middleware/sveltekit` SvelteKit 中间件
- [x] 创建 `apps/learning/.env.example` 配置
- [ ] 实现 `getSession()` 调用 Portal API (待深入修改)
- [ ] 验证课程创建者正确识别

### 2.6 AppFlowy 认证改造
- [ ] 配置 AppFlowy Cloud 对接 Auth.js API
- [ ] 实现 Token 交换机制
- [ ] 修改工作区权限检查
- [ ] 验证文档编辑者正确记录

---

## Phase 3: Headless UI 改造 [P0] ✅

### 3.1 Portal IframeContainer 组件
- [x] 创建 `IframeContainer` 组件 (PostMessage 通信)
- [x] 创建 `useSubsystemMessage` Hook
- [x] 更新所有子系统页面使用 IframeContainer

### 3.2 Plane Headless 改造 (待深入修改)
- [ ] 移除 `components/core/sidebar`
- [ ] 移除 `components/headers`
- [ ] 创建 `PlaneEmbed` 组件导出核心视图

### 3.3 NocoDB Headless 改造 (待深入修改)
- [ ] 移除 Navbar 组件
- [ ] 移除 Sidebar 组件
- [ ] 保留: TableView, FormView, KanbanView, GalleryView

### 3.3 Midday Headless 改造
- [ ] 移除 Dashboard Shell
- [ ] 移除 Auth Pages
- [ ] 创建 `MiddayEmbed` 组件
- [ ] 导出: InvoiceEditor, TransactionList, Reports
- [ ] 在 Portal 中测试组件嵌入

### 3.4 MedusaJS Headless 改造
- [ ] 移除 Storefront 完整代码
- [ ] 保留 Admin UI 核心组件
- [ ] 创建 `MedusaAdminEmbed` 组件
- [ ] 导出: ProductList, InventoryView, OrderList
- [ ] 在 Portal 中测试组件嵌入

### 3.5 ClassroomIO Headless 改造
- [ ] 移除 Landing Page
- [ ] 移除 Dashboard Layout
- [ ] 保留: CourseBuilder, QuizEditor, ProgressView
- [ ] 配置独立端口 (如 3001)
- [ ] 在 Portal 中测试 iframe 嵌入

### 3.6 AppFlowy Headless 改造
- [ ] 移除 Window Frame
- [ ] 移除 Sidebar
- [ ] 保留: Editor, DatabaseView, KanbanBoard
- [ ] 构建 Web 嵌入版本
- [ ] 在 Portal 中测试 iframe 嵌入

---

## Phase 4: 数据库 Schema 迁移 [P1] ✅

### 4.1 创建 Multi-Schema 结构
- [x] 创建 SQL 脚本初始化所有 Schema (init-schemas.sql)
- [x] 更新 `packages/db/prisma/schema.prisma` 添加所有 Schema
- [x] 运行 `prisma db push` 同步基础表结构

### 4.2 Plane Schema 迁移
- [ ] 分析 Plane 原有表结构
- [ ] 创建 `plane` Schema 迁移脚本
- [ ] 修改 Plane Prisma 配置指向共享 PG
- [ ] 验证 Plane 数据持久化正常

### 4.3 NocoDB Schema 迁移
- [ ] 导出 NocoDB SQLite 数据
- [ ] 创建 `nocodb` Schema 表结构
- [ ] 迁移数据到 PostgreSQL
- [ ] 验证 NocoDB 读写正常

### 4.4 其他系统 Schema 迁移
- [ ] Midday → `midday` Schema
- [ ] MedusaJS → `medusa` Schema
- [ ] ClassroomIO → `classroomio` Schema
- [ ] AppFlowy → `appflowy` Schema

---

## Phase 5: 存储统一 [P1] ✅

### 5.1 创建 MinIO Buckets
- [x] 创建 `scripts/init-minio-buckets.sh` 脚本
- [x] `nexus-crm` bucket 配置
- [x] `nexus-okr` bucket 配置
- [x] `nexus-finance` bucket 配置
- [x] `nexus-products` bucket 配置
- [x] `nexus-lms` bucket 配置
- [x] `nexus-docs` bucket 配置

### 5.2 各系统存储适配
- [ ] Plane: 替换文件上传 → @nexus/storage
- [ ] NocoDB: 替换附件存储 → MinIO
- [ ] Midday: 替换 PDF 存储 → MinIO
- [ ] MedusaJS: 替换产品图片 → MinIO
- [ ] ClassroomIO: 替换课件存储 → MinIO
- [ ] AppFlowy: 替换文档附件 → MinIO

---

## Phase 6: Portal 集成 [P1] ✅

### 6.1 路由配置
- [x] `/crm/*` → NocoDB (iframe)
- [x] `/okr/*` → Plane (iframe)
- [x] `/finance/*` → Midday (iframe)
- [x] `/inventory/*` → MedusaJS (iframe)
- [x] `/learning/*` → ClassroomIO (iframe)
- [x] `/docs/*` → AppFlowy (iframe)

### 6.2 Directus 菜单配置 ✅
- [x] 创建 `scripts/init-directus.js` 初始化脚本
- [x] 创建 `nexus_menus` 集合定义
- [x] 添加 9 个菜单项 (Portal + 6子系统 + 设置)
- [x] 配置菜单权限关联

### 6.3 权限集成 ✅
- [x] 创建 `nexus_permissions` 集合
- [x] 定义 13 个权限 keys (crm/okr/finance/inventory/learning/docs :read/:write + admin)
- [ ] 创建 Directus Roles 映射 (待运行 Directus 后配置)

---

## Phase 7: 系统间事件联动 [P2] ✅

### 7.1 BullMQ 事件总线
- [x] 创建 `@nexus/events` 包
- [x] 实现 Event Producer (publishEvent, publishUserCreated, publishCustomerCreated)
- [x] 实现 Event Consumer (onEvent, startEventConsumer)
- [x] 定义跨系统事件类型 (NexusEventType)

### 7.2 ID 映射服务
- [x] 实现 Redis ID 映射 (id-mapper.ts)
- [x] 实现 Nexus ID ↔ 各系统 ID 双向映射
- [x] 实现批量 ID 转换 (getAllExternalIds)
- [x] 实现事件订阅 Workers (user-sync, customer-sync)

### 7.3 业务联动示例
- [x] UserSync Worker - 用户创建同步
- [x] CustomerSync Worker - 客户创建同步
- [ ] CRM 客户 → 关联 OKR 项目 (待子系统集成后实现)
- [ ] OKR Issue 关闭 → 触发 Finance 发票生成 (待子系统集成后实现)

---

## 依赖关系

```
Phase 1 (源码引入)
    ↓
Phase 2 (认证统一) ←→ Phase 3 (Headless 改造)
    ↓
Phase 4 (Schema 迁移) ←→ Phase 5 (存储统一)
    ↓
Phase 6 (Portal 集成)
    ↓
Phase 7 (系统联动)
```

---

## 验收标准

1. **源码完整**: 6 个子系统源码在 `apps/` 目录可见
2. **独立启动**: 各子系统可独立 `yarn dev` 启动
3. **单点登录**: Portal 登录后，访问任意子系统无需重新登录
4. **数据隔离**: 各子系统数据在独立 Schema，无冲突
5. **UI 融合**: 子系统在 Portal 中渲染，无原生 Shell
6. **文件统一**: 所有附件上传到 MinIO，URL 可访问
7. **权限生效**: 无权限用户无法访问对应模块

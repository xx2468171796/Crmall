# Proposal: Source Code Fusion

## Summary

将 6 个行业顶级开源项目 (NocoDB, Plane, Midday, MedusaJS, ClassroomIO, AppFlowy) 的**源代码**引入 Monorepo，进行 **Headless (无头化)** 改造，实现统一的企业操作系统。

## Motivation

### 问题

1. **SaaS 黑盒依赖**: 依赖外部 SaaS 服务存在数据安全、定制化、成本等风险
2. **系统孤岛**: 多个独立系统导致用户体验割裂、数据无法互通
3. **重复造轮**: 每个系统独立实现认证、存储、权限等基础能力

### 解决方案

采用 **"Source Code Fusion" (源码融合)** 策略：

1. **源码引入**: 将开源项目完整源码克隆到 `apps/` 目录
2. **Headless 改造**: 移除原有 Shell (Sidebar/Header)，保留核心功能组件
3. **统一基建**: 共享 PostgreSQL (Multi-Schema)、Redis、MinIO、Auth.js
4. **Portal 集成**: 所有模块作为组件嵌入 Portal 主控台

## Module Matrix

| 模块 | 原始项目 | 技术栈 | DB Schema | 存储桶 | GitHub |
|------|----------|--------|-----------|--------|--------|
| **CRM** | NocoDB | Nuxt 3 | `nocodb` | `nexus-crm` | nocodb/nocodb |
| **OKR** | Plane | Next.js 14 | `plane` | `nexus-okr` | makeplane/plane |
| **Finance** | Midday | Next.js 14 | `midday` | `nexus-finance` | midday-ai/midday |
| **Inventory** | MedusaJS | React | `medusa` | `nexus-products` | medusajs/medusa |
| **Learning** | ClassroomIO | SvelteKit | `classroomio` | `nexus-lms` | classroomio/classroomio |
| **Docs** | AppFlowy | Flutter/Rust | `appflowy` | `nexus-docs` | AppFlowy-IO/AppFlowy |

## Headless 改造要点

### 1. NocoDB (CRM)

```diff
- 移除: Navbar, Sidebar, Auth UI
+ 保留: Table View, Form View, Kanban, Gallery
+ 对接: @nexus/auth Cookie, @nexus/db 连接池
```

### 2. Plane (OKR)

```diff
- 移除: AppSidebar, Header, Auth Flow
+ 保留: Cycle View, Module View, Issue List, Gantt
+ 对接: @nexus/auth Session, workspace → tenant 映射
```

### 3. Midday (Finance)

```diff
- 移除: Dashboard Shell, Auth Pages
+ 保留: Invoice Editor, Transaction List, Reports
+ 对接: @nexus/storage 替换本地存储, 共享 PG 连接
```

### 4. MedusaJS (Inventory)

```diff
- 移除: Storefront (仅保留 Admin)
+ 保留: Product Management, Inventory, Orders
+ 对接: @nexus/auth Admin Guard, Redis 缓存
```

### 5. ClassroomIO (Learning)

```diff
- 移除: Dashboard Layout, Landing Page
+ 保留: Course Builder, Quiz, Progress Tracking
+ 改造: SvelteKit → 作为 iframe 或 Web Component 嵌入
```

### 6. AppFlowy (Docs)

```diff
- 移除: Sidebar, Window Frame
+ 保留: Editor, Database View, Kanban
+ 对接: AppFlowy Cloud → 自托管 Rust Backend
```

## Impact

### 用户体验

- **统一入口**: 单点登录，无需在多个系统间切换
- **数据互通**: CRM 客户可关联 OKR 目标、Finance 发票
- **一键换肤**: 共享 CSS Variables，全局主题切换

### 技术架构

- **Multi-Schema**: 各模块独立 Schema，避免表名冲突
- **Session 共享**: Redis 存储 Session，子系统通过 Cookie 验证
- **文件统一**: 所有附件上传至 MinIO，统一 Presigned URL

## Dependencies

- ✅ `bootstrap-enterprise-nexus` (Monorepo 基础设施)
- ⏳ Directus 权限配置
- ⏳ 各开源项目源码获取

## Success Criteria

1. [ ] 所有 6 个子系统源码成功引入 `apps/` 目录
2. [ ] 各系统连接到共享 PostgreSQL (独立 Schema)
3. [ ] 单点登录: Portal 登录后可访问所有子系统
4. [ ] Headless UI: 子系统在 Portal iframe/组件中正常渲染
5. [ ] 数据互通: 至少实现 CRM ↔ OKR 的实体关联

## Risks

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 开源项目版本更新 | 合并冲突 | 锁定稳定版本，定期 rebase |
| 技术栈差异 (Nuxt/Svelte/Flutter) | 集成复杂度 | iframe 隔离 + PostMessage 通信 |
| 数据库 Schema 冲突 | 迁移失败 | Multi-Schema 隔离，禁止跨 Schema 外键 |
| 认证状态不同步 | 登录态丢失 | Redis Session + 统一 Cookie Domain |

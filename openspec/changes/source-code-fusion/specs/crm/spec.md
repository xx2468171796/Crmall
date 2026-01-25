# Spec: CRM (NocoDB Integration)

## Overview

将 NocoDB 源码引入作为 CRM 模块，提供客户管理、销售管道、联系人追踪等功能。

## Source

- **Repository**: https://github.com/nocodb/nocodb
- **Branch**: master
- **License**: AGPL-3.0
- **Tech Stack**: Nuxt 3 + Vue 3 + Express

## ADDED Requirements

### REQ-CRM-001: 源码引入

NocoDB 完整源码必须作为 Git Subtree 引入到 `apps/nocodb` 目录。

#### Scenario: 初始克隆
```gherkin
Given Monorepo 已初始化
When 执行 git subtree add --prefix=apps/nocodb nocodb-upstream master --squash
Then apps/nocodb 目录包含完整 NocoDB 源码
And package.json 存在于 apps/nocodb/packages/nc-gui
```

### REQ-CRM-002: PostgreSQL 适配

NocoDB 必须配置使用共享 PostgreSQL 实例的 `nocodb` Schema。

#### Scenario: 数据库连接
```gherkin
Given NocoDB 服务启动
When 创建新的 Base (数据库)
Then 数据存储在 PostgreSQL nocodb Schema
And 不使用 SQLite 文件存储
```

### REQ-CRM-003: 认证集成

NocoDB 必须使用 @nexus/auth 的 Redis Session 进行身份验证。

#### Scenario: Cookie 认证
```gherkin
Given 用户已在 Portal 登录
And Cookie nexus-session 存在
When 访问 NocoDB iframe
Then NocoDB 识别当前用户身份
And 显示用户有权访问的 Bases
```

### REQ-CRM-004: Headless UI

NocoDB 必须移除原生导航组件，仅保留核心视图。

#### Scenario: 隐藏导航
```gherkin
Given NocoDB 在 iframe 中加载
Then 不显示顶部 Navbar
And 不显示左侧 Sidebar
And 仅显示 Table/Form/Kanban 视图区域
```

### REQ-CRM-005: 文件存储

NocoDB 附件必须上传到 MinIO `nexus-crm` bucket。

#### Scenario: 附件上传
```gherkin
Given 用户在 Table 中添加附件字段
When 上传文件
Then 文件存储到 MinIO nexus-crm bucket
And 返回 Presigned URL 供下载
```

## MODIFIED Requirements

### REQ-CRM-M01: 禁用内置认证

原有 NocoDB 注册/登录页面必须禁用。

#### Scenario: 阻止直接登录
```gherkin
Given 用户直接访问 NocoDB /signin 路由
Then 重定向到 Portal /login 页面
And 不显示 NocoDB 原生登录表单
```

## API 端点 (保留)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/db/meta/projects` | 获取 Bases 列表 |
| GET | `/api/v1/db/data/:tableId` | 获取表数据 |
| POST | `/api/v1/db/data/:tableId` | 创建记录 |
| PATCH | `/api/v1/db/data/:tableId/:rowId` | 更新记录 |
| DELETE | `/api/v1/db/data/:tableId/:rowId` | 删除记录 |

## 数据模型

```sql
-- nocodb Schema 核心表
CREATE TABLE nocodb.nc_projects (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(255),
  prefix VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nocodb.nc_tables (
  id VARCHAR(20) PRIMARY KEY,
  project_id VARCHAR(20) REFERENCES nocodb.nc_projects(id),
  table_name VARCHAR(255),
  type VARCHAR(20) -- 'table', 'view'
);
```

## Portal 集成

```tsx
// apps/portal/src/app/(dashboard)/crm/[[...path]]/page.tsx
export default function CRMPage() {
  return (
    <iframe
      src={`${process.env.NOCODB_URL}/dashboard`}
      className="w-full h-full border-0"
      allow="clipboard-write"
    />
  )
}
```

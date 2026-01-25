# Spec: OKR (Plane Integration)

## Overview

将 Plane 源码引入作为 OKR 模块，提供目标管理、项目追踪、Issue 管理、甘特图等功能。

## Source

- **Repository**: https://github.com/makeplane/plane
- **Branch**: master
- **License**: AGPL-3.0
- **Tech Stack**: Next.js 14 + React + TypeScript

## ADDED Requirements

### REQ-OKR-001: 源码引入

Plane 完整源码必须作为 Git Subtree 引入到 `apps/plane` 目录。

#### Scenario: 初始克隆
```gherkin
Given Monorepo 已初始化
When 执行 git subtree add --prefix=apps/plane plane-upstream master --squash
Then apps/plane 目录包含完整 Plane 源码
And web/package.json 存在
```

### REQ-OKR-002: 组件导出

Plane 核心视图必须作为 React 组件导出，供 Portal 嵌入使用。

#### Scenario: 组件嵌入
```gherkin
Given Portal 加载 OKR 页面
When import { CycleView } from "@nexus/plane"
Then CycleView 组件正常渲染
And 无额外的 Shell UI
```

### REQ-OKR-003: Workspace 映射

Plane Workspace 必须映射到 Portal Tenant/Company 结构。

#### Scenario: 租户隔离
```gherkin
Given 用户属于 Tenant A
When 访问 OKR 模块
Then 仅显示 Tenant A 的 Workspace
And 无法看到其他租户数据
```

### REQ-OKR-004: 认证集成

Plane 必须使用 @nexus/auth 进行身份验证，复用 Portal Session。

#### Scenario: Session 共享
```gherkin
Given 用户已在 Portal 登录
When 访问 OKR 模块
Then Plane 自动识别当前用户
And 无需重新登录
```

### REQ-OKR-005: 文件存储

Plane Issue 附件必须上传到 MinIO `nexus-okr` bucket。

#### Scenario: 附件上传
```gherkin
Given 用户在 Issue 中上传附件
When 文件上传完成
Then 文件存储到 MinIO nexus-okr bucket
And Issue 详情显示附件预览
```

## MODIFIED Requirements

### REQ-OKR-M01: 移除 App Shell

Plane 原有的 Sidebar 和 Header 必须移除。

#### Scenario: Headless 渲染
```gherkin
Given Portal 嵌入 Plane 组件
Then 不显示 Plane AppSidebar
And 不显示 Plane Header
And 仅显示功能视图区域
```

## 导出组件列表

| Component | Description | Props |
|-----------|-------------|-------|
| `CycleView` | 周期视图 | workspaceSlug, projectId |
| `ModuleView` | 模块视图 | workspaceSlug, projectId |
| `IssueList` | Issue 列表 | workspaceSlug, projectId, filters |
| `IssueDetail` | Issue 详情 | workspaceSlug, projectId, issueId |
| `GanttView` | 甘特图 | workspaceSlug, projectId |
| `BoardView` | 看板视图 | workspaceSlug, projectId |

## 数据模型

```sql
-- plane Schema 核心表
CREATE TABLE plane.workspaces (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(100) UNIQUE,
  tenant_id UUID REFERENCES auth.tenants(id), -- 关联租户
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE plane.projects (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES plane.workspaces(id),
  name VARCHAR(255),
  identifier VARCHAR(10)
);

CREATE TABLE plane.issues (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES plane.projects(id),
  name VARCHAR(255),
  state VARCHAR(50),
  priority VARCHAR(20),
  assignee_id UUID REFERENCES auth.users(id)
);
```

## Portal 集成

```tsx
// apps/portal/src/app/(dashboard)/okr/[workspaceSlug]/[projectId]/page.tsx
import { CycleView } from "@nexus/plane"

export default function OKRProjectPage({ params }) {
  return (
    <CycleView
      workspaceSlug={params.workspaceSlug}
      projectId={params.projectId}
    />
  )
}
```

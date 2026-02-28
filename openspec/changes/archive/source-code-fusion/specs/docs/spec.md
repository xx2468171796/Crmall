# Spec: Docs (AppFlowy Integration)

## Overview

将 AppFlowy 源码引入作为知识库模块，提供文档编辑、数据库视图、看板等功能。

## Source

- **Repository**: https://github.com/AppFlowy-IO/AppFlowy
- **Branch**: main
- **License**: AGPL-3.0
- **Tech Stack**: Flutter (Web) + Rust Backend

## ADDED Requirements

### REQ-DOCS-001: 源码引入

AppFlowy 完整源码必须引入到 `apps/docs` 目录。

#### Scenario: 初始克隆
```gherkin
Given Monorepo 已初始化
When 执行 git subtree add
Then apps/docs 目录包含完整 AppFlowy 源码
And frontend/appflowy_flutter 存在
And appflowy_cloud 存在
```

### REQ-DOCS-002: Web 构建

AppFlowy 必须构建为 Web 版本，可在浏览器中运行。

#### Scenario: Web 构建
```gherkin
Given AppFlowy 源码存在
When 执行 flutter build web
Then 生成 build/web 产物
And 可通过 HTTP 服务访问
```

### REQ-DOCS-003: iframe 集成

AppFlowy Web 必须通过 iframe 嵌入 Portal。

#### Scenario: iframe 嵌入
```gherkin
Given AppFlowy Web 运行中
When Portal 加载 Docs 页面
Then 显示 AppFlowy iframe
And 编辑器功能正常
```

### REQ-DOCS-004: 自托管后端

AppFlowy Cloud 必须自托管，连接共享 PostgreSQL。

#### Scenario: 后端部署
```gherkin
Given AppFlowy Cloud 配置完成
When 启动后端服务
Then 连接到 PostgreSQL appflowy Schema
And 用户数据正确存储
```

### REQ-DOCS-005: 认证对接

AppFlowy 必须对接 Auth.js API 进行身份验证。

#### Scenario: Token 交换
```gherkin
Given 用户在 Portal 登录
When 访问 AppFlowy
Then AppFlowy 通过 API 获取用户信息
And 建立 AppFlowy Session
```

### REQ-DOCS-006: 文档存储

文档附件必须上传到 MinIO `nexus-docs` bucket。

#### Scenario: 附件上传
```gherkin
Given 用户在文档中插入图片
When 图片上传完成
Then 图片存储到 MinIO nexus-docs bucket
```

## Headless 改造

```diff
- 移除: Window Frame, Sidebar
+ 保留: Editor, DatabaseView, KanbanBoard, CalendarView
+ 注入: CSS 隐藏边框，调整布局
```

## 数据模型

```sql
CREATE TABLE appflowy.workspaces (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES auth.tenants(id),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appflowy.documents (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES appflowy.workspaces(id),
  title VARCHAR(255),
  content JSONB,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Portal 集成

```tsx
// apps/portal/src/app/(dashboard)/docs/[[...path]]/page.tsx
export default function DocsPage() {
  return (
    <iframe
      src={`${process.env.APPFLOWY_URL}`}
      className="w-full h-full border-0"
      style={{ minHeight: "calc(100vh - 60px)" }}
    />
  )
}
```

## 部署架构

```
┌─────────────────────────────────────────────────┐
│                    Portal                        │
│  ┌───────────────────────────────────────────┐  │
│  │              AppFlowy iframe               │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │      AppFlowy Flutter Web           │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                       │
                       ▼
            ┌─────────────────┐
            │ AppFlowy Cloud  │
            │   (Rust API)    │
            └─────────────────┘
                       │
                       ▼
            ┌─────────────────┐
            │   PostgreSQL    │
            │ (appflowy schema)│
            └─────────────────┘
```

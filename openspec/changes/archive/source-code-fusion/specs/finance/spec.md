# Spec: Finance (Midday Integration)

## Overview

将 Midday 源码引入作为财务模块，提供发票管理、交易追踪、财务报表等功能。

## Source

- **Repository**: https://github.com/midday-ai/midday
- **Branch**: main
- **License**: AGPL-3.0
- **Tech Stack**: Next.js 14 + React + Supabase

## ADDED Requirements

### REQ-FIN-001: 源码引入

Midday 完整源码必须作为 Git Subtree 引入到 `apps/midday` 目录。

#### Scenario: 初始克隆
```gherkin
Given Monorepo 已初始化
When 执行 git subtree add --prefix=apps/midday midday-upstream main --squash
Then apps/midday 目录包含完整 Midday 源码
```

### REQ-FIN-002: 移除 Supabase 依赖

Midday 必须移除 Supabase 依赖，替换为 @nexus/db 和 @nexus/auth。

#### Scenario: 数据库替换
```gherkin
Given Midday 源码引入
When 移除 @supabase/supabase-js 依赖
And 替换数据访问为 Prisma Client
Then 所有 CRUD 操作使用 @nexus/db
```

### REQ-FIN-003: 组件导出

Midday 核心功能必须作为 React 组件导出。

#### Scenario: 发票编辑器嵌入
```gherkin
Given Portal 加载 Finance 页面
When import { InvoiceEditor } from "@nexus/midday"
Then InvoiceEditor 组件正常渲染
And 可创建/编辑发票
```

### REQ-FIN-004: PDF 存储

发票 PDF 必须上传到 MinIO `nexus-finance` bucket。

#### Scenario: PDF 生成存储
```gherkin
Given 用户生成发票 PDF
When PDF 生成完成
Then PDF 文件上传到 MinIO nexus-finance bucket
And 返回下载链接
```

### REQ-FIN-005: 多租户支持

财务数据必须按 Tenant 隔离。

#### Scenario: 租户数据隔离
```gherkin
Given 用户属于 Tenant A
When 查看发票列表
Then 仅显示 Tenant A 的发票
And 无法访问其他租户财务数据
```

## MODIFIED Requirements

### REQ-FIN-M01: 移除 Dashboard Shell

Midday 原有的 Dashboard 布局必须移除。

#### Scenario: Headless 渲染
```gherkin
Given Portal 嵌入 Midday 组件
Then 不显示 Midday Sidebar
And 不显示 Midday Header
And 仅显示功能组件
```

## 导出组件列表

| Component | Description | Props |
|-----------|-------------|-------|
| `InvoiceEditor` | 发票编辑器 | invoiceId?, onSave |
| `InvoiceList` | 发票列表 | filters, onSelect |
| `TransactionList` | 交易列表 | dateRange, category |
| `FinanceOverview` | 财务概览 | period |
| `ExpenseChart` | 支出图表 | dateRange |

## 数据模型

```sql
-- midday Schema 核心表
CREATE TABLE midday.invoices (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES auth.tenants(id),
  invoice_number VARCHAR(50),
  customer_name VARCHAR(255),
  amount DECIMAL(10, 2),
  status VARCHAR(20), -- 'draft', 'sent', 'paid'
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE midday.transactions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES auth.tenants(id),
  description VARCHAR(255),
  amount DECIMAL(10, 2),
  category VARCHAR(50),
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Portal 集成

```tsx
// apps/portal/src/app/(dashboard)/finance/invoices/page.tsx
import { InvoiceList } from "@nexus/midday"

export default function InvoicesPage() {
  return <InvoiceList onSelect={(id) => router.push(`/finance/invoices/${id}`)} />
}
```

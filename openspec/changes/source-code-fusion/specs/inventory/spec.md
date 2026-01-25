# Spec: Inventory (MedusaJS Integration)

## Overview

将 MedusaJS Admin 源码引入作为库存模块，提供产品管理、库存追踪、订单管理等功能。

## Source

- **Repository**: https://github.com/medusajs/medusa
- **Branch**: develop
- **License**: MIT
- **Tech Stack**: React + Express + TypeORM

## ADDED Requirements

### REQ-INV-001: 源码引入 (Admin Only)

仅引入 MedusaJS Admin 部分，移除 Storefront。

#### Scenario: 选择性引入
```gherkin
Given Monorepo 已初始化
When 执行 git subtree add
Then 仅保留 packages/admin 和 packages/medusa 核心
And 移除 storefront 相关代码
```

### REQ-INV-002: 组件导出

MedusaJS Admin 核心视图必须作为 React 组件导出。

#### Scenario: 组件嵌入
```gherkin
Given Portal 加载 Inventory 页面
When import { ProductList } from "@nexus/inventory"
Then ProductList 组件正常渲染
```

### REQ-INV-003: 多租户支持

库存数据必须按 Tenant 隔离。

#### Scenario: 租户数据隔离
```gherkin
Given 用户属于 Tenant A
When 查看产品列表
Then 仅显示 Tenant A 的产品
```

### REQ-INV-004: 图片存储

产品图片必须上传到 MinIO `nexus-products` bucket。

#### Scenario: 图片上传
```gherkin
Given 用户上传产品图片
When 上传完成
Then 图片存储到 MinIO nexus-products bucket
```

## 导出组件列表

| Component | Description |
|-----------|-------------|
| `ProductList` | 产品列表 |
| `ProductDetail` | 产品详情 |
| `InventoryView` | 库存视图 |
| `OrderList` | 订单列表 |
| `CategoryTree` | 分类树 |

## 数据模型

```sql
CREATE TABLE medusa.products (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES auth.tenants(id),
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medusa.product_variants (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES medusa.products(id),
  sku VARCHAR(100),
  inventory_quantity INTEGER DEFAULT 0,
  price DECIMAL(10, 2)
);
```

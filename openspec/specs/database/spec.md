# Spec: 数据库设计 (Multi-Schema)

## Status: implemented

## 概述
Prisma 7 + PostgreSQL 17 Multi-Schema 隔离，9 个独立 Schema 覆盖全部业务模块。

## Schema 列表
| Schema | 用途 | 核心模型 |
|--------|------|----------|
| `auth` | 认证/租户/角色/权限 | Tenant, User, Role, Permission, Session, Department |
| `system` | 公告/通知/配置/审计 | Announcement, Notification, SystemConfig, AuditLog, Attachment |
| `crm` | 客户/商机/合同/工单 | Customer, Contact, Opportunity, Contract, WorkOrder, FollowUp |
| `ordering` | B2B 订货系统 | CatalogProduct, Order, TenantAccount, Shipment, CartItem |
| `inventory` | 进销存 | Warehouse, Product, Stock, SnCode, PurchaseOrder, TransferOrder |
| `finance` | 财务 | Payment, Disbursement, Invoice, Expense |
| `okr` | OKR/项目/任务 | Objective, KeyResult, Project, Task, TodoItem |
| `docs` | 文档知识库 | DocSpace, Document, DocumentPermission, DocumentMention |
| `lms` | 培训 | Course, Chapter, Quiz, Certificate, LearningProgress |

## 多租户隔离
- 行级隔离: 所有业务表含 `tenantId` 字段
- Prisma Middleware 自动注入 `WHERE tenantId = ?`
- 总部用户 (isPlatform=true) 不注入过滤条件

## Prisma 7 配置
- `prisma.config.ts` 管理连接 URL
- `schema.prisma` 中不含 `url` 字段 (Prisma 7 新规范)
- `multiSchema` 已内置，无需 previewFeatures

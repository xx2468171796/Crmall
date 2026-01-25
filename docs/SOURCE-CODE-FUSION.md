# Source Code Fusion 集成指南

## 概述

Enterprise Nexus 采用 "Source Code Fusion" 策略，将 6 个顶级开源项目集成到统一的 Monorepo 中，共享基础设施。

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                    Portal (Next.js 16)                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ CRM │ │ OKR │ │Fin  │ │ Inv │ │Learn│ │Docs │      │
│  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘      │
└─────┼───────┼───────┼───────┼───────┼───────┼──────────┘
      │       │       │       │       │       │
      ▼       ▼       ▼       ▼       ▼       ▼
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ NocoDB  │  Plane  │ Midday  │ Medusa  │Classroom│AppFlowy │
│ (iframe)│ (iframe)│ (iframe)│ (iframe)│(iframe) │(iframe) │
└────┬────┴────┬────┴────┬────┴────┬────┴────┬────┴────┬────┘
     │         │         │         │         │         │
     └─────────┴─────────┴────┬────┴─────────┴─────────┘
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                    Shared Infrastructure                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  Redis   │  │  MinIO   │  │ Directus │  │
│  │(Multi-   │  │(Session/ │  │(S3 Files)│  │ (RBAC)   │  │
│  │ Schema)  │  │ BullMQ)  │  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└───────────────────────────────────────────────────────────┘
```

## 子系统映射

| 模块 | 开源项目 | 路由 | Schema | 端口 |
|------|----------|------|--------|------|
| CRM | NocoDB | `/crm` | `nocodb` | 8080 |
| OKR | Plane | `/okr` | `plane` | 3001 |
| Finance | Midday | `/finance` | `midday` | 3002 |
| Inventory | MedusaJS | `/inventory` | `medusa` | 9000 |
| Learning | ClassroomIO | `/learning` | `classroomio` | 5173 |
| Docs | AppFlowy | `/docs` | `appflowy` | 8000 |

## 快速启动

### 1. 启动基础服务

```bash
# 启动 Docker Compose (Directus + NocoDB)
docker-compose up -d

# 等待服务就绪
# Directus: http://localhost:8055
# NocoDB: http://localhost:8080
```

### 2. 初始化 Directus

```bash
# 获取 Directus Admin Token 后
export DIRECTUS_ADMIN_TOKEN=your-token
node scripts/init-directus.js
```

### 3. 初始化 MinIO Buckets

```bash
# 需要安装 mc (MinIO Client)
bash scripts/init-minio-buckets.sh
```

### 4. 启动 Portal

```bash
yarn workspace @nexus/portal dev
# Portal: http://localhost:3000
```

## 共享包

| 包名 | 用途 |
|------|------|
| `@nexus/db` | Prisma ORM + Multi-Schema |
| `@nexus/auth` | Auth.js v5 + Redis Session |
| `@nexus/rbac` | Directus RBAC + 中间件 |
| `@nexus/events` | BullMQ 事件总线 + ID 映射 |
| `@nexus/storage` | MinIO S3 存储 |

## 认证流程

```
1. 用户访问 Portal
2. Portal 检查 Redis Session
3. 无 Session → 重定向登录
4. 登录成功 → 写入 Redis Session + Cookie
5. 访问子系统 iframe
6. 子系统中间件读取 Cookie
7. 验证 Redis Session
8. 返回用户信息
```

## 事件总线

```typescript
// 发布事件
import { publishEvent } from "@nexus/events"

await publishEvent("customer.created", "crm", {
  customerId: "123",
  name: "客户名称",
  email: "customer@example.com",
  tenantId: "tenant-1"
}, { tenantId: "tenant-1", userId: "user-1" })

// 订阅事件
import { onEvent, startEventConsumer } from "@nexus/events"

onEvent("customer.created", async (event) => {
  console.log("新客户:", event.payload)
})

startEventConsumer()
```

## ID 映射

```typescript
import { createIdMapping, getNexusId, getExternalId } from "@nexus/events"

// 创建映射
await createIdMapping(
  "nexus-uuid",    // Nexus 统一 ID
  "crm",           // 子系统
  "nocodb-id-123", // 子系统内部 ID
  "customer",      // 实体类型
  "tenant-1"       // 租户 ID
)

// 查询映射
const nexusId = await getNexusId("crm", "customer", "nocodb-id-123")
const externalId = await getExternalId("nexus-uuid", "customer", "crm")
```

## 环境变量

复制各子系统的 `.env.example` 到 `.env`：

```bash
cp apps/portal/.env.example apps/portal/.env
cp apps/plane/.env.example apps/plane/.env
# ... 其他子系统
```

## 目录结构

```
/
├── apps/
│   ├── portal/          # Next.js 16 主应用
│   ├── plane/           # OKR (Git Subtree)
│   ├── nocodb/          # CRM (Git Subtree)
│   ├── midday/          # Finance (Git Subtree)
│   ├── inventory/       # MedusaJS (Git Subtree)
│   ├── learning/        # ClassroomIO (Git Subtree)
│   └── docs/            # AppFlowy (Git Subtree)
├── packages/
│   ├── db/              # Prisma + PostgreSQL
│   ├── auth/            # Auth.js v5
│   ├── rbac/            # Directus RBAC
│   ├── events/          # BullMQ 事件总线
│   └── storage/         # MinIO S3
├── scripts/
│   ├── init-directus.js
│   ├── init-minio-buckets.sh
│   └── start-services.ps1
└── docker-compose.yml
```

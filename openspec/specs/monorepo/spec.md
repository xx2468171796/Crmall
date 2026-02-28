# Spec: Monorepo 基础设施

## Status: implemented

## 概述
pnpm 10 Monorepo + Turborepo 任务编排，统一管理所有应用和共享包。

## 结构
```
TWCRM/
├── pnpm-workspace.yaml    # workspace 配置
├── turbo.json             # 任务编排
├── tsconfig.base.json     # 共享 TS 配置
├── .env                   # 环境变量
├── apps/
│   ├── portal/            # Next.js 16 主应用 (:3000)
│   └── teable/            # Teable 表格系统 (:3001)
└── packages/
    ├── db/                # Prisma 7 + Multi-Schema
    ├── shared/            # 全局类型/错误类/常量
    └── ui/                # 设计系统/设计令牌
```

## 技术选型
- **包管理**: pnpm 10.x (严禁 yarn/npm/bun)
- **构建编排**: Turborepo
- **TypeScript**: 5.7+ Strict Mode
- **Node.js**: >= 22

## 基础设施
- PostgreSQL 17: `192.168.110.246:5433`
- Redis 7: `192.168.110.246:6379`
- MinIO: `192.168.110.246:9000`

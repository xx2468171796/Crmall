# Change: Bootstrap Enterprise Nexus Monorepo

## Why

Project Enterprise Nexus 是一个 **SaaS + 集团多公司双重架构**系统。需要从零构建企业级 Monorepo 基础架构。

**业务模式**：
- **对外销售**: 系统可卖给多个客户 (租户)，租户间 100% 数据隔离
- **集团管控**: 每个租户内部，集团可查看所有子公司数据

**核心挑战**：
1. **双重隔离**: 租户间绝对隔离 + 租户内集团可跨公司
2. 多个开源系统需要集成到统一 Monorepo
3. 需要共享 PostgreSQL (Multi-Schema)、Redis、MinIO 基础设施
4. 需要统一的身份认证和权限控制
5. 需要 Portal 作为主控台承载所有子系统

**为什么现在做**：
- 技能规范已就位，可以开始实施
- 基础设施 (PG/Redis/MinIO) 已部署就绪
- 需要 MVP 验证架构可行性

## What Changes

### Phase 1: Monorepo Foundation (本提案范围)
- **monorepo-setup**: Yarn v4 Workspaces + Turborepo 配置
- **shared-packages**: 6 个共享包 (ui, db, redis, storage, auth, tailwind-config)
- **portal-shell**: Portal 主控台骨架 (App Shell + 动态菜单)
- **auth-system**: Auth.js v5 + Redis Session + Directus RBAC 集成
- **organization**: 组织架构 (集团 → 公司 → 部门 → 小组 → 员工) + 数据范围

### Phase 2: Sub-system Integration (后续提案)
- NocoDB (CRM) 源码集成
- Plane (OKR) 源码集成
- 其他子系统

### Phase 3: Advanced Features (后续提案)
- AI Copilot
- Global Search (Cmd+K)
- 业务自动化流转

## Impact

### Affected Structure
```
/ (new)
├── package.json              # Yarn Workspaces root
├── turbo.json                # Turborepo config
├── docker-compose.yml        # Infrastructure
├── apps/
│   └── portal/               # Next.js 16 主控台
│       ├── package.json
│       ├── next.config.ts
│       └── src/
│           ├── app/          # App Router
│           ├── components/   # Atomic Design
│           ├── actions/      # Server Actions
│           └── lib/          # Utilities
├── packages/
│   ├── ui/                   # Shadcn UI (Zinc Theme)
│   ├── db/                   # Prisma Client (Multi-Schema)
│   ├── redis/                # ioredis + BullMQ
│   ├── storage/              # MinIO S3 Client
│   ├── auth/                 # Auth.js config
│   └── tailwind-config/      # Shared Tailwind preset
└── src-tauri/                # Tauri v2 (Desktop)
```

### Existing Code Impact
- 当前 `src/` 目录将迁移至 `apps/portal/src/`
- 现有 skills 和 openspec 保持不变

## Dependencies

### Infrastructure (已就绪)
- PostgreSQL v17: `192.168.110.246:5433/crmall0125`
- Redis v7: `192.168.110.246:6379`
- MinIO: `192.168.110.246:9000`

### External Services
- Directus (RBAC Engine) - 需要部署
- Auth Provider (可选 OAuth) - 按需配置

## Success Criteria

1. `yarn install` 在根目录成功执行
2. `yarn dev` 启动 Portal (with `--turbo`)
3. Portal 显示动态菜单 (从 Directus 获取)
4. 用户可通过 Auth.js 登录
5. Session 存储在 Redis 中
6. 所有共享包可被 Portal 正确导入

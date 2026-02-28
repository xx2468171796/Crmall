## Context
CRMALL 是一个企业级超级应用，采用 Next.js 16 + Tauri v2 架构。需要建立一套跨模块的核心能力规范，确保 Portal、CRM、OKR、Finance 等子系统在开发时遵循统一标准。

### 约束条件
- 严禁使用 API Routes，必须使用 Server Actions
- UI 组件必须基于 shadcn/ui
- 状态管理：UI 状态用 Zustand，服务端数据用 TanStack Query
- 数据库操作必须通过 Prisma
- 文件操作必须通过 Tauri Rust Commands

## Goals / Non-Goals

### Goals
- 建立 7 个核心能力的明确规范
- 每个规范包含可验证的场景和验收标准
- 规范支持 AI 辅助开发时的自动评估

### Non-Goals
- 不包含具体的代码实现
- 不涉及子系统特定的业务逻辑
- 不定义 UI 的视觉设计细节

## Decisions

### Decision 1: 认证架构
- **选择**: Auth.js v5 + Directus RBAC
- **理由**: Auth.js 原生支持 Next.js App Router，Directus 提供可视化权限管理
- **替代方案**: 自建 JWT 系统（复杂度高，维护成本大）

### Decision 2: 组件架构
- **选择**: Atomic Design (atoms/molecules/organisms)
- **理由**: 提高组件复用性，限制单组件复杂度
- **替代方案**: 无明确层级（导致巨型组件）

### Decision 3: 数据库访问模式
- **选择**: Repository Pattern + Prisma
- **理由**: 抽象数据访问层，便于测试和替换
- **替代方案**: 直接在 Server Actions 中使用 Prisma（耦合过紧）

### Decision 4: 功能评估流程
- **选择**: OpenSpec 驱动的提案流程
- **理由**: 确保新功能经过设计评审再开发
- **替代方案**: 直接开发（缺乏规范，质量难保证）

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 规范过于严格导致开发效率降低 | 提供脚手架工具自动生成模板 |
| 多子系统权限冲突 | 使用 Directus 统一管理，定义清晰的 Schema 隔离 |
| Tauri 桌面端与 Web 端行为不一致 | 抽象通用接口，条件编译处理差异 |

## Migration Plan
1. 先建立规范文档（本提案）
2. 创建代码模板和脚手架
3. 逐步迁移现有代码符合规范
4. 在 CI 中加入规范检查

## Open Questions
- [ ] 是否需要为每个子系统定义独立的权限 Schema？
- [ ] 测试覆盖率目标是多少？

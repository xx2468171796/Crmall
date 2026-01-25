# Change: 添加核心能力规范 (Core Capabilities)

## Why
CRMALL 项目需要建立一套完整的基础能力规范，确保开发过程中有明确的技术标准和行为准则。这些规范将作为所有子系统开发的基础，保证代码质量、安全性和一致性。

采用 **Anthropic Skills 模式**，为 AI 助手提供可调用的技能规范，实现开发前的自动评估和规范遵循。

## What Changes
- **auth**: 用户登录注册系统规范 → `skills/auth/SKILL.md`
- **ui-components**: 页面 UI 组件设计规范 → `skills/ui-components/SKILL.md`
- **rbac**: 全局角色权限管理规范 → `skills/rbac/SKILL.md`
- **feature-evaluation**: 新功能评估流程规范 → `skills/feature-evaluation/SKILL.md`
- **db-operations**: 数据库操作规范 → `skills/db-operations/SKILL.md`
- **build-standards**: 打包构建规范 → `skills/build-standards/SKILL.md`
- **testing**: 测试规范 → `skills/testing/SKILL.md`
- **skill-creator**: 技能创建指南 → `skills/skill-creator/SKILL.md`
- **ui-ux-pro-max**: UI/UX 设计智能 → `skills/ui-ux-pro-max/SKILL.md`

## Impact
- **Affected specs**: 新增 7 个核心能力规范
- **Affected code**: 
  - `src/actions/` - Server Actions
  - `src/components/` - UI 组件库
  - `src/lib/` - 工具函数
  - `src/schemas/` - Zod Schemas
  - `prisma/schema.prisma` - 数据库模型
  - `src-tauri/` - Tauri 构建配置

## Dependencies
- PostgreSQL v17 (192.168.110.246:5433)
- Redis v7 (192.168.110.246:6379)
- MinIO (192.168.110.246:9000)
- Auth.js v5
- Directus (RBAC Engine)

## Success Criteria
1. 所有规范通过 `openspec validate --strict` 验证
2. 每个规范至少包含一个可验证的场景 (Scenario)
3. 规范与现有技术栈约束一致

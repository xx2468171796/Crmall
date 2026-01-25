## ADDED Requirements

### Requirement: OpenSpec Proposal Workflow
所有新功能开发必须经过 OpenSpec 提案流程。功能 SHALL 在编码前完成设计评审。

#### Scenario: 创建新功能提案
- **WHEN** 开发者需要添加新功能
- **THEN** 必须使用 `/openspec-proposal` workflow
- **AND** 创建 `proposal.md` 说明为什么和做什么
- **AND** 创建 `tasks.md` 列出实施步骤
- **AND** 可选创建 `design.md` 记录技术决策

#### Scenario: 跳过提案的情况
- **WHEN** 修改为 Bug 修复、Typo、格式化
- **THEN** 可以直接提交代码
- **AND** 在 Commit Message 中说明修复内容

### Requirement: Pre-Development Checklist
开发前必须评估技术约束。开发者 SHALL 检查以下规则。

#### Scenario: 技术栈检查
- **WHEN** 开始编写代码
- **THEN** 检查是否符合以下约束:
  - 使用 Server Actions 而非 API Routes
  - UI 组件使用 shadcn/ui
  - 状态管理遵循 Zustand (UI) + TanStack Query (Server) 分离
  - 数据库操作通过 Prisma
  - 文件操作通过 Tauri Rust Command

#### Scenario: 架构原则检查
- **WHEN** 编写组件代码
- **THEN** 检查是否符合:
  - 原子化设计 (Atomic Design)
  - 单一职责原则 (SRP)
  - DRY 原则
  - YAGNI 原则

### Requirement: AI Skill Invocation
AI 助手 SHALL 在开发前评估规则并调用对应能力。

#### Scenario: 自动规则评估
- **WHEN** AI 接收开发任务
- **THEN** 首先读取 `openspec/project.md` 了解项目约束
- **AND** 检查 `openspec/specs/` 中的相关规范
- **AND** 确认任务不违反技术约束

#### Scenario: 能力匹配
- **WHEN** 任务涉及特定领域
- **THEN** AI 调用对应的能力规范:
  - 登录注册 → `specs/auth`
  - UI 组件 → `specs/ui-components`
  - 权限控制 → `specs/rbac`
  - 数据库 → `specs/db-operations`
  - 测试 → `specs/testing`

### Requirement: Change Impact Assessment
重大变更 SHALL 评估影响范围。

#### Scenario: 破坏性变更
- **WHEN** 变更涉及 API/Schema 改动
- **THEN** 必须在 `proposal.md` 中标记 **BREAKING**
- **AND** 说明迁移方案
- **AND** 评估影响的下游系统

## ADDED Requirements

### Requirement: Skill Structure
技能 SHALL 遵循标准目录结构，包含 SKILL.md 和可选的资源文件夹。

#### Scenario: 创建新技能
- **WHEN** 需要创建新技能
- **THEN** 创建 `skills/<skill-name>/` 目录
- **AND** 包含 `SKILL.md` 文件
- **AND** 可选包含 `scripts/`、`references/`、`assets/` 目录

#### Scenario: SKILL.md 格式
- **WHEN** 编写 SKILL.md
- **THEN** 包含 YAML frontmatter (name, description)
- **AND** 包含 Markdown 格式的指令内容
- **AND** description 清晰描述触发场景

### Requirement: Skill Naming
技能命名 SHALL 使用 kebab-case 格式，清晰描述技能用途。

#### Scenario: 命名规范
- **WHEN** 为技能命名
- **THEN** 使用 kebab-case (如 `auth`, `ui-components`)
- **AND** 动词开头优先 (如 `build-`, `test-`, `create-`)
- **AND** 名称反映技能核心功能

### Requirement: Progressive Disclosure
技能 SHALL 使用渐进披露模式，避免上下文窗口污染。

#### Scenario: 内容分层
- **WHEN** 技能内容超过 500 行
- **THEN** 将详细内容拆分到 `references/` 目录
- **AND** 在 SKILL.md 中引用并说明何时加载

#### Scenario: 资源加载
- **WHEN** AI 执行技能
- **THEN** 首先加载 SKILL.md 核心内容
- **AND** 按需加载 references 文件
- **AND** 不加载 assets 到上下文

### Requirement: Project Integration
技能 SHALL 与 CRMALL 项目规范和 OpenSpec 系统集成。

#### Scenario: 技术约束遵循
- **WHEN** 技能包含代码示例
- **THEN** 遵循 Server Actions 模式
- **AND** 使用 shadcn/ui 组件
- **AND** 使用 Tailwind CSS 样式
- **AND** 使用 Prisma 数据库操作

#### Scenario: OpenSpec 对应
- **WHEN** 技能对应特定能力
- **THEN** 在 `openspec/specs/<capability>/` 有对应规范
- **AND** 保持技能与规范同步

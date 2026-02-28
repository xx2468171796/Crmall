## ADDED Requirements

### Requirement: Skill Generalization
通用技能 SHALL 移除项目特定配置，保持可跨项目复用。

#### Scenario: 移除数据库连接信息
- **WHEN** 抽取 db-operations 技能
- **THEN** 移除具体的数据库 Host/Port/Database
- **AND** 使用占位符 `<your-database-url>`

#### Scenario: 移除项目路径
- **WHEN** 抽取包含项目路径的技能
- **THEN** 使用通用路径描述 (`src/`, `prisma/`)
- **AND** 移除 CRMALL 特定的目录结构

### Requirement: Agent Skills Compliance
所有技能 SHALL 符合 Agent Skills 开放标准。

#### Scenario: SKILL.md 格式
- **WHEN** 创建或修改技能
- **THEN** 包含 YAML frontmatter (name, description)
- **AND** name 使用 kebab-case
- **AND** description 描述功能和触发场景

#### Scenario: 目录结构
- **WHEN** 组织技能文件
- **THEN** 遵循 `skill-name/SKILL.md` 结构
- **AND** 可选包含 `scripts/`, `references/`, `assets/`

### Requirement: Skill Independence
每个技能 SHALL 独立可用，不依赖其他技能。

#### Scenario: 无交叉依赖
- **WHEN** 技能引用其他资源
- **THEN** 只引用自身目录下的文件
- **AND** 不依赖项目特定的配置

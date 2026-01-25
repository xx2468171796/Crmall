---
name: skill-creator
description: 创建和管理 AI 技能的指南。当需要为 CRMALL 项目创建新技能、更新现有技能、或扩展 AI 助手能力时使用此技能。包含技能结构、编写规范、验证流程。
---

# 技能创建器 (Skill Creator)

创建高质量技能的完整指南，适配 CRMALL 项目规范。

## 什么是技能 (Skills)

技能是模块化的、自包含的知识包，通过提供专业领域的工作流、工具集成和业务知识来扩展 AI 助手的能力。

### 技能提供的能力

1. **专业工作流** - 特定领域的多步骤流程
2. **工具集成** - 与特定文件格式或 API 的交互指南
3. **领域专业知识** - 项目特定的业务逻辑和规范
4. **可复用资源** - 脚本、参考文档、模板资产

## 技能目录结构

```
skills/<skill-name>/
├── SKILL.md (必需)
│   ├── YAML frontmatter (name, description)
│   └── Markdown 指令内容
└── Bundled Resources (可选)
    ├── scripts/      - 可执行脚本
    ├── references/   - 参考文档 (按需加载)
    └── assets/       - 模板和资产文件
```

## 核心原则

### 1. 简洁优先

Context Window 是公共资源。只添加 AI 不具备的知识。

**默认假设**: AI 已经非常聪明，只需提供非显而易见的信息。

### 2. 渐进披露

三级加载系统：

| 层级 | 内容 | 加载时机 |
|------|------|----------|
| 元数据 | name + description | 始终在上下文 |
| SKILL.md | 核心指令 | 触发时加载 |
| 资源文件 | scripts/references/assets | 按需加载 |

### 3. 适度自由度

| 场景 | 自由度 | 表达方式 |
|------|--------|----------|
| 多种方法都可行 | 高 | 文本指南 |
| 有首选模式 | 中 | 伪代码/带参数脚本 |
| 操作脆弱/必须一致 | 低 | 具体脚本/严格模板 |

## 创建技能流程

### Step 1: 明确使用场景

回答关键问题：

- 这个技能用于什么任务？
- 什么触发词应该激活此技能？
- 有哪些具体的使用示例？

### Step 2: 规划可复用内容

分析每个使用场景：

| 场景 | 可复用内容 |
|------|------------|
| 重复编写相同代码 | → `scripts/` 脚本 |
| 需要参考文档 | → `references/` 文档 |
| 需要模板/资产 | → `assets/` 资源 |

### Step 3: 创建目录结构

```bash
# 创建技能目录
mkdir -p skills/<skill-name>/{scripts,references,assets}

# 创建 SKILL.md
touch skills/<skill-name>/SKILL.md
```

### Step 4: 编写 SKILL.md

#### Frontmatter (必需)

```yaml
---
name: <skill-name>
description: <完整描述技能功能和触发场景>
---
```

**description 要求**:
- 包含技能做什么
- 包含什么时候使用
- 包含具体触发场景

#### Body (必需)

- 使用命令式语气
- 保持在 500 行以内
- 复杂内容拆分到 references/

### Step 5: 添加资源文件

#### scripts/ - 可执行脚本

```python
# scripts/example.py
"""
用途: [描述脚本功能]
用法: python scripts/example.py --arg value
"""
```

#### references/ - 参考文档

```markdown
# references/api-docs.md

## 目录
- API 端点
- 数据模型
- 错误码
```

#### assets/ - 模板资源

用于输出的模板文件（不加载到上下文）。

### Step 6: 验证技能

检查清单：

- [ ] SKILL.md 有完整的 frontmatter
- [ ] description 清晰描述触发场景
- [ ] 内容不超过 500 行
- [ ] 引用的资源文件存在
- [ ] 符合 CRMALL 项目规范

## CRMALL 技能规范

### 技能命名

- 使用 kebab-case: `auth`, `ui-components`, `db-operations`
- 动词开头优先: `build-`, `test-`, `create-`

### 与 OpenSpec 集成

技能应与 OpenSpec 规范对应：

```
openspec/specs/<capability>/spec.md  ←→  skills/<skill-name>/SKILL.md
```

### 技术约束遵循

所有技能必须遵循项目约束：

- ✅ Server Actions (非 API Routes)
- ✅ shadcn/ui 组件
- ✅ Tailwind CSS 样式
- ✅ Prisma 数据库操作
- ✅ Zod 验证

## 示例技能

### 简单技能

```markdown
---
name: commit-message
description: 生成规范的 Git commit 消息。当需要提交代码时使用。
---

# Commit Message 技能

生成符合 Conventional Commits 规范的提交消息。

## 格式

```
type(scope): message
```

## 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 重构
- `docs`: 文档
- `chore`: 杂项
```

### 复杂技能

```markdown
---
name: api-integration
description: 外部 API 集成指南。当需要对接第三方服务（微信、支付宝、钉钉等）时使用。
---

# API 集成技能

## 快速开始

[核心流程]

## 详细文档

- **微信集成**: 见 `references/wechat.md`
- **支付宝集成**: 见 `references/alipay.md`
- **钉钉集成**: 见 `references/dingtalk.md`
```

## 参考文档

- **工作流模式**: 见 `references/workflows.md`
- **输出模式**: 见 `references/output-patterns.md`

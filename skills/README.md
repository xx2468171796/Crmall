# CRMALL Skills

基于 [Agent Skills](https://agentskills.io/) 开放标准构建的技能库，为 AI 助手提供专业领域知识和工作流。

## 技能列表

| 技能 | 描述 | 触发场景 |
|------|------|----------|
| [`auth`](./auth/SKILL.md) | 用户认证与会话管理 | 登录、注册、登出、OAuth、Session |
| [`ui-components`](./ui-components/SKILL.md) | UI 组件开发规范 | 页面、组件、表单、表格 |
| [`rbac`](./rbac/SKILL.md) | 角色权限控制 | 权限检查、菜单授权、路由守卫 |
| [`feature-evaluation`](./feature-evaluation/SKILL.md) | 功能评估流程 | 新功能开发前评估 |
| [`db-operations`](./db-operations/SKILL.md) | 数据库操作规范 | Prisma、CRUD、事务、迁移 |
| [`build-standards`](./build-standards/SKILL.md) | 打包构建规范 | Turbopack、Docker、Tauri |
| [`testing`](./testing/SKILL.md) | 测试规范 | 单元测试、E2E、覆盖率 |
| [`skill-creator`](./skill-creator/SKILL.md) | 技能创建指南 | 创建新技能 |
| [`ui-ux-pro-max`](./ui-ux-pro-max/SKILL.md) | UI/UX 设计智能 | 设计、风格、配色、字体 |

## 技能工作原理

```
┌─────────────────────────────────────────────────────────────────┐
│  1. 发现 (Discovery)                                            │
│     AI 启动时加载所有技能的 name 和 description                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. 激活 (Activation)                                           │
│     当任务匹配技能描述时，加载完整 SKILL.md 指令                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. 执行 (Execution)                                            │
│     AI 按指令执行，按需加载 scripts/references/assets             │
└─────────────────────────────────────────────────────────────────┘
```

## 技能结构

每个技能遵循以下目录结构：

```
skill-name/
├── SKILL.md           # 必需：技能指令 + 元数据
├── scripts/           # 可选：可执行脚本
├── references/        # 可选：参考文档
└── assets/            # 可选：模板、资源
```

## 渐进式披露

| 层级 | 内容 | Token 预算 | 加载时机 |
|------|------|------------|----------|
| 元数据 | name + description | ~100 | 始终加载 |
| 指令 | SKILL.md body | <5000 | 激活时加载 |
| 资源 | scripts/references/assets | 无限制 | 按需加载 |

## 使用方式

### 在 Claude/Windsurf 中

技能会自动根据任务描述激活。例如：

```
用户: "帮我创建一个登录页面"
AI: [自动激活 auth + ui-components + ui-ux-pro-max 技能]
```

### 手动引用

```
请使用 skills/auth 技能帮我实现用户注册功能
```

## 创建新技能

使用 `skill-creator` 技能来创建新技能：

```
请使用 skill-creator 技能帮我创建一个 [功能描述] 的技能
```

## 规范参考

- [Agent Skills 官方文档](https://agentskills.io/)
- [规范详情](https://agentskills.io/specification)
- [示例技能](https://github.com/anthropics/skills)

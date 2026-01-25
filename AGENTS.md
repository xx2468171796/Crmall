<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

<!-- SKILLS:START -->
# Agent Skills

本项目使用 [Agent Skills](https://agentskills.io/) 开放标准为 AI 助手提供专业能力。

## 技能发现

所有技能位于 `skills/` 目录。在执行任务前，根据任务类型激活相应技能：

| 任务类型 | 激活技能 |
|----------|----------|
| 登录、注册、认证 | `skills/auth/SKILL.md` |
| 页面、组件、表单 | `skills/ui-components/SKILL.md` |
| 权限、菜单、守卫 | `skills/rbac/SKILL.md` |
| 新功能开发 | `skills/feature-evaluation/SKILL.md` (必须先评估) |
| 数据库、Prisma | `skills/db-operations/SKILL.md` |
| 构建、部署 | `skills/build-standards/SKILL.md` |
| 测试 | `skills/testing/SKILL.md` |
| 创建新技能 | `skills/skill-creator/SKILL.md` |
| UI/UX 设计 | `skills/ui-ux-pro-max/SKILL.md` |

## 技能使用流程

1. **分析任务** - 确定任务涉及的领域
2. **激活技能** - 读取对应的 SKILL.md
3. **遵循指令** - 按技能中的流程和规范执行
4. **按需加载** - 需要时读取 references/ 中的详细文档

## 重要规则

- **开发前必须评估** - 使用 `feature-evaluation` 技能检查约束
- **UI 必须用 shadcn** - 使用 `ui-components` + `ui-ux-pro-max` 技能
- **数据库操作规范** - 使用 `db-operations` 技能中的 Repository 模式

<!-- SKILLS:END -->
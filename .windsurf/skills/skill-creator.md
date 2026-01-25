---
description: 创建和管理 AI 技能的指南。当需要为 CRMALL 项目创建新技能、更新现有技能、或扩展 AI 助手能力时使用此技能。包含技能结构、编写规范、验证流程。
---

# 技能创建器

阅读 `skills/skill-creator/SKILL.md` 获取完整指南。

## 快速参考

### 技能结构
```
skills/<skill-name>/
├── SKILL.md           # 必需
├── scripts/           # 可选
├── references/        # 可选
└── assets/            # 可选
```

### SKILL.md 格式
```yaml
---
name: skill-name
description: 描述做什么 + 什么时候用
---

# 技能标题

指令内容...
```

### 创建流程
1. 明确使用场景
2. 规划可复用内容
3. 创建目录结构
4. 编写 SKILL.md
5. 添加资源文件
6. 验证技能

### 命名规范
- 使用 kebab-case
- 动词开头优先
- 如: `auth`, `ui-components`, `db-operations`

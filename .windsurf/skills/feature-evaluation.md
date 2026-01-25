---
description: 新功能评估技能。在开始任何新功能开发前使用此技能，评估技术约束、检查架构原则、确认是否需要 OpenSpec 提案。确保开发符合项目规范。
---

# 功能评估技能

阅读 `skills/feature-evaluation/SKILL.md` 获取完整指南。

## 开发前必须检查

### 技术约束
| 检查项 | 规则 |
|--------|------|
| 后端逻辑 | ✅ Server Actions，❌ API Routes |
| UI 组件 | ✅ shadcn/ui，❌ 原生 HTML |
| 样式 | ✅ Tailwind CSS，❌ CSS 文件 |
| 状态管理 | ✅ Zustand (UI) + TanStack Query (Server) |
| 数据库 | ✅ Prisma，❌ 直接 SQL |
| 文件操作 | ✅ Tauri Command，❌ Node.js fs |

### 是否需要 OpenSpec 提案？
- Bug 修复 → 直接修复
- 新功能 → 创建提案
- 破坏性变更 → 创建提案 + BREAKING 标记
- 不确定 → 创建提案

### 能力匹配
| 任务类型 | 调用技能 |
|----------|----------|
| 登录注册 | `/auth` |
| UI 组件 | `/ui-components` |
| 权限控制 | `/rbac` |
| 数据库 | `/db-operations` |
| 测试 | `/testing` |

---
description: UI 组件开发技能。在需要创建页面、组件、表单、表格、弹窗等 UI 元素时使用此技能。基于 shadcn/ui + Tailwind CSS v4 + React 19 + 原子化设计模式。
---

# UI 组件技能

阅读 `skills/ui-components/SKILL.md` 获取完整指南。

## 快速参考

### 组件层级
```
src/components/
├── ui/           # Atoms - shadcn 基础组件
├── shared/       # Molecules - 业务通用组件
└── features/     # Organisms - 特定业务模块
```

### 必用组件
```bash
npx shadcn@latest add button input card form dialog table toast
```

### 约束
- ❌ 禁止手写原生 HTML 按钮/输入框
- ❌ 禁止创建 .css 文件
- ❌ 组件不超过 150 行
- ✅ 使用 shadcn/ui
- ✅ 使用 Tailwind CSS
- ✅ 使用 Lucide React 图标

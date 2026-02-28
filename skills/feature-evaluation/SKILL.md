---
name: feature-evaluation
description: 新功能评估技能。在开始任何新功能开发前使用此技能，评估技术约束、检查架构原则、确认是否需要 OpenSpec 提案。确保开发符合 OOP 分层架构和项目规范。
---

# 功能评估技能 (Feature Evaluation Skill)

在开始编写任何代码之前，必须执行此评估流程。

## 评估流程

### Step 1: 意图分析

回答以下问题：

1. **任务类型**：UI 还是逻辑？
2. **涉及哪个模块**：ordering / crm / inventory / finance / okr / docs / lms？
3. **是否需要多租户隔离**：业务数据必须带 tenantId
4. **是否需要实时推送**：状态变更是否需要 WebSocket 通知
5. **是否需要提案**：
   - 新功能/能力 → 需要 OpenSpec 提案
   - Bug 修复/Typo → 直接修复

### Step 2: 技术约束检查

| 检查项 | 规则 |
|--------|------|
| 后端逻辑 | ✅ Server Actions，❌ API Routes |
| UI 组件 | ✅ shadcn/ui，❌ 原生 HTML |
| 样式 | ✅ Tailwind CSS v4，❌ CSS 文件 |
| 状态管理 | ✅ Zustand (UI) + TanStack Query (Server) + Nuqs (URL) |
| 数据库 | ✅ Prisma 7 + Repository 模式，❌ 直接在组件中写 Prisma |
| 类型安全 | ✅ TypeScript Strict + Zod，❌ any |
| 包管理 | ✅ pnpm，❌ yarn / npm / bun |
| 文案 | ✅ useTranslations() (i18n)，❌ 硬编码中文/英文 |
| 权限 | ✅ auth() + checkPermission()，❌ 跳过校验 |

### Step 3: 架构原则检查

- [ ] **OOP 分层**：是否遵循 Component → Hook → Service → Repository？
- [ ] **接口定义**：Service/Repository 是否先定义接口（IXxxService）？
- [ ] **单一职责**：UI 组件是否只负责展示？
- [ ] **多租户**：业务查询是否带 tenantId？
- [ ] **DRY**：是否有重复逻辑需要抽离？
- [ ] **YAGNI**：是否只实现当前需求？
- [ ] **KISS**：实现是否足够简单？

### Step 4: 能力匹配

根据任务类型，调用对应的技能规范：

| 任务类型 | 调用技能 |
|----------|----------|
| 登录注册相关 | `skills/auth` |
| UI 组件开发 | `skills/ui-components` |
| 权限控制 | `skills/rbac` |
| 数据库操作 | `skills/db-operations` |
| WebSocket 实时 | `skills/websocket` |
| 国际化 | `skills/i18n` |
| 构建部署 | `skills/build-standards` |
| 测试相关 | `skills/testing` |
| 数据库查询 | `skills/db-browser` |

## OpenSpec 提案决策树

```
收到开发请求
├─ Bug 修复（恢复预期行为）？ → 直接修复
├─ Typo/格式/注释？ → 直接修复
├─ 依赖更新（非破坏性）？ → 直接修复
├─ 新功能/能力？ → 创建提案
├─ 破坏性变更？ → 创建提案 + 标记 BREAKING
├─ 架构变更？ → 创建提案 + design.md
└─ 不确定？ → 创建提案（更安全）
```

## 开发前 Checklist

```markdown
- [ ] 已确认涉及的业务模块
- [ ] 已确认是否需要多租户隔离
- [ ] 已确认是否需要 WebSocket 推送
- [ ] 已确认不违反技术约束
- [ ] 已选择正确的技能规范
- [ ] 已确认是否需要 OpenSpec 提案
- [ ] 使用 Server Actions（非 API Routes）
- [ ] 使用 Repository 模式（非直接 Prisma）
- [ ] 使用 i18n（非硬编码文案）
- [ ] 使用 Zod 验证输入
```

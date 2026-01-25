---
name: feature-evaluation
description: 新功能评估技能。在开始任何新功能开发前使用此技能，评估技术约束、检查架构原则、确认是否需要 OpenSpec 提案。确保开发符合项目规范。
---

# 功能评估技能 (Feature Evaluation Skill)

在开始编写任何代码之前，必须执行此评估流程。

## 评估流程

### Step 1: 意图分析

回答以下问题：

1. **任务类型**：UI 还是逻辑？
2. **涉及本地操作**：是否需要文件系统/Shell？
   - 是 → 必须使用 Tauri Rust Command
3. **是否需要提案**：
   - 新功能/能力 → 需要 OpenSpec 提案
   - Bug 修复/Typo → 直接修复

### Step 2: 技术约束检查

| 检查项 | 规则 |
|--------|------|
| 后端逻辑 | ✅ Server Actions，❌ API Routes |
| UI 组件 | ✅ shadcn/ui，❌ 原生 HTML |
| 样式 | ✅ Tailwind CSS，❌ CSS 文件 |
| 状态管理 | ✅ Zustand (UI) + TanStack Query (Server) |
| 数据库 | ✅ Prisma，❌ 直接 SQL |
| 文件操作 | ✅ Tauri Command，❌ Node.js fs |
| 类型安全 | ✅ TypeScript Strict，❌ any |

### Step 3: 架构原则检查

- [ ] **原子化设计**：组件是否拆分为 atoms/molecules/organisms？
- [ ] **单一职责**：UI 组件是否只负责展示？
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
| 构建部署 | `skills/build-standards` |
| 测试相关 | `skills/testing` |

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

## 创建提案流程

1. **检查现有规范**
   ```bash
   openspec list --specs
   openspec list
   ```

2. **创建提案目录**
   ```bash
   mkdir -p openspec/changes/<change-id>/specs/<capability>
   ```

3. **编写提案文件**
   - `proposal.md` - 为什么、做什么、影响范围
   - `tasks.md` - 实施步骤清单
   - `design.md` - 技术决策（可选）
   - `specs/<capability>/spec.md` - 规范变更

4. **验证提案**
   ```bash
   openspec validate <change-id> --strict
   ```

## 预开发检查清单

```markdown
## 开发前检查

- [ ] 已阅读 openspec/project.md
- [ ] 已检查相关 openspec/specs/
- [ ] 已确认不违反技术约束
- [ ] 已选择正确的技能规范
- [ ] 已确认是否需要提案

## 技术约束确认

- [ ] 使用 Server Actions（非 API Routes）
- [ ] 使用 shadcn/ui 组件
- [ ] 使用 Tailwind CSS 样式
- [ ] 使用 Zod 验证输入
- [ ] 使用 Prisma 操作数据库
- [ ] 使用环境变量存储敏感信息
```

## 变更影响评估

对于重大变更，必须评估：

1. **影响的规范**：哪些 specs 需要更新？
2. **影响的代码**：哪些文件/模块受影响？
3. **破坏性变更**：是否影响现有 API/Schema？
4. **迁移方案**：如何处理历史数据/兼容性？

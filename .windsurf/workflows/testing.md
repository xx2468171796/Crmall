---
description: 测试规范技能。在需要编写单元测试、集成测试、E2E 测试、组件测试时使用此技能。基于 Vitest + Playwright + React Testing Library。
---

阅读 `skills/testing/SKILL.md` 获取完整指南。

## 快速参考

### 运行测试
```bash
yarn test           # 单元测试
yarn test --watch   # 监听模式
yarn test --coverage # 覆盖率
yarn playwright test # E2E
```

### 测试文件位置
```
src/lib/utils.ts      → src/lib/utils.test.ts
src/actions/create.ts → src/actions/create.test.ts
tests/e2e/            → E2E 测试
```

### 覆盖率要求
| 模块类型 | 最低覆盖率 |
|----------|------------|
| 工具函数 | 90% |
| Zod Schemas | 90% |
| Server Actions | 70% |
| UI 组件 | 50% |

### 约束
- ✅ 测试文件就近放置
- ✅ Mock 外部依赖
- ✅ 测试隔离
- ✅ 清晰的测试名称

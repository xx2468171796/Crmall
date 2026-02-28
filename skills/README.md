# TWCRM Skills

基于 [Agent Skills](https://agentskills.io/) 开放标准构建的技能库，为 AI 助手提供专业领域知识和工作流。

## 技能列表

| 技能 | 描述 | 触发场景 |
|------|------|----------|
| [`config-service`](./config-service/SKILL.md) | 系统配置服务 | 读取/写入配置、可配置化参数、ConfigService 使用 |
| [`oop-template`](./oop-template/SKILL.md) | OOP 模块脚手架 | 创建新模块/新实体、DI 工厂注册、分层架构模板 |
| [`auth`](./auth/SKILL.md) | 用户认证与会话管理 | 登录、注册、登出、OAuth、Session |
| [`rbac`](./rbac/SKILL.md) | 角色权限控制 | 权限检查、菜单授权、路由守卫、多租户隔离 |
| [`db-operations`](./db-operations/SKILL.md) | 数据库操作规范 | Prisma 7、CRUD、事务、Multi-Schema、Repository |
| [`db-browser`](./db-browser/SKILL.md) | 数据库浏览器 | 查看表结构、查询数据、执行 SQL（Windows 本地） |
| [`ui-components`](./ui-components/SKILL.md) | UI 组件开发规范 | 页面、组件、表单、表格 |
| [`ui-ux-pro-max`](./ui-ux-pro-max/SKILL.md) | UI/UX 设计智能 | 设计、风格、配色、字体 |
| [`websocket`](./websocket/SKILL.md) | WebSocket 实时系统 | 事件推送、房间管理、实时通知 |
| [`i18n`](./i18n/SKILL.md) | 国际化 | 多语言、语言切换、翻译文件 |
| [`feature-evaluation`](./feature-evaluation/SKILL.md) | 功能评估流程 | 新功能开发前评估 |
| [`build-standards`](./build-standards/SKILL.md) | 打包构建规范 | Turbopack、pnpm、Docker |
| [`testing`](./testing/SKILL.md) | 测试规范 | 单元测试、E2E、覆盖率 |
| [`skill-creator`](./skill-creator/SKILL.md) | 技能创建指南 | 创建新技能 |

## 技术栈

- **框架**: Next.js 16 (App Router + Turbopack)
- **语言**: TypeScript 5.7+ 严格模式
- **包管理**: pnpm 10.x (严禁 yarn/npm/bun)
- **ORM**: Prisma 7 (PostgreSQL 17, Multi-Schema)
- **认证**: Auth.js v5 (自建)
- **权限**: 自建 RBAC (行级多租户隔离)
- **CSS**: Tailwind CSS 4.2 + Shadcn UI
- **实时**: Socket.IO + Redis Pub/Sub
- **i18n**: next-intl (zh-CN 默认)

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
│     AI 按指令执行，按需加载 references/assets                     │
└─────────────────────────────────────────────────────────────────┘
```

## 使用方式

### 自动激活

技能会自动根据任务描述激活。例如：

```
用户: "帮我创建订货页面"
AI: [自动激活 ui-components + i18n + feature-evaluation 技能]
```

### 手动引用

```
请使用 skills/websocket 技能帮我实现订单实时通知
```

## 创建新技能

使用 `skill-creator` 技能来创建新技能：

```
请使用 skill-creator 技能帮我创建一个 [功能描述] 的技能
```

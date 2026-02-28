# Spec: Monorepo Setup

## Capability
`monorepo-setup` - Yarn v4 Workspaces + Turborepo 配置

## ADDED Requirements

### Requirement: Yarn Workspaces 根配置
**Priority**: P0
**Rationale**: 所有子应用和共享包依赖管理的基础

#### Scenario: 初始化 Monorepo
**Given** 空的项目根目录
**When** 执行 `yarn install`
**Then** 
- 生成 `node_modules/` 目录
- 所有 workspace 包正确链接
- 无依赖冲突错误

#### Scenario: 添加跨包依赖
**Given** `apps/portal` 需要使用 `@nexus/ui`
**When** 执行 `yarn workspace @nexus/portal add @nexus/ui`
**Then**
- `apps/portal/package.json` 添加 `"@nexus/ui": "workspace:*"`
- 可正常 import 组件

---

### Requirement: Turborepo 任务缓存
**Priority**: P0
**Rationale**: 加速开发和 CI 构建

#### Scenario: 缓存命中
**Given** 已执行过 `yarn build` 且代码未变更
**When** 再次执行 `yarn build`
**Then**
- 输出 `>>> FULL TURBO`
- 构建时间 < 1秒

#### Scenario: 依赖变更触发重建
**Given** 修改了 `packages/ui/src/button.tsx`
**When** 执行 `yarn build`
**Then**
- `@nexus/ui` 重新构建
- 依赖 `@nexus/ui` 的 `apps/portal` 重新构建
- 未依赖的包跳过

---

### Requirement: 开发脚本规范
**Priority**: P0
**Rationale**: Turbopack 必须强制开启

#### Scenario: 启动开发服务器
**Given** 根目录 `package.json` 配置 `"dev": "turbo dev"`
**When** 执行 `yarn dev`
**Then**
- Portal 启动命令包含 `--turbo` 标志
- Turbopack 输出 `ready` 信息

---

## Configuration Files

### `/package.json`
```json
{
  "name": "enterprise-nexus",
  "private": true,
  "packageManager": "yarn@4.6.0",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "clean": "turbo clean"
  }
}
```

### `/turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### `/.yarnrc.yml`
```yaml
nodeLinker: node-modules
enableGlobalCache: true
```

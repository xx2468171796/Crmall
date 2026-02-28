## ADDED Requirements

### Requirement: Turbopack Development
开发环境 SHALL 使用 Turbopack。严禁使用传统 Webpack。

#### Scenario: 启动开发服务器
- **WHEN** 运行 `yarn dev`
- **THEN** 必须执行 `next dev --turbo`
- **AND** 享受毫秒级 HMR

#### Scenario: 构建配置
- **WHEN** 配置 `next.config.ts`
- **THEN** 确保 Turbopack 相关配置正确
- **AND** 禁止添加不兼容的 Webpack 插件

### Requirement: Standalone Build
生产构建必须使用 Standalone 模式。输出 SHALL 是可独立运行的最小化镜像。

#### Scenario: 生产构建
- **WHEN** 运行 `yarn build`
- **THEN** 使用 `output: 'standalone'` 配置
- **AND** 生成 `.next/standalone` 目录
- **AND** 可独立运行无需 node_modules

#### Scenario: Docker 镜像
- **WHEN** 构建 Docker 镜像
- **THEN** 使用多阶段构建
- **AND** 最终镜像仅包含 standalone 输出
- **AND** 镜像大小应小于 200MB

### Requirement: Tauri Desktop Build
桌面端 SHALL 使用 Tauri v2 构建。

#### Scenario: 桌面端开发
- **WHEN** 开发 Tauri 功能
- **THEN** Rust 代码放在 `src-tauri/`
- **AND** 使用 `#[tauri::command]` 定义命令
- **AND** 前端通过 `invoke()` 调用

#### Scenario: 跨平台构建
- **WHEN** 构建桌面应用
- **THEN** 支持 Windows、macOS、Linux
- **AND** 使用 GitHub Actions 自动构建

### Requirement: Environment Configuration
环境变量 SHALL 通过 `.env` 文件管理。严禁硬编码敏感信息。

#### Scenario: 环境变量定义
- **WHEN** 需要配置信息（数据库、API Key 等）
- **THEN** 在 `.env.example` 中定义模板
- **AND** 实际值放在 `.env.local`（不提交）
- **AND** 使用 `process.env.XXX` 读取

#### Scenario: 类型安全
- **WHEN** 使用环境变量
- **THEN** 通过 Zod 验证环境变量
- **AND** 在 `src/lib/env.ts` 中导出类型安全的配置

### Requirement: Package Management
依赖管理 SHALL 使用 Yarn v4 (Berry)。

#### Scenario: 安装依赖
- **WHEN** 添加新依赖
- **THEN** 使用 `yarn add <package>`
- **AND** 检查是否与现有依赖兼容

#### Scenario: Monorepo 配置
- **WHEN** 项目使用 Monorepo
- **THEN** 在 `package.json` 中配置 Workspaces
- **AND** 共享包放在 `packages/` 目录
- **AND** 使用 Turborepo 管理任务

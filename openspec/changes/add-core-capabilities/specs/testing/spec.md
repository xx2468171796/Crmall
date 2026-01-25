## ADDED Requirements

### Requirement: Unit Testing
核心业务逻辑必须有单元测试。测试 SHALL 使用 Vitest 框架。

#### Scenario: 工具函数测试
- **WHEN** 创建 `src/lib/` 下的工具函数
- **THEN** 必须创建对应的 `.test.ts` 文件
- **AND** 覆盖正常和边界情况

#### Scenario: Zod Schema 测试
- **WHEN** 定义 Zod Schema
- **THEN** 测试验证通过和失败的情况
- **AND** 测试错误消息是否正确

### Requirement: Server Action Testing
Server Actions SHALL 有集成测试。

#### Scenario: 成功路径测试
- **WHEN** 测试 Server Action
- **THEN** Mock 数据库连接
- **AND** 验证返回值符合预期

#### Scenario: 错误处理测试
- **WHEN** 测试 Server Action 异常
- **THEN** 验证抛出正确的错误类型
- **AND** 验证错误消息用户友好

### Requirement: Component Testing
UI 组件 SHALL 有快照测试或交互测试。

#### Scenario: 组件渲染测试
- **WHEN** 创建关键 UI 组件
- **THEN** 测试组件正常渲染
- **AND** 测试不同 Props 的表现

#### Scenario: 表单组件测试
- **WHEN** 测试表单组件
- **THEN** 测试输入验证
- **AND** 测试提交行为
- **AND** 测试错误状态展示

### Requirement: E2E Testing
关键用户流程必须有端到端测试。测试 SHALL 使用 Playwright。

#### Scenario: 登录流程
- **WHEN** 测试用户登录
- **THEN** 模拟用户输入邮箱密码
- **AND** 验证登录成功后跳转
- **AND** 验证 Session 正确创建

#### Scenario: CRUD 流程
- **WHEN** 测试数据操作流程
- **THEN** 测试创建、查看、编辑、删除
- **AND** 验证页面状态正确更新

### Requirement: Test Coverage
项目 SHALL 维持合理的测试覆盖率。

#### Scenario: 覆盖率要求
- **WHEN** 提交代码
- **THEN** 核心模块覆盖率应 >= 70%
- **AND** 工具函数覆盖率应 >= 90%

#### Scenario: CI 集成
- **WHEN** Pull Request 提交
- **THEN** 自动运行测试套件
- **AND** 覆盖率下降时发出警告

### Requirement: Test Data Management
测试数据 SHALL 隔离，不污染生产数据。

#### Scenario: 测试数据库
- **WHEN** 运行集成测试
- **THEN** 使用独立的测试数据库
- **AND** 测试前后清理数据

#### Scenario: Mock 数据
- **WHEN** 需要测试数据
- **THEN** 使用 Factory 模式生成
- **AND** 数据应具有代表性

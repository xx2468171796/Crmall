## ADDED Requirements

### Requirement: Prisma Schema First
所有数据库变更 SHALL 先修改 Prisma Schema。禁止直接操作数据库。

#### Scenario: 添加新表
- **WHEN** 需要创建新的数据表
- **THEN** 先在 `prisma/schema.prisma` 中定义 Model
- **AND** 运行 `prisma migrate dev` 生成迁移
- **AND** 运行 `prisma generate` 更新 Client

#### Scenario: 修改表结构
- **WHEN** 需要修改现有表结构
- **THEN** 先修改 Schema 文件
- **AND** 评估数据迁移影响
- **AND** 创建迁移脚本处理历史数据

### Requirement: Multi-Schema Architecture
系统必须使用 PostgreSQL Multi-Schema 架构。各子系统 SHALL 使用独立 Schema。

#### Scenario: Schema 分配
- **WHEN** 定义数据模型
- **THEN** 使用 `@@schema()` 指定 Schema:
  - Portal/Auth 模型 → `auth`
  - CRM 模型 → `nocodb`
  - OKR 模型 → `plane`
  - Finance 模型 → `midday`
  - Inventory 模型 → `medusa`

#### Scenario: 跨 Schema 查询
- **WHEN** 需要关联不同 Schema 的数据
- **THEN** 使用 Prisma 的 `@relation` 定义关系
- **AND** 确保外键约束正确

### Requirement: Repository Pattern
数据访问 SHALL 通过 Repository 模式封装。禁止在组件中直接使用 Prisma。

#### Scenario: 创建 Repository
- **WHEN** 需要访问某个数据模型
- **THEN** 创建对应的 Repository 类 (`src/lib/db/repositories/`)
- **AND** 封装 CRUD 操作
- **AND** 在 Server Actions 中调用 Repository

#### Scenario: 事务处理
- **WHEN** 操作涉及多个表
- **THEN** 使用 `prisma.$transaction()`
- **AND** 确保原子性

### Requirement: Zod Validation
所有数据库输入 SHALL 经过 Zod 验证。禁止直接插入未验证数据。

#### Scenario: 创建数据
- **WHEN** Server Action 接收用户输入
- **THEN** 先用 Zod Schema 验证
- **AND** 验证通过后才调用 Repository
- **AND** 验证失败返回结构化错误

#### Scenario: Schema 复用
- **WHEN** 定义验证规则
- **THEN** 在 `src/schemas/` 中创建 Zod Schema
- **AND** 前端表单和后端 Action 共用同一 Schema

### Requirement: Soft Delete
业务数据 SHALL 使用软删除。禁止物理删除用户数据。

#### Scenario: 删除记录
- **WHEN** 用户删除一条记录
- **THEN** 设置 `deletedAt` 为当前时间
- **AND** 不物理删除数据

#### Scenario: 查询过滤
- **WHEN** 查询数据列表
- **THEN** 默认过滤 `deletedAt IS NOT NULL` 的记录
- **AND** 提供 `includeDeleted` 选项用于管理员查看

## ADDED Requirements

### Requirement: Role Definition
系统必须定义清晰的角色层级。角色 SHALL 在 Directus 中统一管理。

#### Scenario: 默认角色
- **WHEN** 系统初始化
- **THEN** 创建以下默认角色:
  - `super_admin`: 超级管理员，拥有所有权限
  - `admin`: 管理员，管理本组织数据
  - `manager`: 经理，管理下属数据
  - `user`: 普通用户，仅访问自己的数据

#### Scenario: 角色继承
- **WHEN** 用户拥有 `admin` 角色
- **THEN** 自动继承 `manager` 和 `user` 的权限

### Requirement: Permission Control
系统必须实现细粒度的权限控制。权限 SHALL 基于资源和操作定义。

#### Scenario: 资源权限
- **WHEN** 定义权限
- **THEN** 必须指定资源类型 (如 `customer`, `order`)
- **AND** 必须指定操作类型 (`create`, `read`, `update`, `delete`)
- **AND** 使用格式 `resource:action` (如 `customer:create`)

#### Scenario: 权限检查
- **WHEN** 用户访问受保护资源
- **THEN** 系统检查用户角色权限
- **AND** 无权限时返回 403 错误
- **AND** 记录访问日志

### Requirement: Menu Authorization
系统菜单必须根据用户权限动态渲染。用户 SHALL 只能看到有权访问的菜单项。

#### Scenario: 菜单过滤
- **WHEN** Portal 加载侧边栏
- **THEN** 调用 Directus API 获取当前用户可访问模块
- **AND** 只渲染有权限的菜单项

#### Scenario: 路由守卫
- **WHEN** 用户直接访问无权限的 URL
- **THEN** 重定向到 403 页面
- **AND** 记录越权访问日志

### Requirement: Data Scope
系统必须支持数据范围控制。用户 SHALL 只能访问其权限范围内的数据。

#### Scenario: 组织数据隔离
- **WHEN** 用户查询客户列表
- **THEN** 只返回用户所属组织的客户
- **AND** 禁止跨组织数据访问

#### Scenario: 下属数据访问
- **WHEN** 经理查询团队数据
- **THEN** 返回其直接下属的数据
- **AND** 包含自己的数据

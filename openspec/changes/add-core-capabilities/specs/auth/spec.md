## ADDED Requirements

### Requirement: User Registration
用户必须能够通过邮箱和密码创建账户。系统 SHALL 对输入进行严格验证，并将密码安全存储。

#### Scenario: 成功注册
- **WHEN** 用户提交有效的邮箱和密码
- **THEN** 系统创建用户账户
- **AND** 返回成功消息
- **AND** 发送验证邮件

#### Scenario: 邮箱已存在
- **WHEN** 用户提交已存在的邮箱
- **THEN** 系统返回错误 "该邮箱已被注册"
- **AND** 不创建重复账户

#### Scenario: 密码强度不足
- **WHEN** 用户提交弱密码（少于 8 位或无特殊字符）
- **THEN** 系统返回密码强度要求提示
- **AND** 拒绝注册

### Requirement: User Login
用户必须能够使用邮箱和密码登录系统。系统 SHALL 验证凭据并创建会话。

#### Scenario: 成功登录
- **WHEN** 用户提交正确的邮箱和密码
- **THEN** 系统创建 Session
- **AND** 将 Session Token 存储到 Redis
- **AND** 重定向到 Dashboard

#### Scenario: 凭据错误
- **WHEN** 用户提交错误的邮箱或密码
- **THEN** 系统返回 "邮箱或密码错误"
- **AND** 不创建 Session

#### Scenario: 账户锁定
- **WHEN** 用户连续 5 次输入错误密码
- **THEN** 系统锁定账户 15 分钟
- **AND** 发送安全提醒邮件

### Requirement: Session Management
系统必须安全管理用户会话。Session SHALL 存储在 Redis 中，支持多设备登录。

#### Scenario: Session 过期
- **WHEN** 用户 Session 超过 7 天未活动
- **THEN** 系统自动销毁 Session
- **AND** 重定向到登录页

#### Scenario: 主动登出
- **WHEN** 用户点击登出
- **THEN** 系统销毁当前 Session
- **AND** 清除客户端 Cookie
- **AND** 重定向到登录页

### Requirement: OAuth Integration
系统 SHALL 支持第三方 OAuth 登录（微信、钉钉、企业微信）。

#### Scenario: 微信扫码登录
- **WHEN** 用户选择微信登录并完成扫码授权
- **THEN** 系统获取微信 OpenID
- **AND** 关联或创建本地账户
- **AND** 创建 Session

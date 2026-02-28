# Spec: Organization (SaaS + 集团多公司双重架构)

## Capability
`organization` - 平台 → 租户 → 集团 → 公司 → 部门 → 小组 → 员工

## 核心原则

**双重隔离架构**:

### 第一层: SaaS 租户隔离 (绝对)
- 租户 (Tenant) 是购买系统的客户
- 租户间数据 **100% 隔离**，绝对不可互相访问
- 所有业务表必须包含 `tenantId` 字段
- 查询 **永远** 强制带 `tenantId` 过滤

### 第二层: 集团多公司隔离 (相对)
- 每个租户内有一个集团 (Group)
- 集团下有多个公司 (Company)
- 集团管理员可查看本租户所有公司数据
- 公司用户只能看本公司数据
- 所有业务表必须包含 `companyId` 字段

## ADDED Requirements

### Requirement: 集团管理
**Priority**: P0
**Rationale**: 顶层组织，全局唯一

#### Scenario: 初始化集团
**Given** 系统首次部署
**When** 执行初始化脚本
**Then**
- 创建默认集团记录
- 设置集团名称和 Logo
- 集团 ID 作为全局常量

---

### Requirement: 公司管理
**Priority**: P0
**Rationale**: 集团下属公司管理

#### Scenario: 创建公司
**Given** 集团管理员在公司管理后台
**When** 填写公司信息 (名称、编码)
**Then**
- 验证公司编码唯一性
- 创建 Company 记录关联到 Group
- 自动创建默认部门 "总经办"

#### Scenario: 公司列表
**Given** 集团管理员访问公司管理页面
**When** 页面加载
**Then**
- 显示所有公司列表
- 包含公司名称、编码、员工数、状态

#### Scenario: 公司切换
**Given** 用户属于多个公司 (集团管理员)
**When** 点击公司切换器
**Then**
- 显示可选公司列表
- 切换后页面数据按选中公司过滤
- 不切换时显示所有公司汇总数据

---

### Requirement: 部门管理
**Priority**: P0
**Rationale**: 支持多级部门树

#### Scenario: 创建部门
**Given** 公司管理员在部门管理页面
**When** 填写部门信息并选择上级部门
**Then**
- 创建部门记录
- 设置 `parentId` 建立层级关系
- 最多支持 5 级部门

#### Scenario: 部门树展示
**Given** 访问部门管理页面
**When** 页面加载
**Then**
- 以树形结构展示部门
- 可展开/折叠子部门
- 显示每个部门的员工数量

#### Scenario: 删除部门
**Given** 部门下无员工且无子部门
**When** 点击删除按钮
**Then**
- 确认弹窗提示
- 删除部门记录

#### Scenario: 删除部门 (有下属)
**Given** 部门下有员工或子部门
**When** 点击删除按钮
**Then**
- 提示 "请先移除下属小组和子部门"
- 不执行删除

---

### Requirement: 小组管理
**Priority**: P0
**Rationale**: 部门下的工作小组

#### Scenario: 创建小组
**Given** 部门管理员在小组管理页面
**When** 填写小组名称并选择组长
**Then**
- 创建小组记录关联到部门
- 设置小组长 (可选)

#### Scenario: 小组列表
**Given** 访问部门详情页
**When** 页面加载
**Then**
- 显示该部门下所有小组
- 每个小组显示成员数量和组长

---

### Requirement: 员工管理
**Priority**: P0
**Rationale**: 用户与组织的关联

#### Scenario: 创建员工
**Given** HR 在员工管理页面
**When** 填写员工信息并选择小组
**Then**
- 创建 User 记录 (如果不存在)
- 创建 Employee 记录关联 User 和 Team
- 生成工号 (格式: 公司编码-序号)

#### Scenario: 员工调岗
**Given** 员工需要调换小组
**When** 修改员工的所属小组
**Then**
- 更新 `teamId`
- 记录调岗历史
- 不影响历史数据归属

#### Scenario: 员工离职
**Given** 员工离职
**When** 点击离职处理
**Then**
- 设置员工状态为 `inactive`
- 禁用关联的 User 账号
- 保留历史数据

---

### Requirement: 数据范围过滤
**Priority**: P0
**Rationale**: 基于组织的权限控制

#### Scenario: 全部数据权限
**Given** 用户角色数据范围为 `all`
**When** 查询客户列表
**Then**
- 返回所有公司的客户数据

#### Scenario: 本公司数据权限
**Given** 用户角色数据范围为 `company`
**When** 查询客户列表
**Then**
- 仅返回当前公司 (`currentCompanyId`) 的客户

#### Scenario: 本部门数据权限
**Given** 用户角色数据范围为 `department`
**When** 查询客户列表
**Then**
- 返回本部门及所有下级部门的客户
- 使用递归查询部门树

#### Scenario: 仅本人数据权限
**Given** 用户角色数据范围为 `self`
**When** 查询客户列表
**Then**
- 仅返回 `createdBy` 为当前用户的客户

---

## Database Schema

```prisma
// packages/db/prisma/schema.prisma

model Group {
  id        String    @id @default(cuid())
  name      String
  logo      String?
  companies Company[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  @@schema("auth")
}

model Company {
  id          String       @id @default(cuid())
  groupId     String
  group       Group        @relation(fields: [groupId], references: [id])
  name        String
  code        String       @unique
  logo        String?
  status      CompanyStatus @default(ACTIVE)
  departments Department[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  @@schema("auth")
}

enum CompanyStatus {
  ACTIVE
  INACTIVE
  @@schema("auth")
}

model Department {
  id        String       @id @default(cuid())
  companyId String
  company   Company      @relation(fields: [companyId], references: [id])
  parentId  String?
  parent    Department?  @relation("DeptTree", fields: [parentId], references: [id])
  children  Department[] @relation("DeptTree")
  name      String
  code      String?
  sortOrder Int          @default(0)
  teams     Team[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  @@unique([companyId, code])
  @@schema("auth")
}

model Team {
  id           String       @id @default(cuid())
  departmentId String
  department   Department   @relation(fields: [departmentId], references: [id])
  name         String
  leaderId     String?      // 小组长 userId
  sortOrder    Int          @default(0)
  employees    Employee[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  @@schema("auth")
}

model Employee {
  id           String         @id @default(cuid())
  userId       String         @unique
  user         User           @relation(fields: [userId], references: [id])
  teamId       String
  team         Team           @relation(fields: [teamId], references: [id])
  employeeNo   String         @unique
  position     String?
  status       EmployeeStatus @default(ACTIVE)
  joinDate     DateTime?
  leaveDate    DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  @@schema("auth")
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  PROBATION
  @@schema("auth")
}

// 数据范围枚举
enum DataScope {
  GROUP      // 集团 - 所有公司数据
  COMPANY    // 本公司
  DEPARTMENT // 本部门及下级
  TEAM       // 本小组
  SELF       // 仅本人
  @@schema("auth")
}
```

---

## Session Structure

```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    // 组织信息
    employeeId: string
    employeeNo: string
    companyId: string
    companyName: string
    departmentId: string
    departmentName: string
    teamId: string
    teamName: string
    // 权限信息
    roles: string[]
    permissions: string[]
    dataScope: DataScope  // GROUP | COMPANY | DEPARTMENT | TEAM | SELF
  }
  // 当前选中的公司 (多公司用户可切换)
  currentCompanyId: string
}
```

---

## Data Scope Helper

```typescript
// packages/db/src/scope.ts
import { prisma } from "./client"

export async function getDepartmentIds(
  departmentId: string
): Promise<string[]> {
  const result: string[] = [departmentId]
  
  const children = await prisma.department.findMany({
    where: { parentId: departmentId },
    select: { id: true },
  })
  
  for (const child of children) {
    const childIds = await getDepartmentIds(child.id)
    result.push(...childIds)
  }
  
  return result
}

export function buildScopeFilter(
  session: Session,
  ownerField = "createdById"
) {
  const { dataScope, companyId, departmentId, teamId, id: userId } = session.user

  switch (dataScope) {
    case "GROUP":
      return {} // 集团管理员，无过滤
    case "COMPANY":
      return { companyId } // 仅本公司
    case "DEPARTMENT":
      return { 
        companyId,
        departmentId: { in: getDepartmentIds(departmentId) } 
      }
    case "TEAM":
      return { companyId, teamId } // 仅本小组
    case "SELF":
      return { companyId, [ownerField]: userId }
    default:
      return { companyId, [ownerField]: userId } // 默认最小权限
  }
}
```

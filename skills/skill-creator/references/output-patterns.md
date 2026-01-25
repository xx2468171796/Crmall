# 输出模式 (Output Patterns)

当技能需要产生一致的高质量输出时，使用这些模式。

## 模板模式

提供输出格式的模板。根据需求调整严格程度。

### 严格模板（API 响应、数据格式）

```markdown
## Server Action 返回格式

ALWAYS 使用此结构：

// 成功响应
{ success: true, data: T }

// 错误响应
{ success: false, error: { message: string, code?: string } }

// 验证错误
{ success: false, error: ZodError.flatten() }
```

### 灵活模板（可适应的指南）

```markdown
## 组件结构

以下是推荐格式，根据具体情况调整：

1. 导入语句
2. 类型定义
3. Props 接口
4. 组件函数
5. 导出

根据组件复杂度调整结构。
```

## 示例模式

对于依赖示例的输出质量，提供输入/输出对：

```markdown
## Commit Message 格式

按以下示例生成提交消息：

**示例 1:**
输入: 添加用户认证功能，支持 JWT
输出:
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware

**示例 2:**
输入: 修复报表中日期显示不正确的问题
输出:
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation

遵循此风格: type(scope): 简短描述，然后详细说明。
```

## 代码模式

### TypeScript 组件

```typescript
// 模板: React 组件
import { type FC } from "react"

interface ComponentNameProps {
  // props 定义
}

export const ComponentName: FC<ComponentNameProps> = ({ ...props }) => {
  return (
    <div>
      {/* 组件内容 */}
    </div>
  )
}
```

### Server Action

```typescript
// 模板: Server Action
"use server"

import { auth } from "@/lib/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const schema = z.object({
  // 输入定义
})

export async function actionName(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const validated = schema.safeParse({
    // 解析 formData
  })

  if (!validated.success) {
    return { success: false, error: validated.error.flatten() }
  }

  // 执行逻辑

  revalidatePath("/path")
  return { success: true }
}
```

## 文档模式

```markdown
## API 文档模板

### 端点名称

**方法**: POST/GET/PUT/DELETE
**路径**: `/api/v1/resource`

#### 请求参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| id | string | 是 | 资源 ID |

#### 响应

```json
{
  "success": true,
  "data": {}
}
```

#### 错误码

| 代码 | 描述 |
|------|------|
| 400 | 请求无效 |
| 401 | 未认证 |
| 403 | 无权限 |
```

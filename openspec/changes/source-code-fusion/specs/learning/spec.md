# Spec: Learning (ClassroomIO Integration)

## Overview

将 ClassroomIO 源码引入作为培训模块，提供课程管理、在线学习、测验评估等功能。

## Source

- **Repository**: https://github.com/classroomio/classroomio
- **Branch**: main
- **License**: AGPL-3.0
- **Tech Stack**: SvelteKit + Supabase

## ADDED Requirements

### REQ-LMS-001: 源码引入

ClassroomIO 完整源码必须引入到 `apps/learning` 目录。

#### Scenario: 初始克隆
```gherkin
Given Monorepo 已初始化
When 执行 git subtree add
Then apps/learning 目录包含完整 ClassroomIO 源码
```

### REQ-LMS-002: iframe 集成

ClassroomIO 必须作为独立服务运行，通过 iframe 嵌入 Portal。

#### Scenario: iframe 嵌入
```gherkin
Given ClassroomIO 运行在 localhost:3001
When Portal 加载 Learning 页面
Then 显示 ClassroomIO iframe
And PostMessage 通信正常
```

### REQ-LMS-003: 认证集成

ClassroomIO 必须通过 Cookie 验证 Portal Session。

#### Scenario: Session 验证
```gherkin
Given 用户在 Portal 登录
When 访问 Learning iframe
Then ClassroomIO 识别用户身份
```

### REQ-LMS-004: 课件存储

课程资料必须上传到 MinIO `nexus-lms` bucket。

#### Scenario: 课件上传
```gherkin
Given 讲师上传课件
When 上传完成
Then 文件存储到 MinIO nexus-lms bucket
```

## 导出视图

| View | URL Path | Description |
|------|----------|-------------|
| CourseList | /courses | 课程列表 |
| CourseDetail | /courses/:id | 课程详情 |
| LessonPlayer | /lessons/:id | 课程播放 |
| QuizEditor | /quiz/:id/edit | 测验编辑 |
| ProgressDashboard | /progress | 学习进度 |

## 数据模型

```sql
CREATE TABLE classroomio.courses (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES auth.tenants(id),
  title VARCHAR(255),
  instructor_id UUID REFERENCES auth.users(id),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE classroomio.enrollments (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES classroomio.courses(id),
  user_id UUID REFERENCES auth.users(id),
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT NOW()
);
```

## Portal 集成

```tsx
// apps/portal/src/app/(dashboard)/learning/[[...path]]/page.tsx
export default function LearningPage() {
  return (
    <iframe
      src={`${process.env.CLASSROOMIO_URL}`}
      className="w-full h-full border-0"
    />
  )
}
```

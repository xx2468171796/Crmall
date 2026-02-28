# Spec: 国际化 (i18n)

## Status: implemented

## 概述
next-intl 4 实现用户级语言偏好，三语言支持。

## 支持语言
| 代码 | 语言 | 说明 |
|------|------|------|
| `zh-CN` | 简体中文 | 默认语言 |
| `zh-TW` | 繁体中文 | |
| `en` | English | |

## 技术方案
- 库: `next-intl` (Next.js App Router 原生支持)
- 语言文件: `src/messages/{locale}.json`
- 用户偏好: 存储在 `auth.User.locale` 字段
- Cookie: `NEXT_LOCALE` 传递给 Server Components
- 未登录默认: `zh-CN`

## 翻译结构
```json
{
  "common": { "save": "保存", ... },
  "auth": { "login": "登录", ... },
  "nav": { "dashboard": "工作台", ... },
  "dashboard": { ... },
  "notification": { ... },
  "announcement": { ... }
}
```

## 规则
- 所有 UI 文案必须走 i18n，禁止硬编码
- 新增页面/组件必须同时更新三个语言文件
- 使用 `useTranslations('namespace')` Hook

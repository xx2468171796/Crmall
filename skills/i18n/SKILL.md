# i18n 技能 — 国际化

## 技术栈
- next-intl 4.x
- 用户级语言偏好（非全局切换）

## 支持语言

| 代码 | 语言 | 说明 |
|------|------|------|
| zh-CN | 简体中文 | 默认 |
| zh-TW | 繁体中文 | |
| en | English | |

## 语言文件位置

```
src/messages/
├── zh-TW.json
├── zh-CN.json
└── en.json
```

## 用户级偏好

- 用户表有 locale 字段 (默认 zh-CN)
- 登录后读取 user.locale → 设置 Cookie (NEXT_LOCALE)
- 设置页切换语言 → 更新 DB + Cookie → 刷新生效

## 使用方式

Server Component:
```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('ordering')
  return <h1>{t('title')}</h1>
}
```

Client Component:
```typescript
import { useTranslations } from 'next-intl'

export function OrderList() {
  const t = useTranslations('ordering')
  return <Button>{t('createOrder')}</Button>
}
```

## 语言文件结构

按模块组织 key：

```json
{
  "common": {
    "save": "儲存",
    "cancel": "取消",
    "delete": "刪除",
    "search": "搜尋",
    "loading": "載入中..."
  },
  "ordering": {
    "title": "訂貨中心",
    "createOrder": "建立訂單",
    "cart": "購物車",
    "balance": "餘額"
  },
  "crm": {
    "customers": "客戶管理",
    "opportunities": "商機管理"
  }
}
```

## 规范
- 所有 UI 文案必须走 i18n，禁止硬编码中文
- key 命名: {module}.{page/component}.{element}
- 新增功能时必须同时更新三个语言文件

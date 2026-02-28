# Spec: 公告与通知系统

## Status: designed

## 概述
系统公告 (总部发布) + 实时通知 (系统自动生成) 双通道。

## 公告 (Announcement)
- 总部发布，支持定向推送 (all / tenant / role / user)
- 类型: info / warning / urgent / maintenance
- 支持置顶、定时发布、过期时间
- 已读追踪 (AnnouncementRead)

## 通知 (Notification)
- 系统自动生成 (订单/库存/工单/任务/审批)
- WebSocket 实时推送 (`notification:new` 事件)
- 支持关联实体 (refType + refId)，点击跳转
- 已读/未读状态

## WebSocket 事件
- `announcement:new` — 新公告推送
- `notification:new` — 新通知推送

## 数据模型
- `system.Announcement` — 公告
- `system.AnnouncementRead` — 已读记录
- `system.Notification` — 通知

## 权限
- `system:create:announcement` — 创建公告 (仅总部)
- `system:read:announcement` — 查看公告
- `system:read:notification` — 查看通知

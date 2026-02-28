# Spec: CRM 核心模块

## Status: designed

## 概述
客户管理、商机跟踪、合同管理、安装工单，面向智能家居行业。

## 功能
- 客户管理 (公司/个人，等级/来源/标签)
- 联系人管理 (支持 LINE ID)
- 商机管理 (阶段漏斗: lead → qualified → proposal → negotiation → won/lost)
- 合同管理 (审批流，含明细)
- 安装工单 (指派技术人员，完成后自动扣库存)
- 跟进记录 (通用: 客户/商机/工单)

## 数据模型 (crm schema)
- Customer, Contact, Opportunity, Contract, ContractItem
- WorkOrder, WorkOrderItem, FollowUp

## 权限
- `crm:create:customer` / `crm:read:customer` / `crm:update:customer` / `crm:delete:customer`
- 同理: opportunity, contract, workorder, followup

export type SubsystemType = "portal" | "crm" | "okr" | "finance" | "inventory" | "learning" | "docs"

export interface NexusEvent<T = unknown> {
  id: string
  type: string
  source: SubsystemType
  target?: SubsystemType
  tenantId: string
  userId: string
  payload: T
  timestamp: Date
}

export interface UserCreatedEvent {
  userId: string
  email: string
  name: string
  tenantId: string
}

export interface CustomerCreatedEvent {
  customerId: string
  name: string
  email: string
  tenantId: string
  sourceSystem: SubsystemType
}

export interface ProjectCreatedEvent {
  projectId: string
  name: string
  description?: string
  tenantId: string
  ownerId: string
}

export interface InvoiceCreatedEvent {
  invoiceId: string
  customerId: string
  amount: number
  currency: string
  tenantId: string
}

export interface ProductCreatedEvent {
  productId: string
  name: string
  sku: string
  price: number
  tenantId: string
}

export interface CourseCreatedEvent {
  courseId: string
  title: string
  instructorId: string
  tenantId: string
}

export interface DocumentCreatedEvent {
  documentId: string
  title: string
  workspaceId: string
  authorId: string
  tenantId: string
}

export type NexusEventType =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "customer.created"
  | "customer.updated"
  | "project.created"
  | "project.updated"
  | "invoice.created"
  | "invoice.paid"
  | "product.created"
  | "product.updated"
  | "course.created"
  | "course.published"
  | "document.created"
  | "document.updated"

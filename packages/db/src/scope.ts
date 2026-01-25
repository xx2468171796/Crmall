import type { DataScope } from "@prisma/client"
import { prisma } from "./client"

export interface SessionUser {
  id: string
  tenantId?: string | null
  companyId?: string | null
  departmentId?: string | null
  teamId?: string | null
  dataScope: DataScope
  isPlatformAdmin: boolean
}

export async function getDepartmentTree(departmentId: string): Promise<string[]> {
  const result: string[] = [departmentId]

  const children = await prisma.department.findMany({
    where: { parentId: departmentId },
    select: { id: true },
  })

  for (const child of children) {
    const childIds = await getDepartmentTree(child.id)
    result.push(...childIds)
  }

  return result
}

export function buildScopeFilter(
  user: SessionUser,
  ownerField = "createdById"
): Record<string, unknown> {
  const { tenantId, companyId, departmentId, teamId, id: userId, dataScope, isPlatformAdmin } = user

  const filter: Record<string, unknown> = {}

  if (isPlatformAdmin || dataScope === "PLATFORM") {
    return filter
  }

  switch (dataScope) {
    case "GROUP":
      filter.tenantId = tenantId
      break
    case "COMPANY":
      filter.tenantId = tenantId
      filter.companyId = companyId
      break
    case "DEPARTMENT":
      filter.tenantId = tenantId
      filter.companyId = companyId
      if (departmentId) {
        getDepartmentTree(departmentId).then((ids) => {
          filter.departmentId = { in: ids }
        })
      }
      break
    case "TEAM":
      filter.tenantId = tenantId
      filter.companyId = companyId
      filter.teamId = teamId
      break
    case "SELF":
      filter.tenantId = tenantId
      filter.companyId = companyId
      filter[ownerField] = userId
      break
    default:
      filter.tenantId = tenantId
      filter.companyId = companyId
      filter[ownerField] = userId
  }

  return filter
}

export async function buildScopeFilterAsync(
  user: SessionUser,
  ownerField = "createdById"
): Promise<Record<string, unknown>> {
  const { tenantId, companyId, departmentId, teamId, id: userId, dataScope, isPlatformAdmin } = user

  const filter: Record<string, unknown> = {}

  if (isPlatformAdmin || dataScope === "PLATFORM") {
    return filter
  }

  switch (dataScope) {
    case "GROUP":
      filter.tenantId = tenantId
      break
    case "COMPANY":
      filter.tenantId = tenantId
      filter.companyId = companyId
      break
    case "DEPARTMENT":
      filter.tenantId = tenantId
      filter.companyId = companyId
      if (departmentId) {
        const ids = await getDepartmentTree(departmentId)
        filter.departmentId = { in: ids }
      }
      break
    case "TEAM":
      filter.tenantId = tenantId
      filter.companyId = companyId
      filter.teamId = teamId
      break
    case "SELF":
      filter.tenantId = tenantId
      filter.companyId = companyId
      filter[ownerField] = userId
      break
    default:
      filter.tenantId = tenantId
      filter.companyId = companyId
      filter[ownerField] = userId
  }

  return filter
}

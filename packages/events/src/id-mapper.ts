import { getRedisConnection } from "./connection"
import type { SubsystemType } from "./types"

const ID_MAP_PREFIX = "nexus:idmap"

export interface IdMapping {
  nexusId: string
  subsystem: SubsystemType
  externalId: string
  entityType: string
  tenantId: string
  createdAt: Date
}

export async function createIdMapping(
  nexusId: string,
  subsystem: SubsystemType,
  externalId: string,
  entityType: string,
  tenantId: string
): Promise<void> {
  const redis = getRedisConnection()
  const mapping: IdMapping = {
    nexusId,
    subsystem,
    externalId,
    entityType,
    tenantId,
    createdAt: new Date(),
  }

  const forwardKey = `${ID_MAP_PREFIX}:${subsystem}:${entityType}:${externalId}`
  const reverseKey = `${ID_MAP_PREFIX}:nexus:${entityType}:${nexusId}:${subsystem}`

  await redis.set(forwardKey, JSON.stringify(mapping))
  await redis.set(reverseKey, externalId)
}

export async function getNexusId(
  subsystem: SubsystemType,
  entityType: string,
  externalId: string
): Promise<string | null> {
  const redis = getRedisConnection()
  const key = `${ID_MAP_PREFIX}:${subsystem}:${entityType}:${externalId}`
  const data = await redis.get(key)
  
  if (!data) return null
  
  const mapping: IdMapping = JSON.parse(data)
  return mapping.nexusId
}

export async function getExternalId(
  nexusId: string,
  entityType: string,
  subsystem: SubsystemType
): Promise<string | null> {
  const redis = getRedisConnection()
  const key = `${ID_MAP_PREFIX}:nexus:${entityType}:${nexusId}:${subsystem}`
  return redis.get(key)
}

export async function getAllExternalIds(
  nexusId: string,
  entityType: string
): Promise<Record<SubsystemType, string>> {
  const redis = getRedisConnection()
  const pattern = `${ID_MAP_PREFIX}:nexus:${entityType}:${nexusId}:*`
  const keys = await redis.keys(pattern)
  
  const result: Record<string, string> = {}
  
  for (const key of keys) {
    const subsystem = key.split(":").pop() as SubsystemType
    const externalId = await redis.get(key)
    if (externalId) {
      result[subsystem] = externalId
    }
  }
  
  return result as Record<SubsystemType, string>
}

export async function deleteIdMapping(
  subsystem: SubsystemType,
  entityType: string,
  externalId: string
): Promise<void> {
  const redis = getRedisConnection()
  const forwardKey = `${ID_MAP_PREFIX}:${subsystem}:${entityType}:${externalId}`
  const data = await redis.get(forwardKey)
  
  if (data) {
    const mapping: IdMapping = JSON.parse(data)
    const reverseKey = `${ID_MAP_PREFIX}:nexus:${entityType}:${mapping.nexusId}:${subsystem}`
    await redis.del(forwardKey, reverseKey)
  }
}

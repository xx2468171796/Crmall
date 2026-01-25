"use server"

import { createClient } from "redis"

const redisUrl = process.env.REDIS_URL || "redis://:xx123654@192.168.110.246:6379"

export interface NexusSession {
  userId: string
  email: string
  name: string | null
  tenantId: string | null
  isPlatformAdmin: boolean
  dataScope: string
  companyId: string | null
  expiresAt: Date
}

let redisClient: ReturnType<typeof createClient> | null = null

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: redisUrl })
    await redisClient.connect()
  }
  return redisClient
}

export async function getSessionByToken(sessionToken: string): Promise<NexusSession | null> {
  try {
    const client = await getRedisClient()
    const sessionKey = `nexus:session:${sessionToken}`
    const sessionData = await client.get(sessionKey)
    
    if (!sessionData) {
      return null
    }
    
    return JSON.parse(sessionData) as NexusSession
  } catch (error) {
    console.error("Failed to get session from Redis:", error)
    return null
  }
}

export async function setSession(sessionToken: string, session: NexusSession, ttlSeconds: number = 86400): Promise<void> {
  try {
    const client = await getRedisClient()
    const sessionKey = `nexus:session:${sessionToken}`
    await client.setEx(sessionKey, ttlSeconds, JSON.stringify(session))
  } catch (error) {
    console.error("Failed to set session in Redis:", error)
  }
}

export async function deleteSession(sessionToken: string): Promise<void> {
  try {
    const client = await getRedisClient()
    const sessionKey = `nexus:session:${sessionToken}`
    await client.del(sessionKey)
  } catch (error) {
    console.error("Failed to delete session from Redis:", error)
  }
}

export async function validateSessionCookie(cookieValue: string): Promise<NexusSession | null> {
  if (!cookieValue) {
    return null
  }
  
  return getSessionByToken(cookieValue)
}

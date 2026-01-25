import type { Request, Response, NextFunction } from "express"
import { createClient } from "redis"

const REDIS_URL = process.env.REDIS_URL || "redis://:xx123654@192.168.110.246:6379"
const SESSION_COOKIE_NAME = "nexus-session"

interface NexusUser {
  id: string
  email: string
  name: string | null
  tenantId: string | null
  isPlatformAdmin: boolean
}

declare global {
  namespace Express {
    interface Request {
      nexusUser?: NexusUser
    }
  }
}

let redisClient: ReturnType<typeof createClient> | null = null

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL })
    await redisClient.connect()
  }
  return redisClient
}

export async function nexusAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME]
    
    if (!sessionToken) {
      return res.status(401).json({ error: "Unauthorized: No session token" })
    }

    const client = await getRedisClient()
    const sessionKey = `nexus:session:${sessionToken}`
    const sessionData = await client.get(sessionKey)

    if (!sessionData) {
      return res.status(401).json({ error: "Unauthorized: Invalid session" })
    }

    const session = JSON.parse(sessionData)
    req.nexusUser = {
      id: session.userId,
      email: session.email,
      name: session.name,
      tenantId: session.tenantId,
      isPlatformAdmin: session.isPlatformAdmin,
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.nexusUser?.isPlatformAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" })
  }
  next()
}

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.nexusUser?.tenantId) {
    return res.status(403).json({ error: "Forbidden: Tenant access required" })
  }
  next()
}

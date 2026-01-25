import { createClient } from "redis"

const REDIS_URL = process.env.REDIS_URL || "redis://:xx123654@192.168.110.246:6379"
const SESSION_COOKIE_NAME = "nexus-session"

export interface NexusUser {
  id: string
  email: string
  name: string | null
  tenantId: string | null
  isPlatformAdmin: boolean
}

let redisClient: ReturnType<typeof createClient> | null = null

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL })
    await redisClient.connect()
  }
  return redisClient
}

export async function validateSvelteKitSession(cookies: { get: (name: string) => string | undefined }): Promise<NexusUser | null> {
  try {
    const sessionToken = cookies.get(SESSION_COOKIE_NAME)
    
    if (!sessionToken) {
      return null
    }

    const client = await getRedisClient()
    const sessionKey = `nexus:session:${sessionToken}`
    const sessionData = await client.get(sessionKey)

    if (!sessionData) {
      return null
    }

    const session = JSON.parse(sessionData)
    return {
      id: session.userId,
      email: session.email,
      name: session.name,
      tenantId: session.tenantId,
      isPlatformAdmin: session.isPlatformAdmin,
    }
  } catch (error) {
    console.error("SvelteKit auth error:", error)
    return null
  }
}

export function createSvelteKitAuthHook() {
  return async ({ event, resolve }: { event: any; resolve: any }) => {
    const user = await validateSvelteKitSession(event.cookies)
    event.locals.user = user
    return resolve(event)
  }
}

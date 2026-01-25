import { Redis } from "ioredis"

const REDIS_URL = process.env.REDIS_URL || "redis://:xx123654@192.168.110.246:6379"

let redisConnection: Redis | null = null

export function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  }
  return redisConnection
}

export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit()
    redisConnection = null
  }
}

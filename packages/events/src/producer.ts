import { Queue } from "bullmq"
import { getRedisConnection } from "./connection"
import type { NexusEvent, NexusEventType, SubsystemType } from "./types"

const QUEUE_NAME = "nexus-events"

let eventQueue: Queue | null = null

function getEventQueue(): Queue {
  if (!eventQueue) {
    eventQueue = new Queue(QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    })
  }
  return eventQueue
}

export async function publishEvent<T>(
  type: NexusEventType,
  source: SubsystemType,
  payload: T,
  options: {
    tenantId: string
    userId: string
    target?: SubsystemType
  }
): Promise<string> {
  const queue = getEventQueue()
  
  const event: NexusEvent<T> = {
    id: crypto.randomUUID(),
    type,
    source,
    target: options.target,
    tenantId: options.tenantId,
    userId: options.userId,
    payload,
    timestamp: new Date(),
  }

  const job = await queue.add(type, event, {
    jobId: event.id,
  })

  return job.id || event.id
}

export async function publishUserCreated(
  userId: string,
  email: string,
  name: string,
  tenantId: string
): Promise<string> {
  return publishEvent(
    "user.created",
    "portal",
    { userId, email, name, tenantId },
    { tenantId, userId }
  )
}

export async function publishCustomerCreated(
  customerId: string,
  name: string,
  email: string,
  tenantId: string,
  userId: string
): Promise<string> {
  return publishEvent(
    "customer.created",
    "crm",
    { customerId, name, email, tenantId, sourceSystem: "crm" },
    { tenantId, userId }
  )
}

export async function closeEventQueue(): Promise<void> {
  if (eventQueue) {
    await eventQueue.close()
    eventQueue = null
  }
}

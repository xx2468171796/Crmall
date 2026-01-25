import { Worker, Job } from "bullmq"
import { getRedisConnection } from "./connection"
import type { NexusEvent, NexusEventType } from "./types"

const QUEUE_NAME = "nexus-events"

type EventHandler<T = unknown> = (event: NexusEvent<T>) => Promise<void>

const eventHandlers = new Map<NexusEventType, EventHandler[]>()

export function onEvent<T>(type: NexusEventType, handler: EventHandler<T>): void {
  const handlers = eventHandlers.get(type) || []
  handlers.push(handler as EventHandler)
  eventHandlers.set(type, handlers)
}

async function processJob(job: Job<NexusEvent>): Promise<void> {
  const event = job.data
  const handlers = eventHandlers.get(event.type as NexusEventType) || []

  console.log(`Processing event: ${event.type} (${event.id})`)

  for (const handler of handlers) {
    try {
      await handler(event)
    } catch (error) {
      console.error(`Handler error for event ${event.type}:`, error)
      throw error
    }
  }
}

let worker: Worker | null = null

export function startEventConsumer(): Worker {
  if (worker) {
    return worker
  }

  worker = new Worker(QUEUE_NAME, processJob, {
    connection: getRedisConnection(),
    concurrency: 10,
  })

  worker.on("completed", (job) => {
    console.log(`Event processed: ${job.data.type} (${job.id})`)
  })

  worker.on("failed", (job, error) => {
    console.error(`Event failed: ${job?.data.type} (${job?.id})`, error)
  })

  console.log("Nexus event consumer started")
  return worker
}

export async function stopEventConsumer(): Promise<void> {
  if (worker) {
    await worker.close()
    worker = null
  }
}

import { Queue, Worker, type Job, type WorkerOptions, type QueueOptions } from "bullmq"
import { redis } from "./index"

const defaultQueueOptions: Partial<QueueOptions> = {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
  },
}

export function createQueue<T>(name: string, options?: Partial<QueueOptions>): Queue<T> {
  return new Queue<T>(name, {
    ...defaultQueueOptions,
    ...options,
  })
}

export function createWorker<T>(
  name: string,
  processor: (job: Job<T>) => Promise<void>,
  options?: Partial<WorkerOptions>
): Worker<T> {
  return new Worker<T>(name, processor, {
    connection: redis,
    ...options,
  })
}

export { Queue, Worker, type Job }

import { startEventConsumer } from "../consumer"
import { registerUserSyncWorker } from "./user-sync"
import { registerCustomerSyncWorker } from "./customer-sync"

export function startAllWorkers() {
  console.log("🚀 Starting Nexus event workers...")
  
  registerUserSyncWorker()
  registerCustomerSyncWorker()
  
  startEventConsumer()
  
  console.log("✅ All workers started")
}

export { registerUserSyncWorker } from "./user-sync"
export { registerCustomerSyncWorker } from "./customer-sync"

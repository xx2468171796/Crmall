import { onEvent, createIdMapping, getNexusId } from "../index"
import type { CustomerCreatedEvent, NexusEvent } from "../types"

export function registerCustomerSyncWorker() {
  onEvent<CustomerCreatedEvent>("customer.created", async (event: NexusEvent<CustomerCreatedEvent>) => {
    const { customerId, name, email, tenantId, sourceSystem } = event.payload
    
    console.log(`[CustomerSync] Processing customer ${name} from ${sourceSystem}...`)

    const nexusCustomerId = crypto.randomUUID()
    await createIdMapping(nexusCustomerId, sourceSystem, customerId, "customer", tenantId)

    console.log(`[CustomerSync] Customer ${name} mapped: ${nexusCustomerId} -> ${sourceSystem}:${customerId}`)
  })

  console.log("✅ Customer sync worker registered")
}

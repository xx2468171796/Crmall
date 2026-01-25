import { onEvent, createIdMapping } from "../index"
import type { UserCreatedEvent, NexusEvent } from "../types"

export function registerUserSyncWorker() {
  onEvent<UserCreatedEvent>("user.created", async (event: NexusEvent<UserCreatedEvent>) => {
    const { userId, email, name, tenantId } = event.payload
    
    console.log(`[UserSync] Syncing user ${email} to subsystems...`)

    await createIdMapping(userId, "portal", userId, "user", tenantId)

    console.log(`[UserSync] User ${email} sync completed`)
  })

  console.log("✅ User sync worker registered")
}

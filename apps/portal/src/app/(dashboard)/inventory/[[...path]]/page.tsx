import { auth } from "@nexus/auth"
import { redirect } from "next/navigation"
import { IframeContainer } from "@/components/subsystem/iframe-container"

export default async function InventoryPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const medusaUrl = process.env.MEDUSA_URL || "http://localhost:9000/app"

  return (
    <div className="h-[calc(100vh-60px)] w-full">
      <IframeContainer
        src={medusaUrl}
        title="Inventory - Medusa"
        headlessStyleUrl="/subsystem-styles/medusa-headless.css"
      />
    </div>
  )
}

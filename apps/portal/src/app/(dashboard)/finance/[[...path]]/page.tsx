import { auth } from "@nexus/auth"
import { redirect } from "next/navigation"
import { IframeContainer } from "@/components/subsystem/iframe-container"

export default async function FinancePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const middayUrl = process.env.MIDDAY_URL || "http://localhost:3002"

  return (
    <div className="h-[calc(100vh-60px)] w-full">
      <IframeContainer
        src={middayUrl}
        title="Finance - Midday"
        headlessStyleUrl="/subsystem-styles/midday-headless.css"
      />
    </div>
  )
}

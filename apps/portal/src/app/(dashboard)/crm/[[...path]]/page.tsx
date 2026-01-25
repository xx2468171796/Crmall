import { auth } from "@nexus/auth"
import { redirect } from "next/navigation"
import { IframeContainer } from "@/components/subsystem/iframe-container"

export default async function CRMPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const nocodbUrl = process.env.NOCODB_URL || "http://localhost:8080"

  return (
    <div className="h-[calc(100vh-60px)] w-full">
      <IframeContainer
        src={`${nocodbUrl}/dashboard`}
        title="CRM - NocoDB"
        headlessStyleUrl="/subsystem-styles/nocodb-headless.css"
      />
    </div>
  )
}

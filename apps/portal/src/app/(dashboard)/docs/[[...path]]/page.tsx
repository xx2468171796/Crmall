import { auth } from "@nexus/auth"
import { redirect } from "next/navigation"
import { IframeContainer } from "@/components/subsystem/iframe-container"

export default async function DocsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const appflowyUrl = process.env.APPFLOWY_URL || "http://localhost:8000"

  return (
    <div className="h-[calc(100vh-60px)] w-full">
      <IframeContainer
        src={appflowyUrl}
        title="Docs - AppFlowy"
        headlessStyleUrl="/subsystem-styles/appflowy-headless.css"
      />
    </div>
  )
}

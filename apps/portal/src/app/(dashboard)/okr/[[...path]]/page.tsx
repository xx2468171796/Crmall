import { auth } from "@nexus/auth"
import { redirect } from "next/navigation"
import { IframeContainer } from "@/components/subsystem/iframe-container"

export default async function OKRPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const planeUrl = process.env.PLANE_URL || "http://localhost:3001"

  return (
    <div className="h-[calc(100vh-60px)] w-full">
      <IframeContainer
        src={planeUrl}
        title="OKR - Plane"
        headlessStyleUrl="/subsystem-styles/plane-headless.css"
      />
    </div>
  )
}

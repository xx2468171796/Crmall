import { auth } from "@nexus/auth"
import { redirect } from "next/navigation"
import { IframeContainer } from "@/components/subsystem/iframe-container"

export default async function LearningPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const lmsUrl = process.env.CLASSROOMIO_URL || "http://localhost:5173"

  return (
    <div className="h-[calc(100vh-60px)] w-full">
      <IframeContainer
        src={lmsUrl}
        title="Learning - ClassroomIO"
        headlessStyleUrl="/subsystem-styles/classroomio-headless.css"
      />
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface IframeContainerProps {
  src: string
  title: string
  headlessStyleUrl?: string
  onMessage?: (data: unknown) => void
}

export function IframeContainer({ src, title, headlessStyleUrl, onMessage }: IframeContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== new URL(src).origin) return
      onMessage?.(event.data)
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [src, onMessage])

  const handleIframeLoad = () => {
    setIsLoading(false)
    
    if (headlessStyleUrl && iframeRef.current?.contentDocument) {
      try {
        const link = iframeRef.current.contentDocument.createElement("link")
        link.rel = "stylesheet"
        link.href = headlessStyleUrl
        iframeRef.current.contentDocument.head.appendChild(link)
      } catch {
        console.warn("Cannot inject headless styles due to cross-origin restrictions")
      }
    }
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">加载 {title}...</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        className="h-full w-full border-0"
        onLoad={handleIframeLoad}
        allow="clipboard-write; clipboard-read"
      />
    </div>
  )
}

export function useSubsystemMessage<T = unknown>(subsystemOrigin: string) {
  const [lastMessage, setLastMessage] = useState<T | null>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== subsystemOrigin) return
      setLastMessage(event.data as T)
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [subsystemOrigin])

  return lastMessage
}

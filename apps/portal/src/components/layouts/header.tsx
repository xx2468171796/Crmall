"use client"

import { Menu, Bell, User } from "lucide-react"
import { Button } from "@nexus/ui"
import { useSidebarStore } from "@/store/sidebar"

export function Header() {
  const { toggle } = useSidebarStore()

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={toggle} className="lg:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>

      <Button variant="ghost" size="icon">
        <User className="h-5 w-5" />
        <span className="sr-only">User menu</span>
      </Button>
    </header>
  )
}

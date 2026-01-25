"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, Building2 } from "lucide-react"
import { cn, Button } from "@nexus/ui"
import { useSidebarStore } from "@/store/sidebar"
import { useMenu, type MenuItem } from "@/hooks/use-menu"

function NavItem({ item, isCollapsed, pathname }: { item: MenuItem; isCollapsed: boolean; pathname: string }) {
  const isActive = pathname.startsWith(item.url)
  const Icon = item.icon

  return (
    <Link
      href={item.url}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggle } = useSidebarStore()
  const { menu, isLoading } = useMenu()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Building2 className="h-6 w-6" />
            <span>Enterprise Nexus</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(isCollapsed && "mx-auto")}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-muted-foreground">加载中...</span>
          </div>
        ) : (
          menu.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              pathname={pathname}
            />
          ))
        )}
      </nav>
    </aside>
  )
}

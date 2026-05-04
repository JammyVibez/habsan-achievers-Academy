"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BookOpen, ClipboardList, MessageSquare, Calendar, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { dashboardLogout } from "@/lib/dashboard-logout"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher" },
  { icon: Users, label: "My Students", href: "/teacher/students" },
  { icon: BookOpen, label: "My Subjects", href: "/teacher/subjects" },
  { icon: ClipboardList, label: "Results Entry", href: "/teacher/results" },
  { icon: Calendar, label: "Attendance", href: "/teacher/attendance" },
  { icon: MessageSquare, label: "Messages", href: "/teacher/messages" },
]

export function TeacherSidebar({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
} = {}) {
  const pathname = usePathname()

  return (
    <aside className={cn("w-64 border-r border-border bg-card flex flex-col", className)}>
      <div className="p-6 border-b border-border">
        <Link href="/teacher" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            HAA
          </div>
          <div>
            <div className="font-heading font-bold text-sm leading-tight">Teacher Portal</div>
            <div className="text-xs text-muted-foreground">HABSAN ACHIEVERS</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/teacher" && pathname?.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-border p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span>← Back to Website</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            void dashboardLogout()
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  )
}

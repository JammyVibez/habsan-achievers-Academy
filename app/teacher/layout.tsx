import type React from "react"
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar"
import { TeacherHeader } from "@/components/teacher/teacher-header"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/current-user"
import { Menu } from "lucide-react"

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'teacher') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <TeacherSidebar className="hidden md:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b bg-card px-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Teacher navigation</SheetTitle>
              </SheetHeader>
              <TeacherSidebar className="w-full border-r-0" />
            </SheetContent>
          </Sheet>
          <p className="text-sm font-semibold">Teacher Dashboard</p>
          <div className="w-9" />
        </div>
        <TeacherHeader className="hidden md:flex" />
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

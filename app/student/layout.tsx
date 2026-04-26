import type React from "react"
import { StudentSidebar } from "@/components/student/student-sidebar"
import { StudentHeader } from "@/components/student/student-header"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/current-user"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'student') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentHeader />
        <main className="flex-1 p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  )
}

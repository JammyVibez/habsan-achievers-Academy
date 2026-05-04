import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { getCurrentUser } from "@/lib/current-user"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentTermAndSession } from "@/lib/report-card"
import { decimalToNumber } from "@/lib/grades"

export default async function TeacherStudentsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "teacher") redirect("/login")
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: { subjects: true },
  })
  if (!teacher) redirect("/login")

  const classes = new Set<string>()
  if (teacher.homeroomClass?.trim()) classes.add(teacher.homeroomClass.trim())
  teacher.subjects.forEach((s) => classes.add(s.classLevel.trim()))
  const where = classes.size > 0 ? { classLevel: { in: Array.from(classes) } } : undefined
  const ctx = await getCurrentTermAndSession()
  const students = await prisma.student.findMany({
    where,
    include: {
      user: true,
      results: ctx ? { where: { termId: ctx.term.id, sessionId: ctx.session.id } } : false,
      attendance: true,
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">My Students</h2>
        <p className="text-muted-foreground">View and manage your students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>Students in your assigned subject classes and homeroom</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                disabled
                placeholder="Live list (search coming soon)..."
                className="h-10 w-full rounded-md border border-input bg-background px-3 pl-9 text-sm text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-3">
            {students.map((student) => {
              const scores = student.results ? student.results.map((r) => decimalToNumber(r.total)) : []
              const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—"
              const attended = student.attendance.filter((a) => a.status === "present" || a.status === "late").length
              const attendance = student.attendance.length > 0 ? `${Math.round((attended / student.attendance.length) * 100)}%` : "—"
              return (
              <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold">{student.user.firstName} {student.user.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.admissionNumber} • {student.classLevel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="font-semibold text-primary">{avg === "—" ? "—" : `${avg}%`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <p className="font-semibold">{attendance}</p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

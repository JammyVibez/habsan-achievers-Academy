import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, ClipboardCheck, Calendar } from "lucide-react"
import { getCurrentUser } from "@/lib/current-user"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentTermAndSession } from "@/lib/report-card"

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "teacher") redirect("/login")

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: { subjects: { include: { subject: true } } },
  })
  if (!teacher) redirect("/login")

  const homeroom = teacher.homeroomClass?.trim() || null
  const studentsCount = homeroom ? await prisma.student.count({ where: { classLevel: homeroom } }) : 0
  const ctx = await getCurrentTermAndSession()
  const uploadedThisTerm = ctx
    ? await prisma.result.count({ where: { teacherId: teacher.id, termId: ctx.term.id, sessionId: ctx.session.id } })
    : 0
  const pendingResults = Math.max(0, studentsCount * Math.max(teacher.subjects.length, 1) - uploadedThisTerm)

  const stats = [
    {
      title: "My Students",
      value: String(studentsCount),
      icon: Users,
      description: homeroom ? `Homeroom ${homeroom}` : "No homeroom assigned",
    },
    {
      title: "Subjects Teaching",
      value: String(teacher.subjects.length),
      icon: BookOpen,
      description: teacher.subjects.map((s) => s.subject.name).slice(0, 2).join(", ") || "No subjects assigned",
    },
    {
      title: "Results Uploaded (Current Term)",
      value: String(uploadedThisTerm),
      icon: ClipboardCheck,
      description: ctx ? `${ctx.term.termName} · ${ctx.session.sessionName}` : "Current term not configured",
    },
    {
      title: "Pending Results",
      value: String(pendingResults),
      icon: Calendar,
      description: "Estimated from class size and subjects",
    },
  ]

  const recent = await prisma.result.findMany({
    where: { teacherId: teacher.id },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: { subject: { select: { name: true } }, student: { select: { classLevel: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">Welcome Back, {user.firstName}!</h2>
        <p className="text-muted-foreground">Live overview from your assigned classes and uploaded results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-heading font-bold text-2xl mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(teacher.subjects.length === 0
                ? [{ subject: "No subjects assigned yet", class: homeroom || "—" }]
                : teacher.subjects.map((s) => ({ subject: s.subject.name, class: homeroom || "—" }))).map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">{schedule.subject}</p>
                    <p className="text-sm text-muted-foreground">Class: {schedule.class}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recent.length === 0
                ? [{ action: "No result uploads yet", time: "—" }]
                : recent.map((r) => ({
                    action: `Uploaded ${r.subject.name} result (${r.student.classLevel})`,
                    time: new Date(r.updatedAt).toLocaleString(),
                  }))).map((activity, index) => (
                <div key={index} className="pb-3 border-b border-border last:border-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

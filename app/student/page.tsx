import Link from "next/link"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, Calendar, TrendingUp } from "lucide-react"
import { getCurrentUser } from "@/lib/current-user"
import { prisma } from "@/lib/prisma"
import { getCurrentTermAndSession } from "@/lib/report-card"
import { decimalToNumber } from "@/lib/grades"

export default async function StudentDashboardPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") redirect("/login")

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: { attendance: true },
  })
  if (!student) redirect("/login")

  const ctx = await getCurrentTermAndSession()
  const results = ctx
    ? await prisma.result.findMany({
        where: { studentId: student.id, termId: ctx.term.id, sessionId: ctx.session.id },
        select: { total: true },
      })
    : []
  const scores = results.map((r) => decimalToNumber(r.total))
  const average = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—"

  const attendanceTotal = student.attendance.length
  const attendanceGood = student.attendance.filter((a) => a.status === "present" || a.status === "late").length
  const attendanceRate = attendanceTotal > 0 ? `${Math.round((attendanceGood / attendanceTotal) * 100)}%` : "—"

  const classSize = await prisma.student.count({ where: { classLevel: student.classLevel } })

  const stats = [
    {
      title: "Current Class",
      value: student.classLevel,
      icon: BookOpen,
      description: "From student profile",
    },
    {
      title: "Current Average",
      value: average === "—" ? "—" : `${average}%`,
      icon: Award,
      description: ctx ? `${ctx.term.termName}` : "Term not configured",
    },
    {
      title: "Attendance Rate",
      value: attendanceRate,
      icon: Calendar,
      description: `${attendanceTotal} records`,
    },
    {
      title: "Class Size",
      value: String(classSize),
      icon: TrendingUp,
      description: `${student.classLevel} students`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">Welcome Back, Student!</h2>
        <p className="text-muted-foreground">Here's your academic overview</p>
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
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Grades are not shown here without your <strong>result checking PIN</strong> issued by the school.
              Use the button below — the same PIN works on the public Check Results page.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/student/results">Enter PIN &amp; view results</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto sm:ml-2">
              <Link href="/pin-shop">Where to get PIN</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { event: "Mathematics Test", date: "Tomorrow, 10:00 AM" },
                { event: "Physics Practical", date: "Friday, 2:00 PM" },
                { event: "Mid-term Break", date: "Next Week" },
                { event: "Parent-Teacher Meeting", date: "Dec 15, 2024" },
              ].map((item, index) => (
                <div key={index} className="pb-3 border-b border-border last:border-0">
                  <p className="text-sm font-medium">{item.event}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

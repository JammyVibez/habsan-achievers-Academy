import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, User, Clock } from "lucide-react"
import { getCurrentUser } from "@/lib/current-user"
import { prisma } from "@/lib/prisma"

export default async function StudentSubjectsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") redirect("/login")
  const student = await prisma.student.findUnique({ where: { userId: user.id } })
  if (!student) redirect("/login")

  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      teacherLinks: {
        include: {
          teacher: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
        take: 1,
      },
    },
    take: 60,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">My Subjects</h2>
        <p className="text-muted-foreground">View your enrolled subjects and schedules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>{subject.description || "No description provided."}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {subject.teacherLinks[0]
                    ? `${subject.teacherLinks[0].teacher.user.firstName} ${subject.teacherLinks[0].teacher.user.lastName}`
                    : "Teacher not assigned"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Schedule managed by school timetable</span>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-sm font-medium">Class: {student.classLevel}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

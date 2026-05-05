import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/current-user"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function TeacherSubjectsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "teacher") redirect("/login")

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: {
      subjects: {
        include: { subject: true },
        orderBy: [{ subject: { name: "asc" } }, { classLevel: "asc" }],
      },
    },
  })
  if (!teacher) redirect("/login")

  const grouped = new Map<string, string[]>()
  teacher.subjects.forEach((entry) => {
    const key = entry.subject.name
    const existing = grouped.get(key) ?? []
    if (!existing.includes(entry.classLevel)) existing.push(entry.classLevel)
    grouped.set(key, existing)
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">My Subjects</h2>
        <p className="text-muted-foreground">Subjects and classes assigned to your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Teaching Load</CardTitle>
          <CardDescription>Select a class to jump into result entry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {grouped.size === 0 ? (
            <p className="text-sm text-muted-foreground">No subject/class assignments yet. Ask admin to assign your classes.</p>
          ) : (
            Array.from(grouped.entries()).map(([subject, classes]) => (
              <div key={subject} className="rounded-lg border p-4">
                <p className="font-semibold">{subject}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {classes.map((classLevel) => (
                    <Button key={`${subject}-${classLevel}`} asChild size="sm" variant="outline">
                      <Link href={`/teacher/results?subject=${encodeURIComponent(subject)}&classLevel=${encodeURIComponent(classLevel)}`}>
                        {classLevel} · Enter results
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

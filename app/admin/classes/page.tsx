import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, BookOpen, User } from "lucide-react"

// Mock data
const classes = [
  {
    id: 1,
    name: "JSS 1A",
    level: "Junior Secondary",
    classTeacher: "Mrs. Fatima Abdullahi",
    studentCount: 35,
    subjects: 12,
  },
  {
    id: 2,
    name: "JSS 1B",
    level: "Junior Secondary",
    classTeacher: "Mr. Adebayo Johnson",
    studentCount: 32,
    subjects: 12,
  },
  {
    id: 3,
    name: "JSS 2A",
    level: "Junior Secondary",
    classTeacher: "Mrs. Blessing Okafor",
    studentCount: 38,
    subjects: 13,
  },
  {
    id: 4,
    name: "SS 1A",
    level: "Senior Secondary",
    classTeacher: "Mr. Chukwudi Okonkwo",
    studentCount: 30,
    subjects: 14,
  },
  {
    id: 5,
    name: "SS 2A",
    level: "Senior Secondary",
    classTeacher: "Mrs. Amina Bello",
    studentCount: 28,
    subjects: 14,
  },
  {
    id: 6,
    name: "SS 3A",
    level: "Senior Secondary",
    classTeacher: "Mr. Emeka Nwosu",
    studentCount: 25,
    subjects: 15,
  },
]

export default function AdminClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Class Management</h1>
          <p className="text-muted-foreground">Manage all classes and class assignments</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Class
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{classItem.name}</CardTitle>
                  <CardDescription>{classItem.level}</CardDescription>
                </div>
                <Badge variant="outline">{classItem.studentCount} students</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Class Teacher:</span>
                </div>
                <p className="text-sm font-medium">{classItem.classTeacher}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{classItem.studentCount} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{classItem.subjects} Subjects</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

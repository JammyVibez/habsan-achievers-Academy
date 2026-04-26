import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Mail } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function TeacherStudentsPage() {
  const students = [
    {
      name: "John Doe",
      admissionNo: "HAA/2024/001",
      class: "SS 2A",
      average: "85%",
      attendance: "95%",
      avatar: "/placeholder.svg",
    },
    {
      name: "Jane Smith",
      admissionNo: "HAA/2024/002",
      class: "SS 2A",
      average: "78%",
      attendance: "92%",
      avatar: "/placeholder.svg",
    },
    {
      name: "Michael Johnson",
      admissionNo: "HAA/2024/003",
      class: "SS 2A",
      average: "82%",
      attendance: "98%",
      avatar: "/placeholder.svg",
    },
    {
      name: "Sarah Williams",
      admissionNo: "HAA/2024/004",
      class: "SS 2A",
      average: "91%",
      attendance: "100%",
      avatar: "/placeholder.svg",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">My Students</h2>
        <p className="text-muted-foreground">View and manage your students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>Students in your classes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="SS3A">SS 3A</SelectItem>
                <SelectItem value="SS2A">SS 2A</SelectItem>
                <SelectItem value="SS1B">SS 1B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {students.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.admissionNo} • {student.class}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="font-semibold text-primary">{student.average}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <p className="font-semibold">{student.attendance}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

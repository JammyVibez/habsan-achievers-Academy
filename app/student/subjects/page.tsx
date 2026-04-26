import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, User, Clock } from "lucide-react"

export default function StudentSubjectsPage() {
  const subjects = [
    {
      name: "Mathematics",
      teacher: "Mr. Adebayo Johnson",
      schedule: "Mon, Wed, Fri - 8:00 AM",
      room: "Room 201",
      description: "Advanced mathematics covering algebra, calculus, and statistics",
    },
    {
      name: "English Language",
      teacher: "Mrs. Fatima Abubakar",
      schedule: "Tue, Thu - 9:00 AM",
      room: "Room 105",
      description: "Comprehensive English language and literature studies",
    },
    {
      name: "Physics",
      teacher: "Dr. Chukwuma Okafor",
      schedule: "Mon, Wed - 10:00 AM",
      room: "Lab 1",
      description: "Practical and theoretical physics with laboratory sessions",
    },
    {
      name: "Chemistry",
      teacher: "Mrs. Blessing Eze",
      schedule: "Tue, Thu - 11:00 AM",
      room: "Lab 2",
      description: "Organic and inorganic chemistry with experiments",
    },
    {
      name: "Biology",
      teacher: "Mr. Ibrahim Musa",
      schedule: "Wed, Fri - 1:00 PM",
      room: "Lab 3",
      description: "Life sciences covering human biology, ecology, and genetics",
    },
    {
      name: "Economics",
      teacher: "Mrs. Grace Okonkwo",
      schedule: "Mon, Thu - 2:00 PM",
      room: "Room 304",
      description: "Microeconomics and macroeconomics principles",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">My Subjects</h2>
        <p className="text-muted-foreground">View your enrolled subjects and schedules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subject, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>{subject.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{subject.teacher}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{subject.schedule}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-sm font-medium">{subject.room}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

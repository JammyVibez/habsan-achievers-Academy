import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, ClipboardCheck, Calendar } from "lucide-react"

export default function TeacherDashboardPage() {
  const stats = [
    {
      title: "My Students",
      value: "124",
      icon: Users,
      description: "Across 4 classes",
    },
    {
      title: "Subjects Teaching",
      value: "3",
      icon: BookOpen,
      description: "Mathematics, Physics",
    },
    {
      title: "Pending Results",
      value: "12",
      icon: ClipboardCheck,
      description: "To be submitted",
    },
    {
      title: "Classes Today",
      value: "5",
      icon: Calendar,
      description: "Next: 10:00 AM",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">Welcome Back, Teacher!</h2>
        <p className="text-muted-foreground">Here's an overview of your teaching activities</p>
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
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "08:00 - 09:00", subject: "Mathematics", class: "SS 2A" },
                { time: "10:00 - 11:00", subject: "Physics", class: "SS 3B" },
                { time: "11:30 - 12:30", subject: "Mathematics", class: "SS 1C" },
                { time: "13:00 - 14:00", subject: "Physics", class: "SS 2B" },
              ].map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">{schedule.subject}</p>
                    <p className="text-sm text-muted-foreground">{schedule.class}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{schedule.time}</div>
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
              {[
                { action: "Uploaded results for SS 3A Mathematics", time: "2 hours ago" },
                { action: "Marked attendance for SS 2B Physics", time: "5 hours ago" },
                { action: "Posted assignment for SS 1C", time: "1 day ago" },
                { action: "Updated lesson plan", time: "2 days ago" },
              ].map((activity, index) => (
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

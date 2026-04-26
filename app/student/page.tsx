import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, Calendar, TrendingUp } from "lucide-react"

export default function StudentDashboardPage() {
  const stats = [
    {
      title: "Current Class",
      value: "SS 2A",
      icon: BookOpen,
      description: "Science Department",
    },
    {
      title: "Current Average",
      value: "78.5%",
      icon: Award,
      description: "Good performance",
    },
    {
      title: "Attendance Rate",
      value: "95%",
      icon: Calendar,
      description: "Excellent attendance",
    },
    {
      title: "Class Position",
      value: "5th",
      icon: TrendingUp,
      description: "Out of 45 students",
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
              Grades are not shown here without your <strong>result checking PIN</strong> (sold at the PIN shop or by
              the school). Use the button below — the same PIN works on the public Check Results page.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/student/results">Enter PIN &amp; view results</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto sm:ml-2">
              <Link href="/pin-shop">PIN shop</Link>
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

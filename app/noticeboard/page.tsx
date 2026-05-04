import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Users } from "lucide-react"

export default function NoticeboardPage() {
  const notices = [
    {
      title: "Mid-Term Break Announcement",
      content:
        "The school will be closed for mid-term break from December 20th to January 5th. Classes resume on January 6th, 2025.",
      date: "2024-12-10",
      priority: "high",
      audience: "all",
    },
    {
      title: "Parent-Teacher Meeting",
      content:
        "All parents are invited to attend the parent-teacher meeting scheduled for December 15th at 10:00 AM in the school hall.",
      date: "2024-12-08",
      priority: "urgent",
      audience: "parents",
    },
    {
      title: "Sports Day Registration",
      content:
        "Registration for the annual sports day is now open. Students interested in participating should register at the sports office before December 12th.",
      date: "2024-12-05",
      priority: "medium",
      audience: "students",
    },
    {
      title: "New Library Books Available",
      content:
        "The school library has received new books covering various subjects. Students are encouraged to visit and borrow books for their studies.",
      date: "2024-12-03",
      priority: "low",
      audience: "all",
    },
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-destructive">Urgent</Badge>
      case "high":
        return <Badge className="bg-orange-500">High Priority</Badge>
      case "medium":
        return <Badge className="bg-blue-500">Medium</Badge>
      default:
        return <Badge variant="secondary">Low</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-4xl mb-4">Noticeboard</h1>
            <p className="text-muted-foreground text-lg">Stay updated with school announcements and news</p>
          </div>

          <div className="space-y-6">
            {notices.map((notice, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="mb-2">{notice.title}</CardTitle>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(notice.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {notice.audience.charAt(0).toUpperCase() + notice.audience.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {getPriorityBadge(notice.priority)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{notice.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

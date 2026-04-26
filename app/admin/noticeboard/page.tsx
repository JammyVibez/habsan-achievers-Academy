import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

// Mock data
const notices = [
  {
    id: 1,
    title: "Mid-Term Break Announcement",
    content: "The school will be closed for mid-term break from March 15-22, 2024.",
    target: "all",
    priority: "high",
    published: true,
    createdAt: "2024-03-01",
    author: "Admin",
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    content: "All parents are invited to attend the PTA meeting on March 30, 2024.",
    target: "parents",
    priority: "medium",
    published: true,
    createdAt: "2024-03-05",
    author: "Admin",
  },
  {
    id: 3,
    title: "Sports Day Preparation",
    content: "Students should prepare for the annual sports day scheduled for April 10, 2024.",
    target: "students",
    priority: "medium",
    published: true,
    createdAt: "2024-03-08",
    author: "Sports Coordinator",
  },
  {
    id: 4,
    title: "Staff Meeting - Draft",
    content: "Monthly staff meeting to discuss curriculum updates.",
    target: "teachers",
    priority: "low",
    published: false,
    createdAt: "2024-03-10",
    author: "Admin",
  },
]

export default function AdminNoticeboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Noticeboard Management</h1>
          <p className="text-muted-foreground">Create and manage school announcements</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Notice
        </Button>
      </div>

      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    {!notice.published && (
                      <Badge variant="secondary">
                        <EyeOff className="mr-1 h-3 w-3" />
                        Draft
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Posted by {notice.author} on {new Date(notice.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{notice.content}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Target: {notice.target}</Badge>
                <Badge
                  variant={
                    notice.priority === "high" ? "destructive" : notice.priority === "medium" ? "default" : "secondary"
                  }
                >
                  {notice.priority} priority
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

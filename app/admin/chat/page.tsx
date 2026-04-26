import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, AlertCircle } from "lucide-react"

// Mock data
const chatStats = {
  totalMessages: 1247,
  activeConversations: 45,
  flaggedMessages: 3,
}

const flaggedMessages = [
  {
    id: 1,
    from: "Student A",
    to: "Student B",
    content: "This message was flagged for review...",
    reason: "Inappropriate language",
    date: "2024-03-10",
  },
]

export default function AdminChatPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Chat Management</h1>
          <p className="text-muted-foreground">Monitor and manage school communications</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatStats.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This academic session</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatStats.activeConversations}</div>
            <p className="text-xs text-muted-foreground">Currently ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Messages</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{chatStats.flaggedMessages}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {flaggedMessages.length > 0 ? (
            <div className="space-y-4">
              {flaggedMessages.map((message) => (
                <div key={message.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        {message.from} → {message.to}
                      </p>
                      <p className="text-sm text-muted-foreground">{new Date(message.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="destructive">{message.reason}</Badge>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Full Conversation
                    </Button>
                    <Button size="sm" variant="outline">
                      Dismiss
                    </Button>
                    <Button size="sm" variant="destructive">
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No flagged messages</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

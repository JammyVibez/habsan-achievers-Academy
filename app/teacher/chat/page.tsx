import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data
const conversations = [
  {
    id: 1,
    name: "Chioma Okafor",
    role: "JSS 1A Student",
    lastMessage: "Thank you for the feedback sir",
    time: "2:15 PM",
    unread: 1,
    online: true,
  },
  {
    id: 2,
    name: "JSS 1A Class Group",
    role: "Class Group • 35 members",
    lastMessage: "You: Don't forget about tomorrow's test",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Mr. Emmanuel Okafor",
    role: "Parent",
    lastMessage: "Thank you for the update on Chioma's progress",
    time: "2 days ago",
    unread: 0,
    online: false,
  },
]

export default function TeacherChatPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Messages</h1>
          <p className="text-muted-foreground">Communicate with students and parents</p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className="w-full rounded-lg p-4 text-left hover:bg-accent transition-colors border"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>
                          {conversation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold truncate">{conversation.name}</p>
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{conversation.role}</p>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

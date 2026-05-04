import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Send, MoreVertical, Phone, Video } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data
const conversations = [
  {
    id: 1,
    name: "Mr. Adebayo Johnson",
    role: "Mathematics Teacher",
    lastMessage: "Your assignment has been graded",
    time: "10:30 AM",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "JSS 1A Class Group",
    role: "Class Group",
    lastMessage: "Don't forget about tomorrow's test",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Mrs. Fatima Abdullahi",
    role: "English Teacher",
    lastMessage: "Please submit your essay by Friday",
    time: "2 days ago",
    unread: 0,
    online: false,
  },
]

const messages = [
  {
    id: 1,
    sender: "Mr. Adebayo Johnson",
    content: "Good morning! I've reviewed your mathematics assignment.",
    time: "10:25 AM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    content: "Good morning sir! Thank you for checking it.",
    time: "10:28 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Mr. Adebayo Johnson",
    content: "Your assignment has been graded. You scored 85/100. Well done!",
    time: "10:30 AM",
    isOwn: false,
  },
  {
    id: 4,
    sender: "You",
    content: "Thank you sir! I'll work harder on the areas I missed.",
    time: "10:32 AM",
    isOwn: true,
  },
]

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="h-[calc(100vh-8rem)]">
          <Card className="h-full">
            <div className="grid h-full md:grid-cols-[320px_1fr]">
              {/* Conversations List */}
              <div className="border-r">
                <CardHeader className="border-b">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">Messages</h2>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search conversations..." className="pl-8" />
                    </div>
                  </div>
                </CardHeader>
                <ScrollArea className="h-[calc(100%-140px)]">
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        className="w-full rounded-lg p-3 text-left hover:bg-accent transition-colors"
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
                              <p className="font-semibold text-sm truncate">{conversation.name}</p>
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
              </div>

              {/* Chat Area */}
              <div className="flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Mr. Adebayo Johnson</p>
                      <p className="text-xs text-muted-foreground">Mathematics Teacher • Online</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] space-y-1 ${message.isOwn ? "items-end" : "items-start"}`}>
                          {!message.isOwn && (
                            <p className="text-xs font-semibold text-muted-foreground">{message.sender}</p>
                          )}
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{message.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input placeholder="Type a message..." className="flex-1" />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

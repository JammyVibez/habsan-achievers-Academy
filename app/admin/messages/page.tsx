import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send, Inbox, Archive, Trash2, Star, Reply } from 'lucide-react'

// Mock data
const messages = [
  {
    id: 1,
    from: "Mrs. Aisha Mohammed",
    subject: "Request for Leave",
    preview: "I would like to request a leave of absence for...",
    date: "2 hours ago",
    unread: true,
    starred: false,
  },
  {
    id: 2,
    from: "Parent - Mr. Bello",
    subject: "Inquiry about Child's Progress",
    preview: "I wanted to discuss my daughter's recent performance...",
    date: "5 hours ago",
    unread: true,
    starred: true,
  },
  {
    id: 3,
    from: "Mr. Chukwudi Okafor",
    subject: "Science Lab Equipment Request",
    preview: "We need to order new equipment for the chemistry lab...",
    date: "Yesterday",
    unread: false,
    starred: false,
  },
]

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with teachers, students, and parents</p>
        </div>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Compose Message
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>3 unread messages</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {messages.map((message) => (
                <button
                  key={message.id}
                  className="w-full p-4 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`font-medium text-sm ${message.unread ? "text-foreground" : "text-muted-foreground"}`}>
                      {message.from}
                    </span>
                    {message.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                  </div>
                  <div className={`text-sm mb-1 ${message.unread ? "font-medium" : ""}`}>
                    {message.subject}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {message.preview}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{message.date}</span>
                    {message.unread && (
                      <Badge variant="default" className="h-5 px-1.5 text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Content / Compose */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Tabs defaultValue="compose">
              <TabsList>
                <TabsTrigger value="compose">Compose</TabsTrigger>
                <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
              </TabsList>

              <TabsContent value="compose" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select>
                    <SelectTrigger id="recipient">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-teachers">All Teachers</SelectItem>
                      <SelectItem value="all-students">All Students</SelectItem>
                      <SelectItem value="all-parents">All Parents</SelectItem>
                      <SelectItem value="specific">Specific User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Enter message subject" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    className="min-h-[300px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline">Save Draft</Button>
                </div>
              </TabsContent>

              <TabsContent value="broadcast" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="broadcast-group">Broadcast To</Label>
                  <Select>
                    <SelectTrigger id="broadcast-group">
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="teachers">All Teachers</SelectItem>
                      <SelectItem value="students">All Students</SelectItem>
                      <SelectItem value="parents">All Parents</SelectItem>
                      <SelectItem value="class">Specific Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="broadcast-subject">Subject</Label>
                  <Input id="broadcast-subject" placeholder="Enter broadcast subject" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="broadcast-message">Message</Label>
                  <Textarea
                    id="broadcast-message"
                    placeholder="Type your broadcast message here..."
                    className="min-h-[300px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send Broadcast
                  </Button>
                  <Button variant="outline">Schedule</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

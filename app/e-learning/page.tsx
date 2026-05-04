import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Video,
  Download,
  MessageSquare,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

// Mock data
const courses = [
  {
    id: 1,
    title: "Mathematics - JSS 1",
    subject: "Mathematics",
    teacher: "Mr. Adebayo",
    progress: 65,
    lessons: 24,
    completed: 16,
    thumbnail: "/mathematics-classroom.png",
  },
  {
    id: 2,
    title: "English Language - JSS 1",
    subject: "English",
    teacher: "Mrs. Aisha",
    progress: 45,
    lessons: 20,
    completed: 9,
    thumbnail: "/english-books.jpg",
  },
  {
    id: 3,
    title: "Basic Science - JSS 1",
    subject: "Science",
    teacher: "Mr. Chukwudi",
    progress: 80,
    lessons: 18,
    completed: 14,
    thumbnail: "/science-laboratory.png",
  },
]

const recentLessons = [
  {
    id: 1,
    title: "Introduction to Algebra",
    subject: "Mathematics",
    duration: "45 mins",
    type: "video",
    status: "completed",
  },
  {
    id: 2,
    title: "Parts of Speech",
    subject: "English",
    duration: "30 mins",
    type: "video",
    status: "in-progress",
  },
  {
    id: 3,
    title: "The Solar System",
    subject: "Science",
    duration: "40 mins",
    type: "video",
    status: "not-started",
  },
]

const assignments = [
  {
    id: 1,
    title: "Algebraic Expressions Worksheet",
    subject: "Mathematics",
    dueDate: "Jan 20, 2025",
    status: "pending",
  },
  {
    id: 2,
    title: "Essay: My Best Friend",
    subject: "English",
    dueDate: "Jan 18, 2025",
    status: "submitted",
  },
  {
    id: 3,
    title: "Science Project: Water Cycle",
    subject: "Science",
    dueDate: "Jan 25, 2025",
    status: "pending",
  },
]

export default function ELearningPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-12">
        <div className="container">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">E-Learning Platform</Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Learn Anytime, Anywhere</h1>
            <p className="text-lg text-white/90 mb-6">
              Access your courses, watch video lessons, complete assignments, and track your progress all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="secondary">
                <Play className="mr-2 h-5 w-5" />
                Continue Learning
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Browse Courses
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm text-muted-foreground">Active Courses</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">45</div>
                      <div className="text-sm text-muted-foreground">Completed Lessons</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent-foreground">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-sm text-muted-foreground">Certificates Earned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Courses */}
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt={course.title}
                          className="object-cover w-full h-full"
                        />
                        <Badge className="absolute top-2 right-2">{course.subject}</Badge>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold mb-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">by {course.teacher}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                              {course.completed} of {course.lessons} lessons
                            </span>
                          </div>
                        </div>
                        <Button className="w-full mt-4" asChild>
                          <Link href={`/e-learning/course/${course.id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Continue Learning
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Lessons & Assignments */}
            <Tabs defaultValue="lessons">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lessons">Recent Lessons</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {recentLessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Video className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{lesson.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{lesson.subject}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              lesson.status === "completed"
                                ? "default"
                                : lesson.status === "in-progress"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {lesson.status === "completed"
                              ? "Completed"
                              : lesson.status === "in-progress"
                                ? "In Progress"
                                : "Not Started"}
                          </Badge>
                          <Button size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assignments" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{assignment.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{assignment.subject}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Due: {assignment.dueDate}
                              </span>
                            </div>
                          </div>
                          <Badge variant={assignment.status === "submitted" ? "default" : "outline"}>
                            {assignment.status === "submitted" ? "Submitted" : "Pending"}
                          </Badge>
                          <Button size="sm" variant={assignment.status === "submitted" ? "outline" : "default"}>
                            {assignment.status === "submitted" ? "View" : "Submit"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Materials
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask Teacher
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Progress
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Live Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <div className="font-semibold text-sm mb-1">Mathematics</div>
                  <div className="text-xs text-muted-foreground mb-2">Today, 2:00 PM</div>
                  <Button size="sm" className="w-full">
                    Join Class
                  </Button>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="font-semibold text-sm mb-1">English Language</div>
                  <div className="text-xs text-muted-foreground mb-2">Tomorrow, 10:00 AM</div>
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    Set Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lessons Completed</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Study Time</span>
                  <span className="font-semibold">8.5 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assignments Done</span>
                  <span className="font-semibold">5/7</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

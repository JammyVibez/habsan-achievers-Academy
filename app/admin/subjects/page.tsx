import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, BookOpen, Users } from 'lucide-react'

// Mock data
const subjects = [
  { id: 1, name: "Mathematics", code: "MTH101", teachers: 5, students: 450, classes: "JSS1-SS3" },
  { id: 2, name: "English Language", code: "ENG101", teachers: 6, students: 480, classes: "JSS1-SS3" },
  { id: 3, name: "Physics", code: "PHY201", teachers: 3, students: 180, classes: "SS1-SS3" },
  { id: 4, name: "Chemistry", code: "CHM201", teachers: 3, students: 180, classes: "SS1-SS3" },
  { id: 5, name: "Biology", code: "BIO201", teachers: 4, students: 200, classes: "SS1-SS3" },
  { id: 6, name: "Computer Science", code: "CSC101", teachers: 2, students: 320, classes: "JSS1-SS3" },
  { id: 7, name: "Civic Education", code: "CIV101", teachers: 3, students: 480, classes: "JSS1-SS3" },
  { id: 8, name: "Agricultural Science", code: "AGR101", teachers: 2, students: 150, classes: "JSS1-SS3" },
]

export default function SubjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Subject Management</h1>
          <p className="text-muted-foreground">Manage subjects, assign teachers, and track enrollment</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">Across all levels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Core Subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Mandatory for all</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Elective Subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Student choice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Teachers Assigned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1">Active instructors</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Subjects</CardTitle>
              <CardDescription>View and manage subject information</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search subjects..." className="pl-8 w-[250px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{subject.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{subject.code}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{subject.classes}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{subject.teachers}</span>
                    </div>
                  </TableCell>
                  <TableCell>{subject.students}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Subject</DropdownMenuItem>
                        <DropdownMenuItem>Assign Teachers</DropdownMenuItem>
                        <DropdownMenuItem>View Curriculum</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Subject</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

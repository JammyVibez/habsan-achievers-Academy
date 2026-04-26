import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, Eye, Check, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data
const applications = [
  {
    id: 1,
    referenceNumber: "HAA/ADM/2024/001",
    studentName: "Chidinma Obi",
    class: "JSS 1",
    parentName: "Mr. Chukwuma Obi",
    parentPhone: "08012345678",
    parentEmail: "chukwuma.obi@email.com",
    dateApplied: "2024-03-01",
    status: "pending",
  },
  {
    id: 2,
    referenceNumber: "HAA/ADM/2024/002",
    studentName: "Aisha Mohammed",
    class: "Pre-Nursery",
    parentName: "Mrs. Halima Mohammed",
    parentPhone: "08098765432",
    parentEmail: "halima.mohammed@email.com",
    dateApplied: "2024-03-02",
    status: "approved",
  },
  {
    id: 3,
    referenceNumber: "HAA/ADM/2024/003",
    studentName: "Tunde Adebayo",
    class: "SS 1",
    parentName: "Mr. Adebayo Tunde",
    parentPhone: "08123456789",
    parentEmail: "adebayo.tunde@email.com",
    dateApplied: "2024-03-03",
    status: "rejected",
  },
]

export default function AdminAdmissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Admission Applications</h1>
          <p className="text-muted-foreground">Review and manage admission applications</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Applications
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>Review pending and processed applications</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search applications..." className="pl-8" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Reference No.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Parent/Guardian</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date Applied</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b">
                    <td className="px-4 py-3 text-sm font-medium">{app.referenceNumber}</td>
                    <td className="px-4 py-3 text-sm">{app.studentName}</td>
                    <td className="px-4 py-3 text-sm">{app.class}</td>
                    <td className="px-4 py-3 text-sm">{app.parentName}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        <div className="text-xs">{app.parentPhone}</div>
                        <div className="text-xs text-muted-foreground">{app.parentEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(app.dateApplied).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        variant={
                          app.status === "approved"
                            ? "default"
                            : app.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {app.status === "pending" && (
                            <>
                              <DropdownMenuItem className="text-green-600">
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock } from "lucide-react"

export default function StudentAttendancePage() {
  const attendanceStats = {
    totalDays: 120,
    present: 114,
    absent: 4,
    late: 2,
    percentage: 95,
  }

  const recentAttendance = [
    { date: "2024-12-10", status: "present", remarks: "" },
    { date: "2024-12-09", status: "present", remarks: "" },
    { date: "2024-12-06", status: "present", remarks: "" },
    { date: "2024-12-05", status: "late", remarks: "Arrived 15 minutes late" },
    { date: "2024-12-04", status: "present", remarks: "" },
    { date: "2024-12-03", status: "absent", remarks: "Medical appointment" },
    { date: "2024-12-02", status: "present", remarks: "" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "absent":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "late":
        return <Clock className="h-5 w-5 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">My Attendance</h2>
        <p className="text-muted-foreground">Track your attendance record</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-3xl text-green-600">{attendanceStats.percentage}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl">{attendanceStats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl text-destructive">{attendanceStats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Times Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl text-orange-600">{attendanceStats.late}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAttendance.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {record.remarks && <p className="text-sm text-muted-foreground">{record.remarks}</p>}
                  </div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    record.status === "present"
                      ? "text-green-600"
                      : record.status === "absent"
                        ? "text-destructive"
                        : "text-orange-600"
                  }`}
                >
                  {getStatusText(record.status)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

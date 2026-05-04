"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Calendar } from "lucide-react"

export default function TeacherAttendancePage() {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const students = [
    { id: "1", name: "John Doe", admissionNo: "HAA/2024/001", present: true },
    { id: "2", name: "Jane Smith", admissionNo: "HAA/2024/002", present: true },
    { id: "3", name: "Michael Johnson", admissionNo: "HAA/2024/003", present: false },
    { id: "4", name: "Sarah Williams", admissionNo: "HAA/2024/004", present: true },
  ]

  const [attendance, setAttendance] = useState(students)

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((student) => (student.id === studentId ? { ...student, present: !student.present } : student)),
    )
  }

  const handleSubmit = () => {
    console.log("[v0] Attendance submitted:", { selectedClass, selectedDate, attendance })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-3xl mb-2">Mark Attendance</h2>
        <p className="text-muted-foreground">Record student attendance for your classes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Register</CardTitle>
          <CardDescription>Mark students as present or absent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SS3A">SS 3A</SelectItem>
                  <SelectItem value="SS2A">SS 2A</SelectItem>
                  <SelectItem value="SS1B">SS 1B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold text-sm">S/N</th>
                  <th className="text-left p-3 font-semibold text-sm">Admission No</th>
                  <th className="text-left p-3 font-semibold text-sm">Student Name</th>
                  <th className="text-center p-3 font-semibold text-sm">Present</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((student, index) => (
                  <tr key={student.id} className="border-t border-border">
                    <td className="p-3 text-sm">{index + 1}</td>
                    <td className="p-3 text-sm font-mono">{student.admissionNo}</td>
                    <td className="p-3 text-sm font-medium">{student.name}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <Checkbox checked={student.present} onCheckedChange={() => toggleAttendance(student.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div>
              <p className="font-semibold">Summary</p>
              <p className="text-sm text-muted-foreground">
                Present: {attendance.filter((s) => s.present).length} | Absent:{" "}
                {attendance.filter((s) => !s.present).length}
              </p>
            </div>
            <Button onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              Save Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

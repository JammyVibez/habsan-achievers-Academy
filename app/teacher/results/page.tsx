"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResultUploadForm } from "@/components/teacher/result-upload-form"
import { Plus, FileText } from "lucide-react"

export default function TeacherResultsPage() {
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [stats, setStats] = useState({ students: 0, uploadedThisTerm: 0, pending: 0, subjects: 0 })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/teacher/dashboard", { credentials: "include" })
        const data = await res.json()
        if (!res.ok) return
        setStats({
          students: data.stats?.students ?? 0,
          uploadedThisTerm: data.stats?.uploadedThisTerm ?? 0,
          pending: data.stats?.pending ?? 0,
          subjects: data.stats?.subjects ?? 0,
        })
      } catch {
        // noop
      }
    }
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-3xl mb-2">Results Entry</h2>
          <p className="text-muted-foreground">Enter and manage student results</p>
        </div>
        <Button onClick={() => setShowEntryForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Enter Results
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl">{stats.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Results Entered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl text-green-600">{stats.uploadedThisTerm}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {showEntryForm ? (
        <ResultUploadForm />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>My Results</CardTitle>
            <CardDescription>View and manage results you've entered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SS3A">SS 3A</SelectItem>
                  <SelectItem value="SS2A">SS 2A</SelectItem>
                  <SelectItem value="SS1B">SS 1B</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {[
                { class: "SS 3A", subject: "Mathematics", students: 45, entered: 45, status: "Complete" },
                { class: "SS 2A", subject: "Mathematics", students: 48, entered: 40, status: "Pending" },
                { class: "SS 1B", subject: "Physics", students: 42, entered: 42, status: "Complete" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-semibold">
                      {item.class} - {item.subject}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.entered}/{item.students} students
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium ${item.status === "Complete" ? "text-green-600" : "text-orange-600"}`}
                    >
                      {item.status}
                    </span>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

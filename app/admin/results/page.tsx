"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResultUploadForm } from "@/components/teacher/result-upload-form"
import { Upload, Download } from "lucide-react"

export default function AdminResultsPage() {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [selectedSession, setSelectedSession] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([])
  const [sessions, setSessions] = useState<Array<{ id: string; sessionName: string; terms: Array<{ id: string; termName: string }> }>>([])
  const [rows, setRows] = useState<Array<any>>([])
  const [classes, setClasses] = useState<string[]>([])
  const [loadingRows, setLoadingRows] = useState(false)
  const [bulkMessage, setBulkMessage] = useState("")
  const [summary, setSummary] = useState({
    totalStudents: 0,
    uploaded: 0,
    pending: 0,
    averageScore: null as number | null,
    byClass: [] as Array<{ classLevel: string; totalStudents: number; uploaded: number; pending: number; average: number | null }>,
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/results/summary", { credentials: "include" })
        const data = await res.json()
        if (!res.ok) return
        setSummary({
          totalStudents: data.totalStudents ?? 0,
          uploaded: data.uploaded ?? 0,
          pending: data.pending ?? 0,
          averageScore: data.averageScore ?? null,
          byClass: Array.isArray(data.byClass) ? data.byClass : [],
        })
      } catch {
        // no-op
      }
    }
    void load()
  }, [])

  useEffect(() => {
    async function loadFiltersAndRows() {
      setLoadingRows(true)
      try {
        const params = new URLSearchParams()
        if (selectedSession) params.set("sessionId", selectedSession)
        if (selectedTerm) params.set("termId", selectedTerm)
        if (selectedTeacher && selectedTeacher !== "all") params.set("teacherId", selectedTeacher)
        const res = await fetch(`/api/admin/results/list?${params.toString()}`, { credentials: "include" })
        const data = await res.json()
        if (!res.ok) return
        const loadedSessions = Array.isArray(data.sessions) ? data.sessions : []
        setSessions(loadedSessions)
        setTeachers(Array.isArray(data.teachers) ? data.teachers : [])
        setRows(Array.isArray(data.rows) ? data.rows : [])
        if (!selectedSession && data.current?.sessionId) setSelectedSession(data.current.sessionId)
        if (!selectedTerm && data.current?.termId) setSelectedTerm(data.current.termId)
        const classSet = new Set<string>()
        ;(data.rows ?? []).forEach((r: any) => classSet.add(r.classLevel))
        setClasses(Array.from(classSet).sort())
      } finally {
        setLoadingRows(false)
      }
    }
    void loadFiltersAndRows()
  }, [selectedSession, selectedTerm, selectedTeacher])

  const termsForSession = sessions.find((s) => s.id === selectedSession)?.terms ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-3xl mb-2">Results Management</h2>
          <p className="text-muted-foreground">Manage student results and generate report cards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl">{summary.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Results Uploaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl text-green-600">{summary.uploaded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl text-orange-600">{summary.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading font-bold text-2xl">
              {summary.averageScore === null ? "—" : `${summary.averageScore}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">Upload results</TabsTrigger>
          <TabsTrigger value="by-class">By Class</TabsTrigger>
          <TabsTrigger value="by-subject">By Subject</TabsTrigger>
          <TabsTrigger value="report-cards">Report Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <ResultUploadForm />
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Results Overview</CardTitle>
              <CardDescription>Summary of results across all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.byClass.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold">{item.classLevel}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.uploaded}/{item.totalStudents} students
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{item.average === null ? "—" : `${item.average}%`}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.pending > 0 ? `${item.pending} pending` : "Complete"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-class">
          <Card>
            <CardHeader>
              <CardTitle>Results by Class</CardTitle>
              <CardDescription>View and manage results for specific classes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Teacher (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All teachers</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.sessionName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {termsForSession.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.termName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/60">
                      <th className="p-2 text-left">Student</th>
                      <th className="p-2 text-left">Adm No</th>
                      <th className="p-2 text-left">Class</th>
                      <th className="p-2 text-left">Subject</th>
                      <th className="p-2 text-left">Total</th>
                      <th className="p-2 text-left">Grade</th>
                      <th className="p-2 text-left">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rows.filter((r) => (selectedClass ? r.classLevel === selectedClass : true))).slice(0, 500).map((r) => (
                      <tr key={r.id} className="border-b">
                        <td className="p-2">{r.studentName}</td>
                        <td className="p-2 font-mono">{r.admissionNumber}</td>
                        <td className="p-2">{r.classLevel}</td>
                        <td className="p-2">{r.subject}</td>
                        <td className="p-2">{r.total}</td>
                        <td className="p-2">{r.grade ?? "—"}</td>
                        <td className="p-2">{r.teacherName}</td>
                      </tr>
                    ))}
                    {!loadingRows && rows.length === 0 && (
                      <tr>
                        <td className="p-3 text-muted-foreground" colSpan={7}>No uploaded results for this filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-subject">
          <Card>
            <CardHeader>
              <CardTitle>Results by Subject</CardTitle>
              <CardDescription>View performance across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { subject: "Mathematics", average: "75.5%", highest: "98%", lowest: "45%" },
                  { subject: "English Language", average: "78.2%", highest: "95%", lowest: "52%" },
                  { subject: "Physics", average: "71.8%", highest: "92%", lowest: "38%" },
                  { subject: "Chemistry", average: "73.5%", highest: "96%", lowest: "42%" },
                  { subject: "Biology", average: "76.8%", highest: "94%", lowest: "48%" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        Range: {item.lowest} - {item.highest}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{item.average}</p>
                      <p className="text-sm text-muted-foreground">Average</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report-cards">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report Cards</CardTitle>
              <CardDescription>Create and download student report cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.sessionName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {termsForSession.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.termName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={async () => {
                  setBulkMessage("")
                  if (!selectedClass || !selectedSession || !selectedTerm) {
                    setBulkMessage("Select class, session and term first.")
                    return
                  }
                  const res = await fetch("/api/admin/results/bulk-report-cards", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      classLevel: selectedClass,
                      sessionId: selectedSession,
                      termId: selectedTerm,
                    }),
                  })
                  const data = await res.json()
                  if (!res.ok) {
                    setBulkMessage(data.error ?? "Failed to generate report cards")
                    return
                  }
                  setBulkMessage(`Generated ${data.count} report cards. Includes students with partial or no subject scores.`)
                }}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate All
                </Button>
              </div>
              {bulkMessage && (
                <p className="text-sm text-muted-foreground">{bulkMessage}</p>
              )}

              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  Report cards will be generated as PDF files and can be downloaded individually or in bulk.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResultUploadForm } from "@/components/teacher/result-upload-form"
import { TeacherManageResults } from "@/components/teacher/teacher-manage-results"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText } from "lucide-react"

export default function TeacherResultsPage() {
  const searchParams = useSearchParams()
  const prefillStudent = searchParams.get("studentId")
    ? {
        studentId: searchParams.get("studentId") || "",
        admissionNumber: searchParams.get("admissionNumber") || "",
        studentName: searchParams.get("studentName") || "",
        classLevel: searchParams.get("classLevel") || "",
      }
    : null

  const [showEntryForm, setShowEntryForm] = useState(false)
  const [uploadRefreshKey, setUploadRefreshKey] = useState(0)
  const [selectedClass, setSelectedClass] = useState(searchParams.get("classLevel") || "")
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "")
  const [stats, setStats] = useState({ students: 0, uploadedThisTerm: 0, pending: 0, subjects: 0 })
  const [recentUploads, setRecentUploads] = useState<Array<{ subject: string; classLevel: string; updatedAt: string }>>([])

  useEffect(() => {
    if (prefillStudent) setShowEntryForm(true)
  }, [prefillStudent])

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
        setRecentUploads(
          Array.isArray(data.recentUploads)
            ? data.recentUploads.map((r: any) => ({
                subject: r.subject ?? "—",
                classLevel: r.classLevel ?? "—",
                updatedAt: r.updatedAt ?? "",
              }))
            : [],
        )
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
          <p className="text-muted-foreground">Enter scores for a whole class at once, then upload</p>
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
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">Enter scores</TabsTrigger>
            <TabsTrigger value="manage">Manage uploaded</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <ResultUploadForm
              initialClass={selectedClass}
              initialSubject={selectedSubject}
              prefillStudent={prefillStudent}
              onUploaded={() => setUploadRefreshKey((k) => k + 1)}
            />
          </TabsContent>
          <TabsContent value="manage">
            <TeacherManageResults key={uploadRefreshKey} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent uploads</CardTitle>
            <CardDescription>Live uploads for the current teacher account</CardDescription>
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
              {recentUploads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No uploads yet for this teacher.</p>
              ) : (
                recentUploads.slice(0, 12).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold">
                        {item.classLevel} - {item.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Updated {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <FileText className="mr-2 h-4 w-4" />
                      Synced
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

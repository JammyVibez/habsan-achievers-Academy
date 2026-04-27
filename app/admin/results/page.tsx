"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResultUploadForm } from "@/components/teacher/result-upload-form"
import { Upload, Download, Search } from "lucide-react"

export default function AdminResultsPage() {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
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
                    <SelectItem value="SS3A">SS 3A</SelectItem>
                    <SelectItem value="SS3B">SS 3B</SelectItem>
                    <SelectItem value="SS2A">SS 2A</SelectItem>
                    <SelectItem value="SS2B">SS 2B</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Term</SelectItem>
                    <SelectItem value="second">Second Term</SelectItem>
                    <SelectItem value="third">Third Term</SelectItem>
                  </SelectContent>
                </Select>

                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">Select a class and term to view results</p>
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
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SS3A">SS 3A</SelectItem>
                    <SelectItem value="SS3B">SS 3B</SelectItem>
                    <SelectItem value="SS2A">SS 2A</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Term</SelectItem>
                    <SelectItem value="second">Second Term</SelectItem>
                    <SelectItem value="third">Third Term</SelectItem>
                  </SelectContent>
                </Select>

                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Generate All
                </Button>
              </div>

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

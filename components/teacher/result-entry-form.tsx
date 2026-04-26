"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Save, Loader2 } from "lucide-react"

interface ResultEntryFormProps {
  onClose: () => void
}

export function ResultEntryForm({ onClose }: ResultEntryFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [students, setStudents] = useState([
    { id: "1", name: "John Doe", admissionNo: "HAA/2024/001", ca1: "", ca2: "", exam: "" },
    { id: "2", name: "Jane Smith", admissionNo: "HAA/2024/002", ca1: "", ca2: "", exam: "" },
    { id: "3", name: "Michael Johnson", admissionNo: "HAA/2024/003", ca1: "", ca2: "", exam: "" },
  ])

  const updateScore = (studentId: string, field: "ca1" | "ca2" | "exam", value: string) => {
    setStudents((prev) => prev.map((student) => (student.id === studentId ? { ...student, [field]: value } : student)))
  }

  const calculateTotal = (ca1: string, ca2: string, exam: string) => {
    const total = (Number(ca1) || 0) + (Number(ca2) || 0) + (Number(exam) || 0)
    return total.toFixed(2)
  }

  const getGrade = (total: number) => {
    if (total >= 80) return "A"
    if (total >= 70) return "B"
    if (total >= 60) return "C"
    if (total >= 50) return "D"
    if (total >= 40) return "E"
    return "F"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Submit to database
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("[v0] Results submitted:", { selectedClass, selectedSubject, selectedTerm, students })
      onClose()
    } catch (error) {
      console.error("[v0] Error submitting results:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Enter Results</CardTitle>
            <CardDescription>Enter CA and exam scores for students</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass} required>
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

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Term</SelectItem>
                  <SelectItem value="second">Second Term</SelectItem>
                  <SelectItem value="third">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Alert>
            <AlertDescription>CA1 and CA2 are out of 20 each. Exam is out of 60. Total is out of 100.</AlertDescription>
          </Alert>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold text-sm">S/N</th>
                    <th className="text-left p-3 font-semibold text-sm">Admission No</th>
                    <th className="text-left p-3 font-semibold text-sm">Student Name</th>
                    <th className="text-center p-3 font-semibold text-sm">CA1 (20)</th>
                    <th className="text-center p-3 font-semibold text-sm">CA2 (20)</th>
                    <th className="text-center p-3 font-semibold text-sm">Exam (60)</th>
                    <th className="text-center p-3 font-semibold text-sm">Total (100)</th>
                    <th className="text-center p-3 font-semibold text-sm">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const total = Number(calculateTotal(student.ca1, student.ca2, student.exam))
                    const grade = getGrade(total)
                    return (
                      <tr key={student.id} className="border-t border-border">
                        <td className="p-3 text-sm">{index + 1}</td>
                        <td className="p-3 text-sm font-mono">{student.admissionNo}</td>
                        <td className="p-3 text-sm font-medium">{student.name}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={student.ca1}
                            onChange={(e) => updateScore(student.id, "ca1", e.target.value)}
                            className="w-20 text-center"
                            required
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={student.ca2}
                            onChange={(e) => updateScore(student.id, "ca2", e.target.value)}
                            className="w-20 text-center"
                            required
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="0"
                            max="60"
                            value={student.exam}
                            onChange={(e) => updateScore(student.id, "exam", e.target.value)}
                            className="w-20 text-center"
                            required
                          />
                        </td>
                        <td className="p-3 text-center font-semibold text-primary">{total > 0 ? total : "-"}</td>
                        <td className="p-3 text-center font-semibold">{total > 0 ? grade : "-"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Results
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

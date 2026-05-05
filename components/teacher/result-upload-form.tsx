'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Plus, Trash2, Upload, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { scoreToGrade } from '@/lib/grades';

interface StudentResult {
  studentId: string;
  admissionNumber: string;
  studentName: string;
  ca1: string;
  ca2: string;
  exam: string;
}

type PrefillStudent = {
  studentId: string;
  admissionNumber: string;
  studentName: string;
  classLevel: string;
};

type ResultUploadFormProps = {
  initialSubject?: string;
  initialClass?: string;
  prefillStudent?: PrefillStudent | null;
};

export function ResultUploadForm({ initialSubject = '', initialClass = '', prefillStudent = null }: ResultUploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [metaLoading, setMetaLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classLevels, setClassLevels] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Array<{ subject: string; classLevel: string }>>([]);
  const [classStudents, setClassStudents] = useState<Array<{ id: string; admissionNumber: string; name: string }>>([]);

  const [formData, setFormData] = useState({
    subject: initialSubject,
    classAssigned: initialClass,
    results: [] as StudentResult[],
  });

  const [tempResult, setTempResult] = useState<StudentResult>({
    studentId: prefillStudent?.studentId ?? '',
    admissionNumber: prefillStudent?.admissionNumber ?? '',
    studentName: prefillStudent?.studentName ?? '',
    ca1: '',
    ca2: '',
    exam: '',
  });

  useEffect(() => {
    async function loadMeta() {
      setMetaLoading(true);
      try {
        const res = await fetch('/api/results/upload-meta', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) return;
        setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
        setClassLevels(Array.isArray(data.classes) ? data.classes : []);
        setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
      } finally {
        setMetaLoading(false);
      }
    }
    void loadMeta();
  }, []);

  useEffect(() => {
    if (!prefillStudent) return;
    setFormData((prev) => ({
      ...prev,
      classAssigned: prev.classAssigned || prefillStudent.classLevel,
    }));
    setTempResult((prev) => ({
      ...prev,
      studentId: prefillStudent.studentId,
      admissionNumber: prefillStudent.admissionNumber,
      studentName: prefillStudent.studentName,
    }));
  }, [prefillStudent]);

  useEffect(() => {
    const isTeacherScoped = assignments.length > 0;
    if (!isTeacherScoped || !formData.subject) return;
    const allowedClasses = [...new Set(assignments.filter((a) => a.subject === formData.subject).map((a) => a.classLevel))];
    if (allowedClasses.length === 0) return;
    if (!allowedClasses.includes(formData.classAssigned)) {
      setFormData((prev) => ({ ...prev, classAssigned: allowedClasses[0] ?? '' }));
    }
  }, [assignments, formData.subject, formData.classAssigned]);

  useEffect(() => {
    async function loadStudents() {
      if (!formData.classAssigned) {
        setClassStudents([]);
        return;
      }
      try {
        const res = await fetch(`/api/teacher/class-students?classLevel=${encodeURIComponent(formData.classAssigned)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
          setClassStudents([]);
          return;
        }
        setClassStudents(Array.isArray(data.students) ? data.students : []);
      } catch {
        setClassStudents([]);
      }
    }
    void loadStudents();
  }, [formData.classAssigned]);

  useEffect(() => {
    const admission = tempResult.admissionNumber.trim();
    if (!admission) return;
    const match = classStudents.find((s) => s.admissionNumber === admission);
    if (match && tempResult.studentName !== match.name) {
      setTempResult((prev) => ({ ...prev, studentName: match.name }));
    }
  }, [tempResult.admissionNumber, tempResult.studentName, classStudents]);

  function addResult() {
    // Validate temp result
    if (!tempResult.admissionNumber.trim()) {
      setError('Admission number is required');
      return;
    }
    if (!tempResult.studentName.trim()) {
      setError('Student name is required');
      return;
    }
    if (tempResult.ca1 === '' || Number.isNaN(parseFloat(tempResult.ca1))) {
      setError('Valid CA1 score is required');
      return;
    }
    if (tempResult.ca2 === '' || Number.isNaN(parseFloat(tempResult.ca2))) {
      setError('Valid CA2 score is required');
      return;
    }
    if (tempResult.exam === '' || Number.isNaN(parseFloat(tempResult.exam))) {
      setError('Valid exam score is required');
      return;
    }

    const ca1 = parseFloat(tempResult.ca1);
    const ca2 = parseFloat(tempResult.ca2);
    const exam = parseFloat(tempResult.exam);
    if (ca1 < 0 || ca1 > 20) {
      setError('CA1 must be between 0 and 20');
      return;
    }
    if (ca2 < 0 || ca2 > 20) {
      setError('CA2 must be between 0 and 20');
      return;
    }
    if (exam < 0 || exam > 60) {
      setError('Exam must be between 0 and 60');
      return;
    }

    // Check for duplicate admission number
    if (formData.results.some((r) => r.admissionNumber === tempResult.admissionNumber)) {
      setError('This student is already in the list');
      return;
    }

    setError(null);
    setFormData((prev) => ({
      ...prev,
      results: [
        ...prev.results,
        {
          ...tempResult,
          studentId: `student_${tempResult.admissionNumber}`,
        },
      ],
    }));

    // Reset temp result
    setTempResult({
      studentId: prefillStudent?.studentId ?? '',
      admissionNumber: prefillStudent?.admissionNumber ?? '',
      studentName: prefillStudent?.studentName ?? '',
      ca1: '',
      ca2: '',
      exam: '',
    });
  }

  function removeResult(admissionNumber: string) {
    setFormData((prev) => ({
      ...prev,
      results: prev.results.filter((r) => r.admissionNumber !== admissionNumber),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!formData.subject) throw new Error('Subject is required');
      if (!formData.classAssigned) throw new Error('Class is required');

      let resultsToSubmit = formData.results;
      // In prefilled single-student flow, allow direct submit from CA fields
      // without requiring an extra "Add" click.
      if (resultsToSubmit.length === 0 && prefillStudent) {
        if (tempResult.ca1 === '' || Number.isNaN(parseFloat(tempResult.ca1))) {
          throw new Error('Valid CA1 score is required');
        }
        if (tempResult.ca2 === '' || Number.isNaN(parseFloat(tempResult.ca2))) {
          throw new Error('Valid CA2 score is required');
        }
        if (tempResult.exam === '' || Number.isNaN(parseFloat(tempResult.exam))) {
          throw new Error('Valid exam score is required');
        }
        const ca1 = parseFloat(tempResult.ca1);
        const ca2 = parseFloat(tempResult.ca2);
        const exam = parseFloat(tempResult.exam);
        if (ca1 < 0 || ca1 > 20) throw new Error('CA1 must be between 0 and 20');
        if (ca2 < 0 || ca2 > 20) throw new Error('CA2 must be between 0 and 20');
        if (exam < 0 || exam > 60) throw new Error('Exam must be between 0 and 60');

        resultsToSubmit = [
          {
            ...tempResult,
            studentId: tempResult.studentId || `student_${tempResult.admissionNumber}`,
          },
        ];
      }

      if (resultsToSubmit.length === 0) throw new Error('At least one student result is required');

      const response = await fetch('/api/results/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: formData.subject,
          classAssigned: formData.classAssigned,
          results: resultsToSubmit,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload results');
      }

      setSuccess(true);
      setSuccessMessage(data.message);

      // Reset form
      setFormData({
        subject: '',
        classAssigned: '',
        results: [],
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Student Results</CardTitle>
        <CardDescription>
          Upload marks for all students in your assigned class and subject
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Subject and Class Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                <SelectTrigger id="subject" disabled={loading}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classAssigned">Class *</Label>
              <Select value={formData.classAssigned} onValueChange={(value) => setFormData({ ...formData, classAssigned: value })}>
                <SelectTrigger id="classAssigned" disabled={loading}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {(assignments.length > 0 && formData.subject
                    ? [...new Set(assignments.filter((a) => a.subject === formData.subject).map((a) => a.classLevel))]
                    : classLevels
                  ).map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {metaLoading && <p className="text-xs text-muted-foreground">Loading subject/class options…</p>}

          {/* Add Student Result Section */}
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="font-semibold">Add Student Results</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admissionNumber">Admission Number</Label>
                <Input
                  id="admissionNumber"
                  list="class-students-admission-list"
                  placeholder="HAA/2024/001"
                  value={tempResult.admissionNumber}
                  onChange={(e) => setTempResult({ ...tempResult, admissionNumber: e.target.value })}
                  disabled={loading || Boolean(prefillStudent)}
                  className="font-mono"
                />
                <datalist id="class-students-admission-list">
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.admissionNumber}>
                      {s.name}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="John Doe"
                  value={tempResult.studentName}
                  onChange={(e) => setTempResult({ ...tempResult, studentName: e.target.value })}
                  disabled={loading || Boolean(prefillStudent)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ca1">CA1 (0-20)</Label>
                <Input
                  id="ca1"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  placeholder="15.0"
                  value={tempResult.ca1}
                  onChange={(e) => setTempResult({ ...tempResult, ca1: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ca2">CA2 (0-20)</Label>
                <Input
                  id="ca2"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  placeholder="14.0"
                  value={tempResult.ca2}
                  onChange={(e) => setTempResult({ ...tempResult, ca2: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam">Exam (0-60)</Label>
                <Input
                  id="exam"
                  type="number"
                  min="0"
                  max="60"
                  step="0.5"
                  placeholder="45.0"
                  value={tempResult.exam}
                  onChange={(e) => setTempResult({ ...tempResult, exam: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                Total:{" "}
                <span className="font-semibold text-foreground">
                  {(Number(tempResult.ca1 || 0) + Number(tempResult.ca2 || 0) + Number(tempResult.exam || 0)).toFixed(1)}
                </span>{" "}
                / 100
              </div>
              <div>
                <Button
                  type="button"
                  onClick={addResult}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Results List */}
          {formData.results.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-4">
                <h4 className="font-semibold">
                  Added Results ({formData.results.length})
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Admission Number</th>
                      <th className="text-left p-3">Student Name</th>
                      <th className="text-center p-3">CA1</th>
                      <th className="text-center p-3">CA2</th>
                      <th className="text-center p-3">Exam</th>
                      <th className="text-center p-3">Total</th>
                      <th className="text-center p-3">Grade</th>
                      <th className="text-center p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.results.map((result) => {
                      const ca1 = parseFloat(result.ca1);
                      const ca2 = parseFloat(result.ca2);
                      const exam = parseFloat(result.exam);
                      const total = ca1 + ca2 + exam;
                      const grade = scoreToGrade(total);

                      return (
                        <tr key={result.admissionNumber} className="border-b">
                          <td className="p-3 font-mono text-blue-600">{result.admissionNumber}</td>
                          <td className="p-3">{result.studentName}</td>
                          <td className="text-center p-3 font-semibold">{result.ca1}</td>
                          <td className="text-center p-3 font-semibold">{result.ca2}</td>
                          <td className="text-center p-3 font-semibold">{result.exam}</td>
                          <td className="text-center p-3 font-semibold text-primary">{total.toFixed(1)}</td>
                          <td className="text-center p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              grade === 'A' ? 'bg-green-100 text-green-800' :
                              grade === 'B' ? 'bg-blue-100 text-blue-800' :
                              grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              grade === 'D' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {grade}
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <button
                              type="button"
                              onClick={() => removeResult(result.admissionNumber)}
                              className="text-red-600 hover:text-red-800"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({ subject: '', classAssigned: '', results: [] });
                setTempResult({ studentId: '', admissionNumber: '', studentName: '', ca1: '', ca2: '', exam: '' });
              }}
              disabled={loading}
            >
              Clear All
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.results.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Results
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

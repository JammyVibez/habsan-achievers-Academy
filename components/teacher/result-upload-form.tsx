'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Plus, Trash2, Upload, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AVAILABLE_SUBJECTS, CLASS_LEVELS } from '@/lib/teacher-utils';

interface StudentResult {
  studentId: string;
  admissionNumber: string;
  studentName: string;
  score: string;
}

export function ResultUploadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    subject: '',
    classAssigned: '',
    results: [] as StudentResult[],
  });

  const [tempResult, setTempResult] = useState<StudentResult>({
    studentId: '',
    admissionNumber: '',
    studentName: '',
    score: '',
  });

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
    if (!tempResult.score || isNaN(parseFloat(tempResult.score))) {
      setError('Valid score is required');
      return;
    }

    const score = parseFloat(tempResult.score);
    if (score < 0 || score > 100) {
      setError('Score must be between 0 and 100');
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
      studentId: '',
      admissionNumber: '',
      studentName: '',
      score: '',
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
      if (formData.results.length === 0) throw new Error('At least one student result is required');

      const response = await fetch('/api/results/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: formData.subject,
          classAssigned: formData.classAssigned,
          results: formData.results,
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
                  {AVAILABLE_SUBJECTS.map((subject) => (
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
                  {CLASS_LEVELS.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Student Result Section */}
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="font-semibold">Add Student Results</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admissionNumber">Admission Number</Label>
                <Input
                  id="admissionNumber"
                  placeholder="HAA/2024/001"
                  value={tempResult.admissionNumber}
                  onChange={(e) => setTempResult({ ...tempResult, admissionNumber: e.target.value })}
                  disabled={loading}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="John Doe"
                  value={tempResult.studentName}
                  onChange={(e) => setTempResult({ ...tempResult, studentName: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="score">Score (0-100)</Label>
              <div className="flex gap-2">
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="85.5"
                  value={tempResult.score}
                  onChange={(e) => setTempResult({ ...tempResult, score: e.target.value })}
                  disabled={loading}
                  className="flex-1"
                />
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
                      <th className="text-center p-3">Score</th>
                      <th className="text-center p-3">Grade</th>
                      <th className="text-center p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.results.map((result) => {
                      const score = parseFloat(result.score);
                      let grade = 'F';
                      if (score >= 80) grade = 'A';
                      else if (score >= 70) grade = 'B';
                      else if (score >= 60) grade = 'C';
                      else if (score >= 50) grade = 'D';

                      return (
                        <tr key={result.admissionNumber} className="border-b">
                          <td className="p-3 font-mono text-blue-600">{result.admissionNumber}</td>
                          <td className="p-3">{result.studentName}</td>
                          <td className="text-center p-3 font-semibold">{result.score}</td>
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
                setTempResult({ studentId: '', admissionNumber: '', studentName: '', score: '' });
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

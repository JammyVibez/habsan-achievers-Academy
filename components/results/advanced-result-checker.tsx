'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Download, Loader, Eye, EyeOff, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ResultData {
  studentName: string;
  admissionNumber: string;
  className: string;
  academicSession: string;
  term: string;
  results: Array<{
    subject: string;
    ca1: number;
    ca2: number;
    exam: number;
    total: number;
    score: number;
    grade: string;
    comment: string;
  }>;
  gpa: number;
  overallGrade: string;
  position: string;
  attendance: {
    daysPresent: number;
    daysAbsent: number;
    daysLate: number;
  };
  conduct: string;
  comments: string;
}

export function AdvancedResultChecker() {
  const [step, setStep] = useState<'input' | 'results' | 'download'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  const [formData, setFormData] = useState({
    pin: '',
    admissionNumber: '',
  });

  const [results, setResults] = useState<ResultData | null>(null);
  const [sessionTermOptions, setSessionTermOptions] = useState<
    Array<{ id: string; sessionName: string; terms: Array<{ id: string; termName: string }> }>
  >([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch('/api/results/check');
        const data = await response.json();
        if (!response.ok) return;
        setSessionTermOptions(data.sessions ?? []);
        if (data.current?.sessionId) setSelectedSessionId(data.current.sessionId);
        if (data.current?.termId) setSelectedTermId(data.current.termId);
      } catch {
        // no-op: user can still attempt with current session/term fallback server-side
      }
    })();
  }, []);

  async function handleCheckResults(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.pin.trim()) throw new Error('PIN is required');
      if (!formData.admissionNumber.trim()) throw new Error('Admission number is required');

      const response = await fetch('/api/results/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: formData.pin,
          admissionNumber: formData.admissionNumber,
          sessionId: selectedSessionId || undefined,
          termId: selectedTermId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const base = data.error || 'Failed to retrieve results';
        const extra =
          typeof data.pinShopUrl === 'string' && data.pinShopUrl
            ? ` You can get a PIN at ${data.pinShopUrl}.`
            : '';
        throw new Error(`${base}${extra}`);
      }

      setResults(data.results);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/results/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: formData.pin,
          admissionNumber: formData.admissionNumber,
          sessionId: selectedSessionId || undefined,
          termId: selectedTermId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate PDF');
      }

      // TODO: Install and use html2pdf or jsPDF library for client-side PDF generation
      // For now, show success message
      alert('PDF Report Card generated successfully!\n\nIn production, this will download automatically.');
      
      // Example with html2pdf (after installing):
      // const htmlString = data.html;
      // const opt = {
      //   margin: 10,
      //   filename: data.fileName,
      //   image: { type: 'jpeg', quality: 0.98 },
      //   html2canvas: { scale: 2 },
      //   jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      // };
      // html2pdf().set(opt).from(htmlString).save();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setLoading(false);
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input Step */}
      {step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle>Check Your Results</CardTitle>
            <CardDescription>Enter your admission number and result checking PIN to view your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                You need a Result Checking PIN to access your results. PIN shop is disabled; get one from school admin if you don&apos;t have one.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-900">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCheckResults} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admission">Admission Number *</Label>
                <p className="text-xs text-muted-foreground">Format: HAA/YYYY/### (e.g., HAA/2024/001)</p>
                <Input
                  id="admission"
                  value={formData.admissionNumber}
                  onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value.toUpperCase() })}
                  placeholder="HAA/2024/001"
                  disabled={loading}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Academic session</Label>
                <Select
                  value={selectedSessionId}
                  onValueChange={(value) => {
                    setSelectedSessionId(value);
                    const firstTerm = sessionTermOptions.find((s) => s.id === value)?.terms[0];
                    setSelectedTermId(firstTerm?.id ?? '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTermOptions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.sessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {(sessionTermOptions.find((s) => s.id === selectedSessionId)?.terms ?? []).map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.termName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">Result Checking PIN *</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.toUpperCase() })}
                    placeholder="RES1-2345-6789"
                    disabled={loading}
                    className="font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Format: XXXX-XXXX-XXXX</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-3">Don&apos;t have a PIN?</p>
                <Link href="/pin-shop">
                  <Button type="button" variant="outline" className="w-full">
                    Where to get Result PIN
                  </Button>
                </Link>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !formData.admissionNumber || !formData.pin} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Results'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Results Display Step */}
      {step === 'results' && results && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Report Card</CardTitle>
            <CardDescription>{results.academicSession} - {results.term}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="font-semibold">{results.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admission Number</p>
                <p className="font-semibold font-mono">{results.admissionNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-semibold">{results.className}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-semibold">{results.position}</p>
              </div>
            </div>

            {/* Results Table */}
            <div>
              <h3 className="font-semibold mb-3">Subject Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2">Subject</th>
                      <th className="text-center p-2">CA1</th>
                      <th className="text-center p-2">CA2</th>
                      <th className="text-center p-2">Exam</th>
                      <th className="text-center p-2">Total</th>
                      <th className="text-center p-2">Grade</th>
                      <th className="text-left p-2">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((result, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{result.subject}</td>
                        <td className="text-center p-2 font-semibold">{result.ca1}</td>
                        <td className="text-center p-2 font-semibold">{result.ca2}</td>
                        <td className="text-center p-2 font-semibold">{result.exam}</td>
                        <td className="text-center p-2 font-semibold">{result.total}</td>
                        <td className="text-center p-2">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${getGradeColor(result.grade)}`}>
                            {result.grade}
                          </span>
                        </td>
                        <td className="p-2 text-muted-foreground">{result.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">GPA</p>
                <p className="text-3xl font-bold text-green-600">{results.gpa.toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Overall Grade</p>
                <p className={`text-3xl font-bold ${getGradeColor(results.overallGrade).split(' ')[1]}`}>
                  {results.overallGrade}
                </p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Conduct</p>
                <p className="text-2xl font-bold text-blue-600">{results.conduct}</p>
              </div>
            </div>

            {/* Attendance */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Attendance</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Days Present</p>
                  <p className="font-semibold text-green-600">{results.attendance.daysPresent}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days Absent</p>
                  <p className="font-semibold text-red-600">{results.attendance.daysAbsent}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days Late</p>
                  <p className="font-semibold text-orange-600">{results.attendance.daysLate}</p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">Class Teacher&apos;s Comment</p>
              <p className="text-blue-800">{results.comments}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setStep('input');
                setResults(null);
              }} className="flex-1">
                Check Another Result
              </Button>
              <Button onClick={handleDownloadPDF} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Report Card
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

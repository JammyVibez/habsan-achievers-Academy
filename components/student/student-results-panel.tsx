'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download, Eye, EyeOff, Info, Loader } from 'lucide-react';

type ResultPayload = {
  studentName: string;
  admissionNumber: string;
  className: string;
  academicSession: string;
  term: string;
  results: Array<{ subject: string; score: number; grade: string; comment: string }>;
  gpa: number;
  overallGrade: string;
  position: string;
  attendance: { daysPresent: number; daysAbsent: number; daysLate: number };
  conduct: string;
  comments: string;
};

function gradeColor(grade: string) {
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
}

export function StudentResultsPanel() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [classLevel, setClassLevel] = useState('');

  const [step, setStep] = useState<'pin' | 'results'>('pin');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultPayload | null>(null);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const res = await fetch('/api/student/profile', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Could not load your profile.');
        return;
      }
      setAdmissionNumber(data.admissionNumber ?? '');
      setClassLevel(data.classLevel ?? '');
    } catch {
      setProfileError('Could not load your profile.');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/student/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load results');
        return;
      }
      setResults(data.results as ResultPayload);
      setStep('results');
    } catch {
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    if (!admissionNumber || !pin.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/results/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim(), admissionNumber }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to generate PDF');
        return;
      }
      alert(
        'Report card HTML is ready.\n\nIn production you can plug html2pdf or a print stylesheet to download automatically.',
      );
      if (typeof data.html === 'string' && data.html.length > 0) {
        const w = window.open('', '_blank');
        if (w) {
          w.document.write(data.html);
          w.document.close();
        }
      }
    } catch {
      setError('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  }

  if (loadingProfile) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (profileError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{profileError}</AlertDescription>
      </Alert>
    );
  }

  if (step === 'pin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>View my results</CardTitle>
          <CardDescription>
            Enter your <strong>result checking PIN</strong> (from the PIN shop or issued by the school). Your admission
            number ({admissionNumber}) is used automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Without a valid Result PIN you cannot view results here or on the public checker — same PIN works for
              both.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <p>
              <span className="text-muted-foreground">Admission:</span>{' '}
              <span className="font-mono font-medium">{admissionNumber}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Class:</span> <span className="font-medium">{classLevel}</span>
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="result-pin">Result PIN</Label>
              <div className="relative">
                <Input
                  id="result-pin"
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  placeholder="RES1-ABCD-EFGH"
                  disabled={loading}
                  className="font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading || !pin.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                'Show my results'
              )}
            </Button>

            <Button asChild type="button" variant="outline" className="w-full">
              <Link href="/pin-shop">Buy Result PIN</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (!results) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic report</CardTitle>
        <CardDescription>
          {results.academicSession} — {results.term}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-semibold">{results.studentName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Admission</p>
            <p className="font-mono font-semibold">{results.admissionNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Class</p>
            <p className="font-semibold">{results.className}</p>
          </div>
          <div>
            <p className="text-muted-foreground">GPA</p>
            <p className="font-semibold">{results.gpa.toFixed(2)}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/60">
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-center">Score</th>
                <th className="p-2 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.results.map((r, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="p-2">{r.subject}</td>
                  <td className="p-2 text-center font-medium">{r.score}</td>
                  <td className="p-2 text-center">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${gradeColor(r.grade)}`}>
                      {r.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setStep('pin');
              setResults(null);
            }}
          >
            Use another PIN
          </Button>
          <Button onClick={handleDownloadPDF} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? 'Working…' : 'Open report card'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Upload, Loader, Users, ClipboardList } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { scoreToGrade } from '@/lib/grades';
import { SessionTermPicker } from '@/components/academic/session-term-picker';
import type { AcademicSessionOption } from '@/lib/academic-calendar-types';
import { submitOrQueue } from '@/lib/offline-submit';
import { OfflineQueueAlert } from '@/components/offline/offline-queue-alert';
import { useNetworkStatus } from '@/components/offline/network-status-provider';
import {
  classLevelsForPickerValue,
  toClassPickerOptions,
  toClassPickerValue,
} from '@/lib/class-groups';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type StudentScoreRow = {
  studentId: string;
  admissionNumber: string;
  studentName: string;
  classLevel: string;
  ca1: string;
  ca2: string;
  exam: string;
};

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
  onUploaded?: () => void;
};

function gradeBadgeClass(grade: string) {
  switch (grade) {
    case 'A':
      return 'bg-green-100 text-green-800';
    case 'B':
      return 'bg-blue-100 text-blue-800';
    case 'C':
      return 'bg-yellow-100 text-yellow-800';
    case 'D':
      return 'bg-orange-100 text-orange-800';
    case 'E':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-red-100 text-red-800';
  }
}

function rowTotal(row: Pick<StudentScoreRow, 'ca1' | 'ca2' | 'exam'>) {
  return Number(row.ca1 || 0) + Number(row.ca2 || 0) + Number(row.exam || 0);
}

function rowHasScores(row: StudentScoreRow) {
  return row.ca1 !== '' || row.ca2 !== '' || row.exam !== '';
}

function rowIsComplete(row: StudentScoreRow) {
  return row.ca1 !== '' && row.ca2 !== '' && row.exam !== '';
}

function validateScoreRow(row: StudentScoreRow): string | null {
  if (!rowIsComplete(row)) return null;

  const ca1 = parseFloat(row.ca1);
  const ca2 = parseFloat(row.ca2);
  const exam = parseFloat(row.exam);

  if (Number.isNaN(ca1) || Number.isNaN(ca2) || Number.isNaN(exam)) {
    return `Invalid scores for ${row.studentName}`;
  }
  if (ca1 < 0 || ca1 > 20) return `CA1 for ${row.studentName} must be between 0 and 20`;
  if (ca2 < 0 || ca2 > 20) return `CA2 for ${row.studentName} must be between 0 and 20`;
  if (exam < 0 || exam > 60) return `Exam for ${row.studentName} must be between 0 and 60`;

  return null;
}

type ScoreFieldsProps = {
  row: StudentScoreRow;
  loading: boolean;
  onUpdate: (field: 'ca1' | 'ca2' | 'exam', value: string) => void;
  layout?: 'inline' | 'grid';
};

function ScoreFields({ row, loading, onUpdate, layout = 'grid' }: ScoreFieldsProps) {
  const inputClass = layout === 'inline' ? 'h-9 text-center' : 'h-9 w-full text-center';

  return (
    <div className={cn(layout === 'grid' ? 'grid grid-cols-3 gap-2' : 'flex gap-2')}>
      <div className="space-y-1">
        {layout === 'grid' ? <Label className="text-xs text-muted-foreground">CA1</Label> : null}
        <Input
          type="number"
          min="0"
          max="20"
          step="0.5"
          placeholder="—"
          aria-label={`CA1 for ${row.studentName}`}
          value={row.ca1}
          onChange={(e) => onUpdate('ca1', e.target.value)}
          disabled={loading}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        {layout === 'grid' ? <Label className="text-xs text-muted-foreground">CA2</Label> : null}
        <Input
          type="number"
          min="0"
          max="20"
          step="0.5"
          placeholder="—"
          aria-label={`CA2 for ${row.studentName}`}
          value={row.ca2}
          onChange={(e) => onUpdate('ca2', e.target.value)}
          disabled={loading}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        {layout === 'grid' ? <Label className="text-xs text-muted-foreground">Exam</Label> : null}
        <Input
          type="number"
          min="0"
          max="60"
          step="0.5"
          placeholder="—"
          aria-label={`Exam for ${row.studentName}`}
          value={row.exam}
          onChange={(e) => onUpdate('exam', e.target.value)}
          disabled={loading}
          className={inputClass}
        />
      </div>
    </div>
  );
}

type StudentRowProps = {
  row: StudentScoreRow;
  index: number;
  loading: boolean;
  isPrefillTarget: boolean;
  showStream: boolean;
  onUpdate: (admissionNumber: string, field: 'ca1' | 'ca2' | 'exam', value: string) => void;
  rowRef?: React.RefObject<HTMLDivElement | HTMLTableRowElement | null>;
};

function StudentTableRow({ row, index, loading, isPrefillTarget, showStream, onUpdate, rowRef }: StudentRowProps) {
  const total = rowTotal(row);
  const hasAnyScore = rowHasScores(row);
  const complete = rowIsComplete(row);
  const grade = hasAnyScore && complete ? scoreToGrade(total) : null;

  return (
    <tr
      ref={rowRef as React.RefObject<HTMLTableRowElement>}
      className={cn(
        'border-b transition-colors',
        isPrefillTarget && 'bg-primary/5 ring-1 ring-inset ring-primary/20',
        complete && 'bg-green-50/40',
      )}
    >
      <td className="p-3 text-muted-foreground">{index + 1}</td>
      <td className="p-3 font-mono text-xs text-blue-700">{row.admissionNumber}</td>
      <td className="p-3">
        <span className="font-medium">{row.studentName}</span>
        {showStream ? (
          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{row.classLevel}</span>
        ) : null}
      </td>
      <td className="p-2">
        <Input
          type="number"
          min="0"
          max="20"
          step="0.5"
          placeholder="—"
          value={row.ca1}
          onChange={(e) => onUpdate(row.admissionNumber, 'ca1', e.target.value)}
          disabled={loading}
          className="h-9 w-full min-w-[72px] text-center"
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          min="0"
          max="20"
          step="0.5"
          placeholder="—"
          value={row.ca2}
          onChange={(e) => onUpdate(row.admissionNumber, 'ca2', e.target.value)}
          disabled={loading}
          className="h-9 w-full min-w-[72px] text-center"
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          min="0"
          max="60"
          step="0.5"
          placeholder="—"
          value={row.exam}
          onChange={(e) => onUpdate(row.admissionNumber, 'exam', e.target.value)}
          disabled={loading}
          className="h-9 w-full min-w-[72px] text-center"
        />
      </td>
      <td className="p-3 text-center font-semibold text-primary">{hasAnyScore ? total.toFixed(1) : '—'}</td>
      <td className="p-3 text-center">
        {grade ? (
          <span className={cn('inline-block rounded px-2 py-0.5 text-xs font-bold', gradeBadgeClass(grade))}>
            {grade}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

function StudentScoreCard({ row, index, loading, isPrefillTarget, showStream, onUpdate, rowRef }: StudentRowProps) {
  const total = rowTotal(row);
  const hasAnyScore = rowHasScores(row);
  const complete = rowIsComplete(row);
  const grade = hasAnyScore && complete ? scoreToGrade(total) : null;

  return (
    <div
      ref={rowRef as React.RefObject<HTMLDivElement>}
      className={cn(
        'rounded-lg border bg-card p-4 space-y-3 shadow-sm',
        isPrefillTarget && 'ring-2 ring-primary/30',
        complete && 'border-green-200 bg-green-50/30',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">#{index + 1}</p>
          <p className="font-semibold truncate">{row.studentName}</p>
          <p className="font-mono text-xs text-blue-700">{row.admissionNumber}</p>
          {showStream ? (
            <span className="mt-1 inline-block rounded bg-muted px-2 py-0.5 text-xs">{row.classLevel}</span>
          ) : null}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-primary">{hasAnyScore ? total.toFixed(1) : '—'}</p>
          {grade ? (
            <span className={cn('mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold', gradeBadgeClass(grade))}>
              {grade}
            </span>
          ) : null}
        </div>
      </div>
      <ScoreFields
        row={row}
        loading={loading}
        layout="grid"
        onUpdate={(field, value) => onUpdate(row.admissionNumber, field, value)}
      />
    </div>
  );
}

export function ResultUploadForm({
  initialSubject = '',
  initialClass = '',
  prefillStudent = null,
  onUploaded,
}: ResultUploadFormProps) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [metaLoading, setMetaLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classLevels, setClassLevels] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Array<{ subject: string; classLevel: string }>>([]);
  const [studentRows, setStudentRows] = useState<StudentScoreRow[]>([]);
  const [sessions, setSessions] = useState<AcademicSessionOption[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [metaRole, setMetaRole] = useState<'admin' | 'teacher'>('teacher');

  const [subject, setSubject] = useState(initialSubject);
  const [classAssigned, setClassAssigned] = useState(initialClass ? toClassPickerValue(initialClass) : '');

  const prefillRowRef = useRef<HTMLDivElement | HTMLTableRowElement>(null);
  const { isOffline } = useNetworkStatus();

  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/results/upload-meta', { credentials: 'include', cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not load upload options.');
        return;
      }
      setMetaRole(data.role === 'admin' ? 'admin' : 'teacher');
      setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
      setClassLevels(Array.isArray(data.classes) ? data.classes : []);
      setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
      const sessionRows = Array.isArray(data.sessions) ? (data.sessions as AcademicSessionOption[]) : [];
      setSessions(sessionRows);
      if (data.current?.sessionId) {
        setSessionId(data.current.sessionId);
        setTermId(data.current.termId);
      } else if (sessionRows[0]) {
        setSessionId(sessionRows[0].id);
        setTermId(sessionRows[0].terms[0]?.id ?? '');
      } else {
        setSessionId('');
        setTermId('');
      }
    } catch {
      setError('Could not load upload options. Check your connection and try again.');
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (!prefillStudent) return;
    if (!classAssigned) setClassAssigned(toClassPickerValue(prefillStudent.classLevel));
  }, [prefillStudent, classAssigned]);

  const rawAllowedClasses = useMemo(() => {
    if (assignments.length > 0 && subject) {
      return [...new Set(assignments.filter((a) => a.subject === subject).map((a) => a.classLevel))];
    }
    return classLevels;
  }, [assignments, subject, classLevels]);

  const classPickerOptions = useMemo(
    () => toClassPickerOptions(rawAllowedClasses),
    [rawAllowedClasses],
  );

  const catalogClasses = useMemo(
    () => [...new Set([...classLevels, ...rawAllowedClasses])],
    [classLevels, rawAllowedClasses],
  );

  const selectedOption = useMemo(
    () => classPickerOptions.find((o) => o.value === classAssigned),
    [classPickerOptions, classAssigned],
  );

  const showStreamBadge = (selectedOption?.streams.length ?? 0) > 1;

  useEffect(() => {
    if (classPickerOptions.length === 0) return;
    if (!classAssigned || !classPickerOptions.some((o) => o.value === classAssigned)) {
      setClassAssigned(classPickerOptions[0]?.value ?? '');
    }
  }, [classPickerOptions, classAssigned]);

  const rosterReady = Boolean(subject && classAssigned && sessionId && termId);

  const loadClassRoster = useCallback(async () => {
    if (!rosterReady) {
      setStudentRows([]);
      return;
    }

    setStudentsLoading(true);
    setError(null);

    try {
      const studentsRes = await fetch(
        `/api/teacher/class-students?classGroup=${encodeURIComponent(classAssigned)}`,
        { credentials: 'include' },
      );
      const studentsData = await studentsRes.json();
      if (!studentsRes.ok) {
        setStudentRows([]);
        setError(studentsData.error || 'Could not load students for this class.');
        return;
      }

      const students: Array<{ id: string; admissionNumber: string; name: string; classLevel: string }> =
        Array.isArray(studentsData.students) ? studentsData.students : [];

      const streamLevels = new Set(classLevelsForPickerValue(classAssigned, catalogClasses));

      const resultsListUrl =
        metaRole === 'admin'
          ? `/api/admin/results/list?sessionId=${encodeURIComponent(sessionId)}&termId=${encodeURIComponent(termId)}`
          : `/api/teacher/results/list?sessionId=${encodeURIComponent(sessionId)}&termId=${encodeURIComponent(termId)}`;

      const resultsRes = await fetch(resultsListUrl, { credentials: 'include' });
      const resultsData = await resultsRes.json();
      const existingRows: Array<{
        admissionNumber: string;
        subject: string;
        classLevel: string;
        ca1: number;
        ca2: number;
        exam: number;
      }> = resultsRes.ok && Array.isArray(resultsData.rows) ? resultsData.rows : [];

      const existingByAdmission = new Map(
        existingRows
          .filter((r) => r.subject === subject && streamLevels.has(r.classLevel))
          .map((r) => [r.admissionNumber, r]),
      );

      setStudentRows(
        students.map((s) => {
          const existing = existingByAdmission.get(s.admissionNumber);
          return {
            studentId: s.id,
            admissionNumber: s.admissionNumber,
            studentName: s.name,
            classLevel: s.classLevel,
            ca1: existing ? String(existing.ca1) : '',
            ca2: existing ? String(existing.ca2) : '',
            exam: existing ? String(existing.exam) : '',
          };
        }),
      );
    } catch {
      setStudentRows([]);
      setError('Could not load the class student list. Check your connection and try again.');
    } finally {
      setStudentsLoading(false);
    }
  }, [rosterReady, classAssigned, sessionId, termId, subject, metaRole, catalogClasses]);

  useEffect(() => {
    void loadClassRoster();
  }, [loadClassRoster]);

  useEffect(() => {
    if (!prefillStudent || studentRows.length === 0) return;
    prefillRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [prefillStudent, studentRows.length]);

  const completedCount = useMemo(() => studentRows.filter(rowIsComplete).length, [studentRows]);
  const partialCount = useMemo(
    () => studentRows.filter((r) => rowHasScores(r) && !rowIsComplete(r)).length,
    [studentRows],
  );
  const allComplete = studentRows.length > 0 && completedCount === studentRows.length;
  const remainingCount = studentRows.length - completedCount;

  function updateScore(admissionNumber: string, field: 'ca1' | 'ca2' | 'exam', value: string) {
    setStudentRows((prev) =>
      prev.map((row) => (row.admissionNumber === admissionNumber ? { ...row, [field]: value } : row)),
    );
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!subject) throw new Error('Subject is required');
      if (!classAssigned) throw new Error('Class is required');
      if (!sessionId || !termId) {
        throw new Error('Please select academic session and term for these results.');
      }

      if (studentRows.length === 0) {
        throw new Error('No students in this class.');
      }

      if (!allComplete) {
        throw new Error(`Enter scores for all ${studentRows.length} students before uploading (${remainingCount} remaining).`);
      }

      for (const row of studentRows) {
        const validationError = validateScoreRow(row);
        if (validationError) throw new Error(validationError);
      }

      const uploadPayload = {
        subject,
        classAssigned,
        sessionId,
        termId,
        results: studentRows.map((row) => ({
          studentId: row.studentId,
          admissionNumber: row.admissionNumber,
          studentName: row.studentName,
          ca1: row.ca1,
          ca2: row.ca2,
          exam: row.exam,
        })),
      };

      const outcome = await submitOrQueue({
        url: '/api/results/upload',
        method: 'POST',
        body: uploadPayload,
        label: `Results: ${classAssigned} · ${subject}`,
        queueKey: `results-${classAssigned}-${subject}-${sessionId}-${termId}`,
        credentials: 'include',
      });

      if (outcome.queued) {
        setSuccess(true);
        setSuccessMessage(`${outcome.message} (${studentRows.length} students)`);
        setTimeout(() => setSuccess(false), 8000);
        return;
      }

      const data = await outcome.response.json();

      if (!outcome.response.ok) {
        throw new Error(data.error || 'Failed to upload results');
      }

      setSuccess(true);
      setSuccessMessage(data.message);
      onUploaded?.();
      void loadClassRoster();

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
        <CardTitle>Enter Student Results</CardTitle>
        <CardDescription>
          Choose term, subject, and class — enter every student&apos;s scores, then upload
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <OfflineQueueAlert />

          {isOffline ? (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-900">
                You are offline. You can still fill scores and tap upload — they will be saved and sent
                automatically when your data connection returns.
              </AlertDescription>
            </Alert>
          ) : null}

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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SessionTermPicker
              sessions={sessions}
              sessionId={sessionId}
              termId={termId}
              onSessionChange={setSessionId}
              onTermChange={setTermId}
              disabled={loading || metaLoading}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => void loadMeta()} disabled={metaLoading}>
              Refresh sessions
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={subject} onValueChange={setSubject} disabled={loading || metaLoading}>
                <SelectTrigger id="subject" disabled={loading || metaLoading}>
                  <SelectValue placeholder={subjects.length ? 'Select subject' : 'No subjects available'} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classAssigned">Class *</Label>
              <Select value={classAssigned} onValueChange={setClassAssigned} disabled={loading || metaLoading}>
                <SelectTrigger id="classAssigned" disabled={loading || metaLoading}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classPickerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                      {option.streams.length > 1 ? ` (${option.streams.join(', ')})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedOption && selectedOption.streams.length > 1 ? (
                <p className="text-xs text-muted-foreground">
                  Includes all streams: {selectedOption.streams.join(', ')}
                </p>
              ) : null}
            </div>
          </div>

          {!rosterReady ? (
            <Alert>
              <ClipboardList className="h-4 w-4" />
              <AlertDescription>
                Select session, term, subject, and class to load the full student list.
              </AlertDescription>
            </Alert>
          ) : studentsLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader className="h-5 w-5 animate-spin" />
              Loading students in {classAssigned}…
            </div>
          ) : studentRows.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>No students found in {classAssigned}. Add students under Admin → Students.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-muted/40 px-4 py-3">
                <div>
                  <p className="font-medium">
                    {classAssigned} · {subject}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    All {studentRows.length} students must be filled before upload
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 font-medium',
                      allComplete ? 'bg-green-100 text-green-800' : 'bg-green-50 text-green-700',
                    )}
                  >
                    {completedCount} / {studentRows.length} complete
                  </span>
                  {partialCount > 0 ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                      {partialCount} in progress
                    </span>
                  ) : null}
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  CA1 and CA2 are out of 20 each. Exam is out of 60. Total and grade update automatically.
                </AlertDescription>
              </Alert>

              {isMobile ? (
                <div className="space-y-3">
                  {studentRows.map((row, index) => (
                    <StudentScoreCard
                      key={row.admissionNumber}
                      row={row}
                      index={index}
                      loading={loading}
                      isPrefillTarget={prefillStudent?.admissionNumber === row.admissionNumber}
                      showStream={showStreamBadge}
                      onUpdate={updateScore}
                      rowRef={
                        prefillStudent?.admissionNumber === row.admissionNumber ? prefillRowRef : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className="border-b bg-muted/60">
                        <tr>
                          <th className="text-left p-3 font-semibold w-10">S/N</th>
                          <th className="text-left p-3 font-semibold">Admission No</th>
                          <th className="text-left p-3 font-semibold min-w-[140px]">Student Name</th>
                          <th className="text-center p-3 font-semibold w-24">CA1 (20)</th>
                          <th className="text-center p-3 font-semibold w-24">CA2 (20)</th>
                          <th className="text-center p-3 font-semibold w-24">Exam (60)</th>
                          <th className="text-center p-3 font-semibold w-20">Total</th>
                          <th className="text-center p-3 font-semibold w-16">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentRows.map((row, index) => (
                          <StudentTableRow
                            key={row.admissionNumber}
                            row={row}
                            index={index}
                            loading={loading}
                            isPrefillTarget={prefillStudent?.admissionNumber === row.admissionNumber}
                            showStream={showStreamBadge}
                            onUpdate={updateScore}
                            rowRef={
                              prefillStudent?.admissionNumber === row.admissionNumber ? prefillRowRef : undefined
                            }
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {allComplete
                ? `All ${studentRows.length} students ready — you can upload now`
                : studentRows.length > 0
                  ? `${remainingCount} student${remainingCount === 1 ? '' : 's'} still need scores`
                  : 'Fill in all scores above before uploading'}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStudentRows((prev) => prev.map((r) => ({ ...r, ca1: '', ca2: '', exam: '' })));
                  setError(null);
                  setSuccess(false);
                }}
                disabled={loading || studentRows.length === 0}
              >
                Clear scores
              </Button>
              <Button
                type="submit"
                disabled={loading || !sessionId || !termId || !allComplete}
                className="bg-green-600 hover:bg-green-700 min-w-[160px]"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload all ({studentRows.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

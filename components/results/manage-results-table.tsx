'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Loader2, Trash2 } from 'lucide-react';
import { scoreToGrade } from '@/lib/grades';

export type ManageResultRow = {
  id: string;
  studentName: string;
  admissionNumber: string;
  classLevel: string;
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string | null;
  remark: string | null;
  teacherName: string;
  sessionName?: string;
  termName?: string;
};

export function ManageResultsTable({
  rows,
  loading,
  onRefresh,
}: {
  rows: ManageResultRow[];
  loading?: boolean;
  onRefresh: () => void;
}) {
  const [editRow, setEditRow] = useState<ManageResultRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<ManageResultRow | null>(null);
  const [ca1, setCa1] = useState('');
  const [ca2, setCa2] = useState('');
  const [exam, setExam] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEdit(row: ManageResultRow) {
    setError(null);
    setEditRow(row);
    setCa1(String(row.ca1));
    setCa2(String(row.ca2));
    setExam(String(row.exam));
  }

  async function saveEdit() {
    if (!editRow) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/results/${editRow.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ca1, ca2, exam }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update result');
      setEditRow(null);
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteRow) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/results/${deleteRow.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete result');
      setDeleteRow(null);
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setBusy(false);
    }
  }

  const previewTotal = Number(ca1 || 0) + Number(ca2 || 0) + Number(exam || 0);

  return (
    <>
      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/60">
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Adm No</th>
              <th className="p-2 text-left">Class</th>
              <th className="p-2 text-left">Subject</th>
              <th className="p-2 text-center">CA1</th>
              <th className="p-2 text-center">CA2</th>
              <th className="p-2 text-center">Exam</th>
              <th className="p-2 text-center">Total</th>
              <th className="p-2 text-center">Grade</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-4 text-muted-foreground">
                  No uploaded results for this filter.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.studentName}</td>
                  <td className="p-2 font-mono text-xs">{r.admissionNumber}</td>
                  <td className="p-2">{r.classLevel}</td>
                  <td className="p-2">{r.subject}</td>
                  <td className="p-2 text-center">{r.ca1}</td>
                  <td className="p-2 text-center">{r.ca2}</td>
                  <td className="p-2 text-center">{r.exam}</td>
                  <td className="p-2 text-center font-semibold">{r.total}</td>
                  <td className="p-2 text-center">{r.grade ?? '—'}</td>
                  <td className="p-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(r)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setError(null);
                          setDeleteRow(r);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={editRow !== null} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit result</DialogTitle>
            <DialogDescription>
              {editRow ? (
                <>
                  {editRow.studentName} · {editRow.subject} · {editRow.classLevel}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>CA1 (0–20)</Label>
              <Input value={ca1} onChange={(e) => setCa1(e.target.value)} disabled={busy} />
            </div>
            <div className="space-y-2">
              <Label>CA2 (0–20)</Label>
              <Input value={ca2} onChange={(e) => setCa2(e.target.value)} disabled={busy} />
            </div>
            <div className="space-y-2">
              <Label>Exam (0–60)</Label>
              <Input value={exam} onChange={(e) => setExam(e.target.value)} disabled={busy} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            New total: <span className="font-semibold text-foreground">{previewTotal.toFixed(1)}</span> / 100 · Grade{' '}
            <span className="font-semibold text-foreground">{scoreToGrade(previewTotal)}</span>
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditRow(null)} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void saveEdit()} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteRow !== null} onOpenChange={(open) => !open && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this result?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteRow ? (
                <>
                  Remove {deleteRow.subject} result for {deleteRow.studentName} ({deleteRow.admissionNumber}). This
                  cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              disabled={busy}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Edit, Trash2, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddStudentModal } from '@/components/admin/add-student-modal';

type ApiStudent = {
  id: string;
  admissionNumber: string;
  name: string;
  classLabel: string;
  gender: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  status: string;
};

const classes = [
  'JSS 1A',
  'JSS 1B',
  'JSS 1C',
  'JSS 2A',
  'JSS 2B',
  'JSS 2C',
  'JSS 3A',
  'JSS 3B',
  'JSS 3C',
  'SS 1A',
  'SS 1B',
  'SS 1C',
  'SS 2A',
  'SS 2B',
  'SS 2C',
  'SS 3A',
  'SS 3B',
  'SS 3C',
];

export default function AdminStudentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<ApiStudent | null>(null);
  const [stubAction, setStubAction] = useState<{ action: 'edit' | 'delete'; student: ApiStudent } | null>(null);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/students', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setError('You do not have access to this list.');
        setStudents([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load students');
      setStudents(data.students ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  return (
    <div className="space-y-6">
      <AddStudentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        classes={classes}
        onStudentAdded={() => {
          void loadStudents();
        }}
      />

      <Dialog open={detailStudent !== null} onOpenChange={(o) => !o && setDetailStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student details</DialogTitle>
            <DialogDescription>Admission {detailStudent?.admissionNumber}</DialogDescription>
          </DialogHeader>
          {detailStudent ? (
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{detailStudent.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Class</dt>
                <dd>{detailStudent.classLabel || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Gender</dt>
                <dd>{detailStudent.gender}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Date of birth</dt>
                <dd>{detailStudent.dateOfBirth}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Parent / guardian</dt>
                <dd>{detailStudent.parentName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{detailStudent.parentPhone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="capitalize">{detailStudent.status}</dd>
              </div>
            </dl>
          ) : null}
          <DialogFooter>
            <Button type="button" onClick={() => setDetailStudent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stubAction !== null} onOpenChange={(o) => !o && setStubAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{stubAction === 'edit' ? 'Edit student' : 'Delete student'}</DialogTitle>
            <DialogDescription>
              {stubAction === 'edit'
                ? 'Inline editing is not set up yet. You can add a new student record from the Add Student button when flows are extended.'
                : 'Permanent delete from the admin UI is not enabled yet to avoid accidental data loss.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setStubAction(null)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Manage all students in the school</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button type="button" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Students</CardTitle>
              <CardDescription>View and manage student records (live data)</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search (coming soon)…" className="pl-8" disabled />
              </div>
              <Select defaultValue="all" disabled>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="jss1">JSS 1</SelectItem>
                  <SelectItem value="jss2">JSS 2</SelectItem>
                  <SelectItem value="jss3">JSS 3</SelectItem>
                  <SelectItem value="ss1">SS 1</SelectItem>
                  <SelectItem value="ss2">SS 2</SelectItem>
                  <SelectItem value="ss3">SS 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading students…</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Admission No.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Class</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Gender</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Parent/Guardian</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No students yet. Add one to get started.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="px-4 py-3 text-sm font-medium">{student.admissionNumber}</td>
                        <td className="px-4 py-3 text-sm">{student.name}</td>
                        <td className="px-4 py-3 text-sm">{student.classLabel || '—'}</td>
                        <td className="px-4 py-3 text-sm">{student.gender}</td>
                        <td className="px-4 py-3 text-sm">{student.parentName}</td>
                        <td className="px-4 py-3 text-sm">{student.parentPhone}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>{student.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => setDetailStudent(student)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setStubAction({ action: 'edit', student })}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setStubAction({ action: 'delete', student })}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

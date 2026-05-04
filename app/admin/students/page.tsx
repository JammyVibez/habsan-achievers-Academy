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

export default function AdminStudentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<ApiStudent | null>(null);
  const [editStudent, setEditStudent] = useState<ApiStudent | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<ApiStudent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
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
    void (async () => {
      try {
        const res = await fetch('/api/public/classes');
        const data = await res.json();
        if (res.ok && Array.isArray(data.classes)) setClasses(data.classes);
      } catch {
        // fallback handled in modal
      }
    })();
  }, [loadStudents]);

  async function handleSaveEdit() {
    if (!editStudent) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const [firstName, ...rest] = editStudent.name.trim().split(/\s+/);
      const lastName = rest.join(' ') || '-';
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editStudent.id,
          firstName,
          lastName,
          classLevel: editStudent.classLabel.trim(),
          parentName: editStudent.parentName.trim(),
          parentPhone: editStudent.parentPhone.trim(),
          status: editStudent.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student');
      setEditStudent(null);
      await loadStudents();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to update student');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteStudent() {
    if (!deleteStudent) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/students?id=${encodeURIComponent(deleteStudent.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete student');
      setDeleteStudent(null);
      await loadStudents();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete student');
    } finally {
      setActionLoading(false);
    }
  }

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

      <Dialog open={editStudent !== null} onOpenChange={(o) => !o && setEditStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>Update student basic details.</DialogDescription>
          </DialogHeader>
          {editStudent ? (
            <div className="space-y-3">
              <Input
                value={editStudent.name}
                onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                placeholder="Student name"
                disabled={actionLoading}
              />
              <Input
                value={editStudent.classLabel}
                onChange={(e) => setEditStudent({ ...editStudent, classLabel: e.target.value })}
                placeholder="Class (e.g. JSS 1A)"
                disabled={actionLoading}
              />
              <Input
                value={editStudent.parentName}
                onChange={(e) => setEditStudent({ ...editStudent, parentName: e.target.value })}
                placeholder="Parent / guardian name"
                disabled={actionLoading}
              />
              <Input
                value={editStudent.parentPhone}
                onChange={(e) => setEditStudent({ ...editStudent, parentPhone: e.target.value })}
                placeholder="Parent / guardian phone"
                disabled={actionLoading}
              />
              <Select
                value={editStudent.status}
                onValueChange={(value) => setEditStudent({ ...editStudent, status: value })}
                disabled={actionLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="suspended">suspended</SelectItem>
                  <SelectItem value="graduated">graduated</SelectItem>
                  <SelectItem value="withdrawn">withdrawn</SelectItem>
                </SelectContent>
              </Select>
              {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditStudent(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSaveEdit()} disabled={actionLoading}>
              {actionLoading ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteStudent !== null} onOpenChange={(o) => !o && setDeleteStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete student</DialogTitle>
            <DialogDescription>
              This removes the student account permanently. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            Delete <span className="font-semibold">{deleteStudent?.name}</span> (
            <span className="font-mono">{deleteStudent?.admissionNumber}</span>)?
          </p>
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteStudent(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => void handleDeleteStudent()} disabled={actionLoading}>
              {actionLoading ? 'Deleting…' : 'Delete student'}
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
                              onClick={() => {
                                setActionError(null);
                                setEditStudent(student);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setActionError(null);
                                setDeleteStudent(student);
                              }}
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

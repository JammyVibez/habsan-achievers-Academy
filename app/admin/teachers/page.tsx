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
import { AddTeacherModal } from '@/components/admin/add-teacher-modal';

type ApiTeacher = {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  classes: string[];
  status: string;
};

function formatTeacherStatus(status: string) {
  return status.replace(/_/g, ' ');
}

export default function AdminTeachersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailTeacher, setDetailTeacher] = useState<ApiTeacher | null>(null);
  const [editTeacher, setEditTeacher] = useState<ApiTeacher | null>(null);
  const [deleteTeacher, setDeleteTeacher] = useState<ApiTeacher | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/teachers', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setError('You do not have access to this list.');
        setTeachers([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load teachers');
      setTeachers(data.teachers ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTeachers();
  }, [loadTeachers]);

  async function handleSaveEdit() {
    if (!editTeacher) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const [firstName, ...rest] = editTeacher.name.trim().split(/\s+/);
      const lastName = rest.join(' ') || '-';
      const res = await fetch('/api/admin/teachers', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editTeacher.id,
          firstName,
          lastName,
          phone: editTeacher.phone === '—' ? '' : editTeacher.phone,
          homeroomClass: editTeacher.classes[0] ?? '',
          status: editTeacher.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update teacher');
      setEditTeacher(null);
      await loadTeachers();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to update teacher');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteTeacher() {
    if (!deleteTeacher) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/teachers?id=${encodeURIComponent(deleteTeacher.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete teacher');
      setDeleteTeacher(null);
      await loadTeachers();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete teacher');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <AddTeacherModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onTeacherAdded={() => {
          void loadTeachers();
        }}
      />

      <Dialog open={detailTeacher !== null} onOpenChange={(o) => !o && setDetailTeacher(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Teacher details</DialogTitle>
            <DialogDescription>Staff ID {detailTeacher?.staffId}</DialogDescription>
          </DialogHeader>
          {detailTeacher ? (
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{detailTeacher.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all">{detailTeacher.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{detailTeacher.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Subjects</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {detailTeacher.subjects.length === 0 ? (
                    <span>—</span>
                  ) : (
                    detailTeacher.subjects.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Classes</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {detailTeacher.classes.length === 0 ? (
                    <span>—</span>
                  ) : (
                    detailTeacher.classes.map((c) => (
                      <Badge key={c} variant="outline" className="text-xs">
                        {c}
                      </Badge>
                    ))
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="capitalize">{formatTeacherStatus(detailTeacher.status)}</dd>
              </div>
            </dl>
          ) : null}
          <DialogFooter>
            <Button type="button" onClick={() => setDetailTeacher(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editTeacher !== null} onOpenChange={(o) => !o && setEditTeacher(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit teacher</DialogTitle>
            <DialogDescription>Update teacher basic details.</DialogDescription>
          </DialogHeader>
          {editTeacher ? (
            <div className="space-y-3">
              <Input
                value={editTeacher.name}
                onChange={(e) => setEditTeacher({ ...editTeacher, name: e.target.value })}
                placeholder="Teacher name"
                disabled={actionLoading}
              />
              <Input
                value={editTeacher.phone === '—' ? '' : editTeacher.phone}
                onChange={(e) => setEditTeacher({ ...editTeacher, phone: e.target.value })}
                placeholder="Phone number"
                disabled={actionLoading}
              />
              <Input
                value={editTeacher.classes[0] ?? ''}
                onChange={(e) => setEditTeacher({ ...editTeacher, classes: e.target.value ? [e.target.value] : [] })}
                placeholder="Homeroom class (optional)"
                disabled={actionLoading}
              />
              <Select
                value={editTeacher.status}
                onValueChange={(value) => setEditTeacher({ ...editTeacher, status: value })}
                disabled={actionLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="on_leave">on leave</SelectItem>
                  <SelectItem value="terminated">terminated</SelectItem>
                </SelectContent>
              </Select>
              {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditTeacher(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSaveEdit()} disabled={actionLoading}>
              {actionLoading ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTeacher !== null} onOpenChange={(o) => !o && setDeleteTeacher(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete teacher</DialogTitle>
            <DialogDescription>
              This removes the teacher account permanently. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            Delete <span className="font-semibold">{deleteTeacher?.name}</span> (
            <span className="font-mono">{deleteTeacher?.staffId}</span>)?
          </p>
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTeacher(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => void handleDeleteTeacher()} disabled={actionLoading}>
              {actionLoading ? 'Deleting…' : 'Delete teacher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold">Teacher Management</h1>
          <p className="text-muted-foreground">Manage all teaching staff</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button type="button" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
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
              <CardTitle>All Teachers</CardTitle>
              <CardDescription>View and manage teacher records (live data)</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search (coming soon)…" className="pl-8" disabled />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading teachers…</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Staff ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Subjects</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Classes</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No teachers yet. Add one to get started.
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher) => (
                      <tr key={teacher.id} className="border-b">
                        <td className="px-4 py-3 text-sm font-medium">{teacher.staffId}</td>
                        <td className="px-4 py-3 text-sm">{teacher.name}</td>
                        <td className="px-4 py-3 text-sm">{teacher.email}</td>
                        <td className="px-4 py-3 text-sm">{teacher.phone}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              teacher.subjects.map((subject) => (
                                <Badge key={subject} variant="secondary" className="text-xs">
                                  {subject}
                                </Badge>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {teacher.classes.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <>
                                {teacher.classes.slice(0, 2).map((cls) => (
                                  <Badge key={cls} variant="outline" className="text-xs">
                                    {cls}
                                  </Badge>
                                ))}
                                {teacher.classes.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{teacher.classes.length - 2}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                            {formatTeacherStatus(teacher.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => setDetailTeacher(teacher)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActionError(null);
                                setEditTeacher(teacher);
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
                                setDeleteTeacher(teacher);
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

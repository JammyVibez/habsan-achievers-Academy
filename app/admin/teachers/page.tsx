'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Edit, Trash2, Eye } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminRowActionsMenu } from '@/components/admin/admin-row-actions-menu';
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
  const [stubAction, setStubAction] = useState<{ action: 'edit' | 'delete'; teacher: ApiTeacher } | null>(null);
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

      <Dialog open={stubAction !== null} onOpenChange={(o) => !o && setStubAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {stubAction?.action === 'edit' ? 'Edit teacher' : 'Delete teacher'}
              {stubAction ? ` — ${stubAction.teacher.name}` : ''}
            </DialogTitle>
            <DialogDescription>
              {stubAction?.action === 'edit'
                ? 'Inline editing is not set up yet. Use Add Teacher for new staff until edit APIs are added.'
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
                        <td className="relative z-10 px-4 py-3 text-right">
                          <AdminRowActionsMenu>
                            <DropdownMenuItem
                              onSelect={() => {
                                window.setTimeout(() => setDetailTeacher(teacher), 0);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                window.setTimeout(() => setStubAction({ action: 'edit', teacher }), 0);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => {
                                window.setTimeout(() => setStubAction({ action: 'delete', teacher }), 0);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AdminRowActionsMenu>
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

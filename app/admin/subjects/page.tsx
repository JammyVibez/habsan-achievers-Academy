'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type SubjectRow = { id: string; name: string; code: string; isActive: boolean };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');

  async function loadSubjects() {
    const res = await fetch('/api/admin/subjects', { credentials: 'include' });
    const data = await res.json();
    if (res.ok) setSubjects(data.subjects ?? []);
  }

  useEffect(() => {
    void loadSubjects();
  }, []);

  async function addSubject() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add subject');
      setName('');
      setCode('');
      await loadSubjects();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(subject: SubjectRow) {
    await fetch('/api/admin/subjects', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: subject.id, isActive: !subject.isActive }),
    });
    await loadSubjects();
  }

  async function removeSubject(id: string) {
    await fetch(`/api/admin/subjects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await loadSubjects();
  }

  async function saveSubjectEdit() {
    if (!editingSubject) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSubject.id,
          name: editName.trim(),
          code: editCode.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update subject');
      setEditingSubject(null);
      setEditName('');
      setEditCode('');
      await loadSubjects();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update subject');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Subject Management</h1>
        <p className="text-muted-foreground">Add, edit, deactivate, and delete subjects in real time.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Subject</CardTitle>
          <CardDescription>New subjects become available across teacher/student/admin forms.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Subject name" />
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code e.g. MTH101" />
          <Button onClick={() => void addSubject()} disabled={loading || !name.trim() || !code.trim()}>
            {loading ? 'Saving…' : 'Add Subject'}
          </Button>
          {error ? <p className="text-sm text-destructive md:col-span-4">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
          <CardDescription>{subjects.length} subject(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{subject.name}</p>
                <p className="text-sm text-muted-foreground">{subject.code}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={subject.isActive ? 'default' : 'secondary'}>
                  {subject.isActive ? 'active' : 'inactive'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingSubject(subject);
                    setEditName(subject.name);
                    setEditCode(subject.code);
                    setError(null);
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => void toggleActive(subject)}>
                  {subject.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => void removeSubject(subject.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={editingSubject !== null} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit subject</DialogTitle>
            <DialogDescription>Update subject name and code.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Subject name" />
            <Input value={editCode} onChange={(e) => setEditCode(e.target.value.toUpperCase())} placeholder="Subject code" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSubject(null)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={() => void saveSubjectEdit()} disabled={loading || !editName.trim() || !editCode.trim()}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

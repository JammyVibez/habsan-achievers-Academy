'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState('');
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadClasses() {
    const res = await fetch('/api/admin/classes', { credentials: 'include' });
    const data = await res.json();
    if (res.ok) setClasses(data.classes ?? []);
  }

  useEffect(() => {
    void loadClasses();
  }, []);

  async function saveClasses(nextClasses: string[]) {
    setLoading(true);
    try {
      await fetch('/api/admin/classes', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classes: nextClasses }),
      });
      setClasses(nextClasses);
    } finally {
      setLoading(false);
    }
  }

  async function renameClass(oldName: string, newName: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rename class');
      setClasses(data.classes ?? []);
      setEditingClass(null);
      setEditValue('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to rename class');
    } finally {
      setLoading(false);
    }
  }

  async function deleteClass(name: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/classes?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete class');
      setClasses(data.classes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete class');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Class Management</h1>
        <p className="text-muted-foreground">Manage the class list used across admissions, teacher, and student flows.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add class</CardTitle>
          <CardDescription>Examples: JSS 1A, SS 2B, Nursery 1.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="Enter class name" />
          <Button
            disabled={loading || !newClass.trim()}
            onClick={() => {
              const cls = newClass.trim();
              if (classes.includes(cls)) return;
              void saveClasses([...classes, cls]);
              setNewClass('');
            }}
          >
            Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All classes</CardTitle>
          <CardDescription>{classes.length} class(es)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {classes.map((cls) => (
            <div key={cls} className="flex items-center justify-between rounded border p-3">
              {editingClass === cls ? (
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="mr-2" />
              ) : (
                <span>{cls}</span>
              )}
              <div className="flex items-center gap-2">
                {editingClass === cls ? (
                  <>
                    <Button
                      size="sm"
                      disabled={loading || !editValue.trim()}
                      onClick={() => void renameClass(cls, editValue.trim())}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={() => {
                        setEditingClass(null);
                        setEditValue('');
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    onClick={() => {
                      setEditingClass(cls);
                      setEditValue(cls);
                      setError(null);
                    }}
                  >
                    Rename
                  </Button>
                )}
                <Button size="sm" variant="destructive" disabled={loading} onClick={() => void deleteClass(cls)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

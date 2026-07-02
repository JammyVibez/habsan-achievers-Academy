'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import type { NoticeRow } from '@/lib/notices';
import { submitOrQueue } from '@/lib/offline-submit';
import { OfflineQueueAlert } from '@/components/offline/offline-queue-alert';

type NoticeFormState = {
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'parents';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPublished: boolean;
  expiresAt: string;
};

const emptyForm: NoticeFormState = {
  title: '',
  content: '',
  targetAudience: 'all',
  priority: 'medium',
  isPublished: true,
  expiresAt: '',
};

function priorityBadgeVariant(priority: string) {
  switch (priority) {
    case 'urgent':
    case 'high':
      return 'destructive' as const;
    case 'medium':
      return 'default' as const;
    default:
      return 'secondary' as const;
  }
}

export function NoticeboardManager() {
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<NoticeFormState>(emptyForm);
  const [queueSuccess, setQueueSuccess] = useState<string | null>(null);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/notices', { credentials: 'include', cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not load notices.');
        return;
      }
      setNotices(Array.isArray(data.notices) ? data.notices : []);
    } catch {
      setError('Could not load notices. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotices();
  }, [loadNotices]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(notice: NoticeRow) {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      content: notice.content,
      targetAudience: notice.targetAudience,
      priority: notice.priority,
      isPublished: notice.isPublished,
      expiresAt: notice.expiresAt ? notice.expiresAt.slice(0, 10) : '',
    });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      targetAudience: form.targetAudience,
      priority: form.priority,
      isPublished: form.isPublished,
      expiresAt: form.expiresAt ? form.expiresAt : null,
    };

    try {
      const url = editingId ? `/api/admin/notices/${editingId}` : '/api/admin/notices';
      const method = editingId ? 'PATCH' : 'POST';

      const outcome = await submitOrQueue({
        url,
        method,
        body: payload,
        label: editingId ? `Notice edit: ${payload.title}` : `Notice: ${payload.title}`,
        queueKey: editingId ? `notice-${editingId}` : undefined,
        credentials: 'include',
      });

      if (outcome.queued) {
        setQueueSuccess(outcome.message);
        setDialogOpen(false);
        setTimeout(() => setQueueSuccess(null), 8000);
        return;
      }

      const data = await outcome.response.json();
      if (!outcome.response.ok) {
        setError(data.error || 'Could not save notice.');
        return;
      }
      setDialogOpen(false);
      await loadNotices();
    } catch {
      setError('Could not save notice.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(notice: NoticeRow) {
    setError(null);
    try {
      const outcome = await submitOrQueue({
        url: `/api/admin/notices/${notice.id}`,
        method: 'PATCH',
        body: { isPublished: !notice.isPublished },
        label: `${notice.isPublished ? 'Unpublish' : 'Publish'}: ${notice.title}`,
        queueKey: `notice-publish-${notice.id}`,
        credentials: 'include',
      });

      if (outcome.queued) {
        setQueueSuccess(outcome.message);
        setTimeout(() => setQueueSuccess(null), 8000);
        return;
      }

      if (!outcome.response.ok) {
        const data = await outcome.response.json();
        setError(data.error || 'Could not update notice.');
        return;
      }
      await loadNotices();
    } catch {
      setError('Could not update notice.');
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/notices/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Could not delete notice.');
        return;
      }
      setDeleteId(null);
      await loadNotices();
    } catch {
      setError('Could not delete notice.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Noticeboard Management</h1>
          <p className="text-muted-foreground">Create and publish school announcements</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Notice
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {queueSuccess ? (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{queueSuccess}</AlertDescription>
        </Alert>
      ) : null}

      <OfflineQueueAlert />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No notices yet. Click <strong>Create Notice</strong> to post your first announcement.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notices.map((notice) => (
            <Card key={notice.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">{notice.title}</CardTitle>
                      {!notice.isPublished ? (
                        <Badge variant="secondary">
                          <EyeOff className="mr-1 h-3 w-3" />
                          Draft
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          <Eye className="mr-1 h-3 w-3" />
                          Published
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Posted by {notice.authorName} on{' '}
                      {new Date(notice.publishedAt ?? notice.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => void togglePublish(notice)}>
                      {notice.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(notice)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(notice.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notice.content}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Target: {notice.targetAudience}</Badge>
                  <Badge variant={priorityBadgeVariant(notice.priority)}>{notice.priority} priority</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Notice' : 'Create Notice'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update this announcement.' : 'Write a new school announcement for the noticeboard.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notice-title">Title *</Label>
              <Input
                id="notice-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Mid-Term Break Announcement"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-content">Content *</Label>
              <Textarea
                id="notice-content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write the full notice here…"
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select
                  value={form.targetAudience}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, targetAudience: v as NoticeFormState['targetAudience'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                    <SelectItem value="teachers">Teachers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v as NoticeFormState['priority'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-expires">Expires (optional)</Label>
              <Input
                id="notice-expires"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="notice-published"
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="h-4 w-4 rounded border"
              />
              <Label htmlFor="notice-published">Publish immediately on save</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : editingId ? (
                  'Save changes'
                ) : (
                  'Post notice'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notice?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone. The notice will be removed from the public noticeboard.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

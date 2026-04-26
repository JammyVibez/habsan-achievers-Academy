'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Trash2, Plus, Pencil } from 'lucide-react';
import type { GalleryItemDTO } from '@/components/gallery/gallery-media';
import { AdminMediaUploadField } from '@/components/admin/admin-media-upload-field';
import { Switch } from '@/components/ui/switch';

const categories = ['classroom', 'sports', 'events', 'facilities', 'graduation'];
const FILE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';

export function GalleryCmsEditor() {
  const [items, setItems] = useState<GalleryItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [type, setType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('events');
  const [adding, setAdding] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'image' | 'video'>('image');
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [editThumb, setEditThumb] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editCategory, setEditCategory] = useState('events');
  const [editSort, setEditSort] = useState(0);
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/gallery', { credentials: 'include' });
      const data = (await res.json()) as { items?: GalleryItemDTO[]; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data.items ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Load failed');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(it: GalleryItemDTO) {
    setEditId(it.id);
    setEditType(it.type === 'video' ? 'video' : 'image');
    setEditMediaUrl(it.mediaUrl);
    setEditThumb(it.thumbnailUrl ?? '');
    setEditTitle(it.title);
    setEditCaption(it.caption ?? '');
    setEditCategory(categories.includes(it.category) ? it.category : 'events');
    setEditSort(typeof it.sortOrder === 'number' ? it.sortOrder : 0);
    setEditActive(it.isActive !== false);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditId(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          mediaUrl: mediaUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim() || null,
          title: title.trim() || 'Untitled',
          caption: caption.trim() || null,
          category,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setMediaUrl('');
      setThumbnailUrl('');
      setTitle('');
      setCaption('');
      await load();
      setMessage('Item added.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit() {
    if (!editId) return;
    setSavingEdit(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/gallery/${editId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editType,
          mediaUrl: editMediaUrl.trim(),
          thumbnailUrl: editThumb.trim() || null,
          title: editTitle.trim(),
          caption: editCaption.trim() || null,
          category: editCategory,
          sortOrder: editSort,
          isActive: editActive,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Update failed');
      closeEdit();
      await load();
      setMessage('Item updated.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this gallery item?')) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Delete failed');
      }
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add gallery item</CardTitle>
          <CardDescription>
            Upload an image or video file, or paste a URL. Videos: optional poster image for the grid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(ev) => void handleAdd(ev)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'image' | 'video')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Media URL</Label>
              <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="/uploads/… or https://…" />
              <AdminMediaUploadField id="add-media-upload" label="" accept={FILE_ACCEPT} onUploaded={(url) => setMediaUrl(url)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Thumbnail URL (optional, videos)</Label>
              <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
              <AdminMediaUploadField id="add-thumb-upload" label="" accept="image/jpeg,image/png,image/webp,image/gif" onUploaded={(url) => setThumbnailUrl(url)} />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Caption (optional)</Label>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={adding || !mediaUrl.trim()}>
                {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Current items</CardTitle>
            <CardDescription>Edit, reorder (sort order), or hide items from the public gallery.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {items.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {items.map((it) => (
                <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{it.title}</span>{' '}
                    <span className="text-muted-foreground">
                      ({it.type} · {it.category}
                      {typeof it.sortOrder === 'number' ? ` · order ${it.sortOrder}` : ''}
                      {it.isActive === false ? ' · hidden' : ''})
                    </span>
                    <div className="break-all text-xs text-muted-foreground">{it.mediaUrl}</div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button type="button" variant="outline" size="icon" onClick={() => openEdit(it)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => void handleDelete(it.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit gallery item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={editType} onValueChange={(v) => setEditType(v as 'image' | 'video')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Media URL</Label>
              <Input value={editMediaUrl} onChange={(e) => setEditMediaUrl(e.target.value)} />
              <AdminMediaUploadField id="edit-media-upload" label="" accept={FILE_ACCEPT} onUploaded={(url) => setEditMediaUrl(url)} disabled={savingEdit} />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input value={editThumb} onChange={(e) => setEditThumb(e.target.value)} />
              <AdminMediaUploadField id="edit-thumb-upload" label="" accept="image/jpeg,image/png,image/webp,image/gif" onUploaded={(url) => setEditThumb(url)} disabled={savingEdit} />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Caption</Label>
              <Textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Sort order (lower first)</Label>
              <Input type="number" value={editSort} onChange={(e) => setEditSort(Number(e.target.value) || 0)} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="edit-active" checked={editActive} onCheckedChange={(v) => setEditActive(v === true)} />
              <Label htmlFor="edit-active">Visible on public gallery</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSaveEdit()} disabled={savingEdit || !editMediaUrl.trim()}>
              {savingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

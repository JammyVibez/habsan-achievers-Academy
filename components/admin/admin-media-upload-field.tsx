'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';

type Props = {
  id: string;
  label: string;
  /** Shown on the hidden file input, e.g. `image/*,video/mp4,video/webm` */
  accept: string;
  onUploaded: (publicUrl: string) => void;
  disabled?: boolean;
};

export function AdminMediaUploadField({ id, label, accept, onUploaded, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (!data.url) throw new Error('No URL returned');
      onUploaded(data.url);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="flex flex-wrap items-center gap-2">
        <input ref={inputRef} id={id} type="file" className="sr-only" accept={accept} onChange={(ev) => void onChange(ev)} disabled={disabled || busy} />
        <Button type="button" variant="outline" size="sm" disabled={disabled || busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Upload file
        </Button>
        <span className="text-xs text-muted-foreground">Uploaded to Supabase Storage</span>
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}

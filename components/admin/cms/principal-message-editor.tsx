'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { getDefaultPublicSiteContent } from '@/lib/site-content-defaults';
import { fetchPublicSiteContent, saveSiteContentBlock } from '@/lib/cms-client';
import { AdminMediaUploadField } from '@/components/admin/admin-media-upload-field';

type Form = {
  heading: string;
  signatureName: string;
  signatureTitle: string;
  message: string;
  image: string;
};

function toForm(p: ReturnType<typeof getDefaultPublicSiteContent>[typeof SITE_CONTENT_KEYS.principal]): Form {
  return {
    heading: p.heading,
    signatureName: p.signatureName,
    signatureTitle: p.signatureTitle,
    message: p.paragraphs.join('\n\n'),
    image: p.image,
  };
}

export function PrincipalMessageEditor() {
  const defaults = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.principal];
  const [data, setData] = useState<Form>(() => toForm(defaults));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fallback = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.principal];
    let cancelled = false;
    (async () => {
      try {
        const site = await fetchPublicSiteContent();
        const p = site[SITE_CONTENT_KEYS.principal];
        if (!cancelled && p) setData(toForm({ ...fallback, ...p }));
      } catch {
        /* keep */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const paragraphs = data.message
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const fallbackParagraphs = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.principal].paragraphs;
      await saveSiteContentBlock(SITE_CONTENT_KEYS.principal, {
        heading: data.heading,
        signatureName: data.signatureName,
        signatureTitle: data.signatureTitle,
        image: data.image,
        paragraphs: paragraphs.length ? paragraphs : fallbackParagraphs,
      });
      setMessage('Saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Principal&apos;s message</CardTitle>
          <CardDescription>Use a blank line between paragraphs in the message box.</CardDescription>
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={saving || loading}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        <div>
          <Label htmlFor="principal-heading">Section heading</Label>
          <Input id="principal-heading" value={data.heading} onChange={(e) => setData({ ...data, heading: e.target.value })} />
        </div>

        <div>
          <Label htmlFor="principal-name">Principal name</Label>
          <Input id="principal-name" value={data.signatureName} onChange={(e) => setData({ ...data, signatureName: e.target.value })} />
        </div>

        <div>
          <Label htmlFor="principal-title-line">Title line (under name)</Label>
          <Input
            id="principal-title-line"
            value={data.signatureTitle}
            onChange={(e) => setData({ ...data, signatureTitle: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="principal-message">Message</Label>
          <Textarea
            id="principal-message"
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
            rows={10}
            className="leading-relaxed"
          />
        </div>

        <div>
          <Label htmlFor="principal-image">Photo URL</Label>
          <Input id="principal-image" value={data.image} onChange={(e) => setData({ ...data, image: e.target.value })} />
          <AdminMediaUploadField
            id="principal-photo-upload"
            label="Upload principal photo"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onUploaded={(url) => setData((d) => ({ ...d, image: url }))}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}

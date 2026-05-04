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

type About = ReturnType<typeof getDefaultPublicSiteContent>[typeof SITE_CONTENT_KEYS.about];

export function AboutUsEditor() {
  const initial = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.about];
  const [data, setData] = useState<About>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fallback = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.about];
    let cancelled = false;
    (async () => {
      try {
        const site = await fetchPublicSiteContent();
        const b = site[SITE_CONTENT_KEYS.about];
        if (!cancelled && b) setData({ ...fallback, ...b });
      } catch {
        /* */
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
      await saveSiteContentBlock(SITE_CONTENT_KEYS.about, data);
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
          <CardTitle>About us</CardTitle>
          <CardDescription>Homepage / about snippets (see About page for long layout).</CardDescription>
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
          <Label htmlFor="about-title">Section title</Label>
          <Input id="about-title" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
        </div>

        <div>
          <Label htmlFor="about-content">About content</Label>
          <Textarea id="about-content" value={data.content} onChange={(e) => setData({ ...data, content: e.target.value })} rows={4} />
        </div>

        <div>
          <Label htmlFor="about-mission">Mission</Label>
          <Textarea id="about-mission" value={data.mission} onChange={(e) => setData({ ...data, mission: e.target.value })} rows={3} />
        </div>

        <div>
          <Label htmlFor="about-vision">Vision</Label>
          <Textarea id="about-vision" value={data.vision} onChange={(e) => setData({ ...data, vision: e.target.value })} rows={3} />
        </div>
      </CardContent>
    </Card>
  );
}

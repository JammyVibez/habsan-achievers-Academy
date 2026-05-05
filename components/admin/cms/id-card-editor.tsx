'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { fetchPublicSiteContent, saveSiteContentBlock, SITE_CONTENT_KEYS } from '@/lib/cms-client';
import { getDefaultPublicSiteContent } from '@/lib/site-content-defaults';

type IdCardConfig = ReturnType<typeof getDefaultPublicSiteContent>[typeof SITE_CONTENT_KEYS.idCard];

export function IdCardEditor() {
  const initial = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.idCard];
  const [data, setData] = useState<IdCardConfig>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const site = await fetchPublicSiteContent();
        if (!cancelled && site[SITE_CONTENT_KEYS.idCard]) {
          setData({ ...initial, ...site[SITE_CONTENT_KEYS.idCard] });
        }
      } catch {
        /* no-op */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteContentBlock(SITE_CONTENT_KEYS.idCard, data);
      setMessage('ID card design saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>ID card design settings</CardTitle>
          <CardDescription>Changes here apply to admin, teacher, and student ID card pages.</CardDescription>
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={loading || saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {message ? <p className="text-sm text-muted-foreground md:col-span-2">{message}</p> : null}

        <div className="space-y-2">
          <Label>School name</Label>
          <Input value={data.schoolName} onChange={(e) => setData({ ...data, schoolName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Card title</Label>
          <Input value={data.cardTitle} onChange={(e) => setData({ ...data, cardTitle: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Logo text</Label>
          <Input value={data.logoText} onChange={(e) => setData({ ...data, logoText: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>School phone</Label>
          <Input value={data.schoolPhone} onChange={(e) => setData({ ...data, schoolPhone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>School email</Label>
          <Input value={data.schoolEmail} onChange={(e) => setData({ ...data, schoolEmail: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>School address</Label>
          <Input value={data.schoolAddress} onChange={(e) => setData({ ...data, schoolAddress: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Accent color</Label>
          <Input value={data.accentColor} onChange={(e) => setData({ ...data, accentColor: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Background color</Label>
          <Input value={data.backgroundColor} onChange={(e) => setData({ ...data, backgroundColor: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Text color</Label>
          <Input value={data.textColor} onChange={(e) => setData({ ...data, textColor: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Footer text</Label>
          <Input value={data.footerText} onChange={(e) => setData({ ...data, footerText: e.target.value })} />
        </div>
      </CardContent>
    </Card>
  );
}

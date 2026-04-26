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

type Contact = ReturnType<typeof getDefaultPublicSiteContent>[typeof SITE_CONTENT_KEYS.contact];

export function ContactInfoEditor() {
  const initial = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.contact];
  const [data, setData] = useState<Contact>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fallback = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.contact];
    let cancelled = false;
    (async () => {
      try {
        const site = await fetchPublicSiteContent();
        const c = site[SITE_CONTENT_KEYS.contact];
        if (!cancelled && c) setData({ ...fallback, ...c });
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
      await saveSiteContentBlock(SITE_CONTENT_KEYS.contact, data);
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
          <CardTitle>Contact information</CardTitle>
          <CardDescription>Shown in the site footer and contact sections.</CardDescription>
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
          <Label htmlFor="contact-address">School address</Label>
          <Textarea
            id="contact-address"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="contact-phone">Phone</Label>
          <Input id="contact-phone" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
        </div>

        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="contact-hours">Office hours</Label>
          <Input
            id="contact-hours"
            value={data.office_hours}
            onChange={(e) => setData({ ...data, office_hours: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

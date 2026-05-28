'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { fetchPublicSiteContent, saveSiteContentBlock, SITE_CONTENT_KEYS } from '@/lib/cms-client';
import { getDefaultPublicSiteContent } from '@/lib/site-content-defaults';

export function GeneralSettingsPanel() {
  const defaults = getDefaultPublicSiteContent();
  const [schoolName, setSchoolName] = useState(defaults[SITE_CONTENT_KEYS.about].title);
  const [contact, setContact] = useState(defaults[SITE_CONTENT_KEYS.contact]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const site = await fetchPublicSiteContent();
        if (cancelled) return;
        setSchoolName(site[SITE_CONTENT_KEYS.about].title);
        setContact({ ...defaults[SITE_CONTENT_KEYS.contact], ...site[SITE_CONTENT_KEYS.contact] });
        const idCard = site[SITE_CONTENT_KEYS.idCard];
        if (idCard?.schoolName) setSchoolName(idCard.schoolName);
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [defaults]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteContentBlock(SITE_CONTENT_KEYS.contact, contact);
      await saveSiteContentBlock(SITE_CONTENT_KEYS.about, {
        ...defaults[SITE_CONTENT_KEYS.about],
        title: schoolName.trim(),
      });
      const site = await fetchPublicSiteContent();
      await saveSiteContentBlock(SITE_CONTENT_KEYS.idCard, {
        ...site[SITE_CONTENT_KEYS.idCard],
        schoolName: schoolName.trim(),
        schoolAddress: contact.address,
        schoolPhone: contact.phone,
        schoolEmail: contact.email,
      });
      setMessage('School information saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>School information</CardTitle>
          <CardDescription>Used on the website footer, contact page, and ID cards.</CardDescription>
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={loading || saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        <div className="space-y-2">
          <Label htmlFor="school-name">School name</Label>
          <Input id="school-name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school-email">School email</Label>
          <Input
            id="school-email"
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school-phone">School phone</Label>
          <Input
            id="school-phone"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school-address">School address</Label>
          <Textarea
            id="school-address"
            rows={2}
            value={contact.address}
            onChange={(e) => setContact({ ...contact, address: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="office-hours">Office hours</Label>
          <Input
            id="office-hours"
            value={contact.office_hours}
            onChange={(e) => setContact({ ...contact, office_hours: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

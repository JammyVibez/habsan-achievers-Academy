'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { getDefaultPublicSiteContent } from '@/lib/site-content-defaults';
import { fetchPublicSiteContent, saveSiteContentBlock } from '@/lib/cms-client';

type AdmissionsInfo = ReturnType<typeof getDefaultPublicSiteContent>[typeof SITE_CONTENT_KEYS.admissions];

function toLines(value: string) {
  return value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function AdmissionsInfoEditor() {
  const initial = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.admissions];
  const [data, setData] = useState<AdmissionsInfo>(initial);
  const [feesText, setFeesText] = useState(initial.fees.map((f) => `${f.level}|${f.amount}`).join('\n'));
  const [importantDatesText, setImportantDatesText] = useState(initial.importantDates.join('\n'));
  const [officeText, setOfficeText] = useState(initial.admissionsOffice.join('\n'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fallback = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.admissions];
    let cancelled = false;
    (async () => {
      try {
        const site = await fetchPublicSiteContent();
        const block = site[SITE_CONTENT_KEYS.admissions];
        if (!cancelled && block) {
          const merged = { ...fallback, ...block };
          setData(merged);
          setFeesText(merged.fees.map((f) => `${f.level}|${f.amount}`).join('\n'));
          setImportantDatesText(merged.importantDates.join('\n'));
          setOfficeText(merged.admissionsOffice.join('\n'));
        }
      } catch {
        // keep defaults
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
      const fees = toLines(feesText).map((line) => {
        const [level, amount] = line.split('|').map((s) => s.trim());
        return { level: level || '', amount: amount || '' };
      }).filter((f) => f.level && f.amount);
      const payload: AdmissionsInfo = {
        fees,
        feesNote: data.feesNote,
        importantDates: toLines(importantDatesText),
        admissionsOffice: toLines(officeText),
      };
      await saveSiteContentBlock(SITE_CONTENT_KEYS.admissions, payload);
      setData(payload);
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
          <CardTitle>Admissions page info</CardTitle>
          <CardDescription>Edit fees, important dates, and admissions office contact block.</CardDescription>
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
          <Label htmlFor="admission-fees">Fees structure (one per line: Level|Amount)</Label>
          <Textarea
            id="admission-fees"
            rows={6}
            value={feesText}
            onChange={(e) => setFeesText(e.target.value)}
            placeholder="JSS 1 - JSS 3|₦250,000"
          />
        </div>

        <div>
          <Label htmlFor="admission-fees-note">Fees note</Label>
          <Textarea
            id="admission-fees-note"
            rows={2}
            value={data.feesNote}
            onChange={(e) => setData({ ...data, feesNote: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="admission-important-dates">Important dates (one per line)</Label>
          <Textarea
            id="admission-important-dates"
            rows={5}
            value={importantDatesText}
            onChange={(e) => setImportantDatesText(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="admission-office">Admissions office contact (one per line)</Label>
          <Textarea
            id="admission-office"
            rows={5}
            value={officeText}
            onChange={(e) => setOfficeText(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

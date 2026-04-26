'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import type { CoreValueItem } from '@/lib/site-content-defaults';
import { getDefaultPublicSiteContent } from '@/lib/site-content-defaults';
import { fetchPublicSiteContent, saveSiteContentBlock } from '@/lib/cms-client';

type Block = { sectionTitle: string; items: CoreValueItem[] };

export function CoreValuesEditor() {
  const fallback = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.coreValues];
  const [data, setData] = useState<Block>(fallback);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const site = await fetchPublicSiteContent();
        const cv = site[SITE_CONTENT_KEYS.coreValues];
        if (!cancelled && cv?.items?.length) setData(cv);
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

  function updateItem(index: number, field: keyof CoreValueItem, value: string) {
    setData((d) => {
      const items = [...d.items];
      items[index] = { ...items[index], [field]: value };
      return { ...d, items };
    });
  }

  function addItem() {
    setData((d) => ({
      ...d,
      items: [...d.items, { title: '', description: '' }],
    }));
  }

  function removeItem(index: number) {
    setData((d) => ({
      ...d,
      items: d.items.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    const cleaned = data.items.map((x) => ({
      title: x.title.trim(),
      description: x.description.trim(),
    })).filter((x) => x.title || x.description);
    if (cleaned.length === 0) {
      setMessage('Add at least one value with a title or description.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteContentBlock(SITE_CONTENT_KEYS.coreValues, {
        sectionTitle: data.sectionTitle.trim() || fallback.sectionTitle,
        items: cleaned,
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
          <CardTitle>Core values (About page)</CardTitle>
          <CardDescription>Shown in the four-column block on the About page.</CardDescription>
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={saving || loading}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        <div className="space-y-2">
          <Label htmlFor="cv-section-title">Section title</Label>
          <Input
            id="cv-section-title"
            value={data.sectionTitle}
            onChange={(e) => setData((d) => ({ ...d, sectionTitle: e.target.value }))}
          />
        </div>

        {data.items.map((item, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Value {index + 1}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={data.items.length <= 1}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={item.title} onChange={(e) => updateItem(index, 'title', e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} rows={2} />
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addItem} disabled={data.items.length >= 8}>
          <Plus className="mr-2 h-4 w-4" />
          Add value
        </Button>
      </CardContent>
    </Card>
  );
}

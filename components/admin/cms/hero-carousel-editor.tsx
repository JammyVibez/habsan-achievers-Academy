'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { getDefaultPublicSiteContent, type HeroSlide } from '@/lib/site-content-defaults';
import { fetchPublicSiteContent, saveSiteContentBlock } from '@/lib/cms-client';
import { AdminMediaUploadField } from '@/components/admin/admin-media-upload-field';

export function HeroCarouselEditor() {
  const [slides, setSlides] = useState<HeroSlide[]>(getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.hero].slides);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicSiteContent();
        const next = data[SITE_CONTENT_KEYS.hero]?.slides;
        if (!cancelled && Array.isArray(next) && next.length) setSlides(next);
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addSlide = () => {
    setSlides([...slides, { title: '', subtitle: '', image: '' }]);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    const next = [...slides];
    next[index] = { ...next[index], [field]: value };
    setSlides(next);
  };

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteContentBlock(SITE_CONTENT_KEYS.hero, { slides });
      setMessage('Saved. Homepage will update shortly.');
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
          <CardTitle>Hero Carousel Slides</CardTitle>
          <CardDescription>Image URLs can be paths under /public (e.g. /photo.jpg) or full URLs.</CardDescription>
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={saving || loading}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save hero
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading current content…</p>
        ) : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        {slides.map((slide, index) => (
          <div key={index} className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 cursor-move text-muted-foreground" />
                <h4 className="font-semibold">Slide {index + 1}</h4>
              </div>
              <Button variant="ghost" size="icon" type="button" onClick={() => removeSlide(index)} disabled={slides.length === 1}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor={`title-${index}`}>Title</Label>
                <Input
                  id={`title-${index}`}
                  value={slide.title}
                  onChange={(e) => updateSlide(index, 'title', e.target.value)}
                  placeholder="Enter slide title"
                />
              </div>

              <div>
                <Label htmlFor={`subtitle-${index}`}>Subtitle</Label>
                <Textarea
                  id={`subtitle-${index}`}
                  value={slide.subtitle}
                  onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                  placeholder="Enter slide subtitle"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor={`image-${index}`}>Slide image URL</Label>
                <Input
                  id={`image-${index}`}
                  value={slide.image}
                  onChange={(e) => updateSlide(index, 'image', e.target.value)}
                  placeholder="/your-image.jpg or https://..."
                />
                <AdminMediaUploadField
                  id={`slide-upload-${index}`}
                  label="Upload image"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onUploaded={(url) => updateSlide(index, 'image', url)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        ))}

        <Button type="button" onClick={addSlide} variant="outline" className="w-full bg-transparent">
          <Plus className="mr-2 h-4 w-4" />
          Add slide
        </Button>
      </CardContent>
    </Card>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { GalleryFilters } from '@/components/gallery/gallery-filters';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import type { GalleryItemDTO } from '@/components/gallery/gallery-media';

export function GalleryPublic() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [items, setItems] = useState<GalleryItemDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = new URLSearchParams();
        if (activeCategory !== 'all') q.set('category', activeCategory);
        const res = await fetch(`/api/public/gallery?${q.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load gallery');
        const data = (await res.json()) as { items: GalleryItemDTO[] };
        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setItems([]);
          setError(e instanceof Error ? e.message : 'Could not load gallery');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  return (
    <>
      <GalleryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {items.length === 0 && !error ? (
        <p className="text-muted-foreground">No gallery items yet. Add some in Admin → CMS → Gallery.</p>
      ) : (
        <GalleryGrid items={items} />
      )}
    </>
  );
}

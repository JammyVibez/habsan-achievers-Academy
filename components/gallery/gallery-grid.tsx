'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { GalleryMedia, type GalleryItemDTO } from '@/components/gallery/gallery-media';

export function GalleryGrid({ items }: { items: GalleryItemDTO[] }) {
  const [selected, setSelected] = useState<GalleryItemDTO | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg bg-muted text-left"
            onClick={() => setSelected(item)}
          >
            {item.type === 'video' ? (
              <div className="relative h-full w-full">
                <img
                  src={item.thumbnailUrl || item.mediaUrl || '/placeholder.svg'}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-sm font-medium text-white">
                  Video — tap to play
                </div>
              </div>
            ) : (
              <img
                src={item.mediaUrl || '/placeholder.svg'}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-sm font-medium text-white">{item.title}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selected && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="max-h-[80vh] overflow-auto bg-black">
                <GalleryMedia item={selected} className="max-h-[75vh] w-full object-contain" />
              </div>
              <div className="bg-background p-4">
                <p className="font-medium">{selected.title}</p>
                {selected.caption ? <p className="mt-1 text-sm text-muted-foreground">{selected.caption}</p> : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

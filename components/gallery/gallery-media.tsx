'use client';

function youtubeEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.pathname.startsWith('/embed/')) return raw.trim();
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

export type GalleryItemDTO = {
  id: string;
  type: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  caption?: string | null;
  category: string;
  sortOrder?: number;
  isActive?: boolean;
};

export function GalleryMedia({ item, className }: { item: GalleryItemDTO; className?: string }) {
  const url = item.mediaUrl?.trim() || '';
  if (!url) {
    return <div className={className} />;
  }

  if (item.type === 'video') {
    const yt = youtubeEmbedUrl(url);
    if (yt) {
      return (
        <iframe
          title={item.title}
          src={yt}
          className={className ?? 'h-full w-full'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    if (/\.(mp4|webm)(\?|$)/i.test(url)) {
      return <video src={url} className={className ?? 'h-full w-full object-cover'} controls playsInline />;
    }
    return (
      <iframe title={item.title} src={url} className={className ?? 'h-full w-full'} allowFullScreen />
    );
  }

  return <img src={url} alt={item.title} className={className ?? 'h-full w-full object-cover'} />;
}

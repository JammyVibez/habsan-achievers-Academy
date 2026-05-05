'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Share2 } from 'lucide-react';

type IdCardDesign = {
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  cardTitle: string;
  logoText: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  footerText: string;
};

type UserCardProps = {
  design: IdCardDesign;
  fullName: string;
  roleLabel: string;
  identifier: string;
  email: string;
  yearOfEntry: string;
  extraLine?: string;
};

export function UserIdCard({
  design,
  fullName,
  roleLabel,
  identifier,
  email,
  yearOfEntry,
  extraLine,
}: UserCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function toBlob() {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: design.backgroundColor || '#ffffff',
      scale: 2,
      useCORS: true,
    });
    return new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
  }

  function makeFileName() {
    const safeName = fullName.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
    return `${safeName || 'id-card'}-${roleLabel.toLowerCase()}-id-card.png`;
  }

  async function downloadCard() {
    setBusy(true);
    try {
      const blob = await toBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = makeFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  async function shareCard() {
    setBusy(true);
    try {
      const blob = await toBlob();
      if (!blob) return;
      const file = new File([blob], makeFileName(), { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (data: { files?: File[] }) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          title: `${design.schoolName} ID Card`,
          text: `${fullName} (${roleLabel})`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = makeFileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className="w-full max-w-xl rounded-2xl border p-6 shadow-sm"
        style={{ backgroundColor: design.backgroundColor, color: design.textColor, borderColor: `${design.accentColor}33` }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold"
              style={{ backgroundColor: design.accentColor, color: '#ffffff' }}
            >
              {design.logoText}
            </div>
            <div>
              <p className="text-sm font-semibold">{design.schoolName}</p>
              <p className="text-xs opacity-80">{design.cardTitle}</p>
            </div>
          </div>
          <Badge variant="outline" className="capitalize" style={{ borderColor: `${design.accentColor}99` }}>
            {roleLabel}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-xl font-bold">{fullName}</p>
          <p className="text-sm opacity-80">{email}</p>
        </div>

        <div className="mt-5 grid gap-3 rounded-lg border p-3 text-sm" style={{ borderColor: `${design.accentColor}55` }}>
          <p>
            <span className="font-semibold">ID / Number:</span> {identifier}
          </p>
          <p>
            <span className="font-semibold">Year of Entry:</span> {yearOfEntry}
          </p>
          {extraLine ? (
            <p>
              <span className="font-semibold">Details:</span> {extraLine}
            </p>
          ) : null}
        </div>

        <div className="mt-5 border-t pt-3 text-xs opacity-80" style={{ borderColor: `${design.accentColor}55` }}>
          <p>{design.schoolAddress}</p>
          <p>
            {design.schoolPhone} · {design.schoolEmail}
          </p>
          <p className="mt-1">{design.footerText}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => void downloadCard()} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Download
        </Button>
        <Button type="button" onClick={() => void shareCard()} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
          Share
        </Button>
      </div>
    </div>
  );
}

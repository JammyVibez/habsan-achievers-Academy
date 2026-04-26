'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import { getDefaultPublicSiteContent } from '@/lib/site-content-defaults';

type PrincipalPayload = ReturnType<typeof getDefaultPublicSiteContent>[typeof SITE_CONTENT_KEYS.principal];

export function PrincipalMessageSection() {
  const [data, setData] = useState<PrincipalPayload>(getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.principal]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/public/site-content', { cache: 'no-store' });
        if (!res.ok) return;
        const json = (await res.json()) as Record<string, unknown>;
        const block = json[SITE_CONTENT_KEYS.principal] as PrincipalPayload | undefined;
        if (!cancelled && block && typeof block === 'object') {
          setData({ ...getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.principal], ...block });
        }
      } catch {
        /* defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <img src={data.image || '/placeholder.svg'} alt="Principal" className="w-full rounded-lg shadow-lg" />
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Quote className="h-8 w-8 text-primary" />
              <h2 className="font-heading text-3xl font-bold md:text-4xl">{data.heading}</h2>
            </div>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                {data.paragraphs.map((p, i) => (
                  <p key={i} className="mb-4 leading-relaxed text-muted-foreground last:mb-6">
                    {p}
                  </p>
                ))}
                <div>
                  <p className="font-heading text-lg font-semibold">{data.signatureName}</p>
                  <p className="text-sm text-muted-foreground">{data.signatureTitle}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

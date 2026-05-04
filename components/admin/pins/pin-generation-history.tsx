'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

type Batch = { at: string; pinType: 'admission' | 'result'; count: number };

export function PINGenerationHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/pins/history?limit=30', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load history');
      setBatches(Array.isArray(data.batches) ? data.batches : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    const id = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Admin generation history</CardTitle>
            <CardDescription>
              PINs created in the admin panel (not from the PIN shop), grouped by minute — matches database records.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {loading && batches.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : batches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No admin bulk generations yet.</p>
        ) : (
          <ul className="space-y-3">
            {batches.map((b, i) => (
              <li
                key={`${b.at}-${b.pinType}-${i}`}
                className="flex flex-col justify-between gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">
                    {b.count} {b.pinType === 'admission' ? 'admission' : 'result'} PIN{b.count === 1 ? '' : 's'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(b.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} (UTC minute
                    bucket)
                  </p>
                </div>
                <Badge variant="secondary" className="w-fit capitalize">
                  {b.pinType}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

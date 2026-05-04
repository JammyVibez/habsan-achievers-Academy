'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Copy, Loader2, RefreshCw } from 'lucide-react';

type PinRow = {
  id: string;
  pinCode: string;
  pinType: string;
  status: string;
  effectiveStatus: 'active' | 'used' | 'expired';
  expiresAt: string;
  createdAt: string;
  usedAt: string | null;
  studentEmail: string | null;
  source: 'admin' | 'shop';
};

interface PINListProps {
  type: 'admission' | 'result';
  refreshKey?: number;
}

export function PINList({ type, refreshKey = 0 }: PINListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [pins, setPins] = useState<PinRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(searchQuery.trim()), 350);
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ type, limit: '80', offset: '0' });
      if (debounced) q.set('search', debounced);
      const res = await fetch(`/api/admin/pins?${q}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load PINs');
      setPins(Array.isArray(data.pins) ? data.pins : []);
      setTotal(typeof data.total === 'number' ? data.total : 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setPins([]);
    } finally {
      setLoading(false);
    }
  }, [type, debounced]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    const id = window.setInterval(() => void load(), 25_000);
    return () => window.clearInterval(id);
  }, [load]);

  function statusBadge(effective: PinRow['effectiveStatus']) {
    switch (effective) {
      case 'active':
        return <Badge className="bg-green-600 hover:bg-green-600">Active</Badge>;
      case 'used':
        return <Badge className="bg-blue-600 hover:bg-blue-600">Used</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{effective}</Badge>;
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  }

  async function copyPin(code: string) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* ignore */
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{type === 'admission' ? 'Admission' : 'Result'} PINs</CardTitle>
            <CardDescription>
              Live from database — same PINs used by PIN shop, validation, admission, and result check (
              {total.toLocaleString()} total)
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by PIN code…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {loading && pins.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading PINs…
          </div>
        ) : pins.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No PINs match this filter.</p>
        ) : (
          <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
            {pins.map((pin) => (
              <div key={pin.id} className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold tracking-tight">{pin.pinCode}</span>
                    {statusBadge(pin.effectiveStatus)}
                    <Badge variant="outline" className="text-xs capitalize">
                      {pin.source}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground sm:text-sm">
                    Created {formatDate(pin.createdAt)} · Expires {formatDate(pin.expiresAt)}
                    {pin.usedAt ? (
                      <>
                        <br />
                        Used {formatDate(pin.usedAt)}
                        {pin.studentEmail ? ` · ${pin.studentEmail}` : ''}
                      </>
                    ) : null}
                    {!pin.usedAt && pin.studentEmail ? (
                      <>
                        <br />
                        Email on record: {pin.studentEmail}
                      </>
                    ) : null}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => void copyPin(pin.pinCode)} aria-label="Copy PIN">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

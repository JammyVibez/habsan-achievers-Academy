'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

type StatsPayload = {
  total: number;
  activeUsable: number;
  used: number;
  expired: number;
  byType: { admission: number; result: number };
  todayAdminGenerated: { admission: number; result: number };
  dailyLimitPerType: number;
  remainingToday: { admission: number; result: number };
  serverTime: string;
};

export function PINStats({ refreshKey = 0 }: { refreshKey?: number }) {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pins/stats', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load stats');
      setStats(data as StatsPayload);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    const id = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(id);
  }, [load]);

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading…</CardTitle>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl font-bold text-muted-foreground">—</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !stats) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: 'Total issued PINs',
      value: stats.total.toLocaleString(),
      icon: Key,
      description: `Admission ${stats.byType.admission.toLocaleString()} · Result ${stats.byType.result.toLocaleString()}`,
    },
    {
      title: 'Active (usable)',
      value: stats.activeUsable.toLocaleString(),
      icon: Clock,
      description: 'Active status and not past expiry — matches check / apply logic',
    },
    {
      title: 'Used',
      value: stats.used.toLocaleString(),
      icon: CheckCircle,
      description: 'Consumed (e.g. admission applied)',
    },
    {
      title: 'Expired / unusable',
      value: stats.expired.toLocaleString(),
      icon: XCircle,
      description: 'Marked expired or past expiry date',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-heading mb-1 text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Admin bulk today (UTC): admission {stats.todayAdminGenerated.admission}/{stats.dailyLimitPerType} · result{' '}
        {stats.todayAdminGenerated.result}/{stats.dailyLimitPerType} · Refreshes every 20s
        {error ? ` · Last error: ${error}` : ''}
      </p>
    </div>
  );
}

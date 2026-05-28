'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save } from 'lucide-react';

type SessionRow = {
  id: string;
  sessionName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms: Array<{
    id: string;
    termName: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }>;
};

export function AcademicSettingsPanel() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');

  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionStart, setNewSessionStart] = useState('');
  const [newSessionEnd, setNewSessionEnd] = useState('');

  const [newTermName, setNewTermName] = useState('First Term');
  const [newTermStart, setNewTermStart] = useState('');
  const [newTermEnd, setNewTermEnd] = useState('');

  const applySessions = useCallback((rows: SessionRow[]) => {
    setSessions(rows);
    const currentSession = rows.find((s) => s.isCurrent) ?? rows[0];
    const currentTerm = currentSession?.terms.find((t) => t.isCurrent) ?? currentSession?.terms[0];
    if (currentSession) setSessionId(currentSession.id);
    if (currentTerm) setTermId(currentTerm.id);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/academic', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load academic settings');
      applySessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [applySessions]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedSession = sessions.find((s) => s.id === sessionId);
  const terms = selectedSession?.terms ?? [];

  async function saveCurrent() {
    if (!sessionId || !termId) {
      setError('Select both a session and a term.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/academic', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, termId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      applySessions(data.sessions ?? []);
      setMessage('Current session and term updated. Result upload will use these.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function initializeDefault() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/academic', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize');
      applySessions(data.sessions ?? []);
      setMessage('Default academic session and term created and set as current.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize');
    } finally {
      setSaving(false);
    }
  }

  async function createSession() {
    if (!newSessionName.trim() || !newSessionStart || !newSessionEnd) {
      setError('Session name and dates are required.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/academic', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createSession',
          sessionName: newSessionName.trim(),
          startDate: newSessionStart,
          endDate: newSessionEnd,
          setCurrent: sessions.length === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create session');
      applySessions(data.sessions ?? []);
      setMessage('Academic session created.');
      setNewSessionName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create session');
    } finally {
      setSaving(false);
    }
  }

  async function createTerm() {
    if (!sessionId || !newTermName.trim() || !newTermStart || !newTermEnd) {
      setError('Pick a session and fill term name and dates.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/academic', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createTerm',
          sessionId,
          termName: newTermName.trim(),
          startDate: newTermStart,
          endDate: newTermEnd,
          setCurrent: terms.length === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create term');
      applySessions(data.sessions ?? []);
      setMessage('Term created.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create term');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic session &amp; term</CardTitle>
        <CardDescription>
          Result upload, teacher dashboards, and result checks use the <strong>current</strong> session and term
          configured here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading academic calendar…
          </div>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {message ? (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        {sessions.length === 0 && !loading ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No academic session exists yet. Initialize a default calendar or create one below.
            </p>
            <Button type="button" onClick={() => void initializeDefault()} disabled={saving}>
              Initialize default session &amp; term
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Current academic session</Label>
                <Select
                  value={sessionId}
                  onValueChange={(value) => {
                    setSessionId(value);
                    const s = sessions.find((row) => row.id === value);
                    const firstTerm = s?.terms[0];
                    setTermId(firstTerm?.id ?? '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.sessionName}
                        {s.isCurrent ? ' (current)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Current term</Label>
                <Select value={termId} onValueChange={setTermId} disabled={terms.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.termName}
                        {t.isCurrent ? ' (current)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="button" onClick={() => void saveCurrent()} disabled={saving || !sessionId || !termId}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Set as current session &amp; term
            </Button>
          </>
        )}

        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Add academic session</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="e.g. 2025/2026"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
            />
            <Input type="date" value={newSessionStart} onChange={(e) => setNewSessionStart(e.target.value)} />
            <Input type="date" value={newSessionEnd} onChange={(e) => setNewSessionEnd(e.target.value)} />
          </div>
          <Button type="button" variant="outline" onClick={() => void createSession()} disabled={saving}>
            Add session
          </Button>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Add term to selected session</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input value={newTermName} onChange={(e) => setNewTermName(e.target.value)} placeholder="Term name" />
            <Input type="date" value={newTermStart} onChange={(e) => setNewTermStart(e.target.value)} />
            <Input type="date" value={newTermEnd} onChange={(e) => setNewTermEnd(e.target.value)} />
          </div>
          <Button type="button" variant="outline" onClick={() => void createTerm()} disabled={saving || !sessionId}>
            Add term
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

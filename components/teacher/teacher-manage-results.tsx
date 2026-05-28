'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ManageResultsTable, type ManageResultRow } from '@/components/results/manage-results-table';
import { SessionTermPicker } from '@/components/academic/session-term-picker';
import type { AcademicSessionOption } from '@/lib/academic-calendar-types';

export function TeacherManageResults() {
  const [sessions, setSessions] = useState<AcademicSessionOption[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [rows, setRows] = useState<ManageResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    if (!sessionId || !termId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ sessionId, termId });
      const res = await fetch(`/api/teacher/results/list?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setRows([]);
        return;
      }
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } finally {
      setLoading(false);
    }
  }, [sessionId, termId]);

  useEffect(() => {
    async function loadSessions() {
      const res = await fetch('/api/teacher/results/list', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) return;
      const sessionRows = Array.isArray(data.sessions) ? data.sessions : [];
      setSessions(sessionRows);
      if (data.current?.sessionId) setSessionId(data.current.sessionId);
      if (data.current?.termId) setTermId(data.current.termId);
      else if (sessionRows[0]) {
        setSessionId(sessionRows[0].id);
        setTermId(sessionRows[0].terms[0]?.id ?? '');
      }
    }
    void loadSessions();
  }, []);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage uploaded results</CardTitle>
        <CardDescription>
          Edit or delete results you uploaded or for your assigned classes. Pick session and term first.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SessionTermPicker
          sessions={sessions}
          sessionId={sessionId}
          termId={termId}
          onSessionChange={setSessionId}
          onTermChange={setTermId}
        />
        <ManageResultsTable loading={loading} rows={rows} onRefresh={() => setReloadKey((k) => k + 1)} />
      </CardContent>
    </Card>
  );
}

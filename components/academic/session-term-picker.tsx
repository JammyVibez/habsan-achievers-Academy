'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AcademicSessionOption } from '@/lib/academic-calendar-types';

type Props = {
  sessions: AcademicSessionOption[];
  sessionId: string;
  termId: string;
  onSessionChange: (sessionId: string) => void;
  onTermChange: (termId: string) => void;
  disabled?: boolean;
  required?: boolean;
};

export function SessionTermPicker({
  sessions,
  sessionId,
  termId,
  onSessionChange,
  onTermChange,
  disabled = false,
  required = true,
}: Props) {
  const selectedSession = sessions.find((s) => s.id === sessionId);
  const terms = selectedSession?.terms ?? [];

  if (sessions.length === 0) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        No academic session or term exists yet. An admin must add them under{' '}
        <strong>Admin → Settings → Academic</strong> (this does not delete your students).
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>
          Academic session{required ? ' *' : ''}
        </Label>
        <Select
          value={sessionId}
          onValueChange={(value) => {
            onSessionChange(value);
            const firstTerm = sessions.find((s) => s.id === value)?.terms[0];
            onTermChange(firstTerm?.id ?? '');
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.sessionName}
                {session.isCurrent ? ' (current)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          Term{required ? ' *' : ''}
        </Label>
        <Select value={termId} onValueChange={onTermChange} disabled={disabled || terms.length === 0}>
          <SelectTrigger>
            <SelectValue placeholder="Select term" />
          </SelectTrigger>
          <SelectContent>
            {terms.map((term) => (
              <SelectItem key={term.id} value={term.id}>
                {term.termName}
                {term.isCurrent ? ' (current)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { KeyRound, Copy, Check } from 'lucide-react';
import { generateDefaultPassword } from '@/lib/student-utils';

export type AdminUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

function formatJoined(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [target, setTarget] = useState<AdminUserRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [forceChange, setForceChange] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultPassword, setResultPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function openReset(u: AdminUserRow) {
    setTarget(u);
    setNewPassword('');
    setForceChange(true);
    setError(null);
    setResultPassword(null);
    setCopied(false);
    setDialogOpen(true);
  }

  function closeDialog(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setTarget(null);
      setNewPassword('');
      setResultPassword(null);
      setError(null);
      setCopied(false);
    }
  }

  async function handleSubmit() {
    if (!target) return;
    const trimmed = newPassword.trim();
    if (trimmed.length > 0 && trimmed.length < 8) {
      setError('Password must be at least 8 characters, or leave empty to auto-generate.');
      return;
    }
    setLoading(true);
    setError(null);
    setResultPassword(null);
    setCopied(false);
    try {
      const body: { userId: string; newPassword?: string; forceChangeOnLogin: boolean } = {
        userId: target.id,
        forceChangeOnLogin: forceChange,
      };
      if (trimmed.length > 0) body.newPassword = trimmed;

      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; newPassword?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      if (!data.newPassword) throw new Error('No password returned');
      setResultPassword(data.newPassword);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function copyPassword() {
    if (!resultPassword) return;
    try {
      await navigator.clipboard.writeText(resultPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard');
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No users yet.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const name = `${user.firstName} ${user.lastName}`.trim();
              const statusLabel = user.isActive ? 'active' : 'inactive';
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'admin' ? 'default' : user.role === 'teacher' ? 'secondary' : 'outline'}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>{statusLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatJoined(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => openReset(user)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Set password
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set new password</DialogTitle>
            <DialogDescription>
              {target ? (
                <>
                  For <span className="font-medium text-foreground">{target.email}</span>. The new password is shown
                  once after you confirm.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          {resultPassword ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Share this with the user, then store it securely or discard.</p>
              <div className="flex gap-2">
                <Input readOnly className="font-mono text-sm" value={resultPassword} />
                <Button type="button" variant="outline" size="icon" onClick={() => void copyPassword()} aria-label="Copy password">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <DialogFooter>
                <Button type="button" onClick={() => closeDialog(false)}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setNewPassword(generateDefaultPassword())}
                      disabled={loading}
                    >
                      Generate
                    </Button>
                  </div>
                  <Input
                    id="new-password"
                    type="text"
                    autoComplete="new-password"
                    placeholder="Leave empty to auto-generate on save"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 characters if you type your own.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="force-change"
                    checked={forceChange}
                    onCheckedChange={(v) => setForceChange(v === true)}
                    disabled={loading}
                  />
                  <Label htmlFor="force-change" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Require password change on next login
                  </Label>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => closeDialog(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void handleSubmit()} disabled={loading}>
                  {loading ? 'Saving…' : 'Save password'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

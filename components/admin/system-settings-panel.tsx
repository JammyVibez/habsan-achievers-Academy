'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { fetchPublicSiteContent, saveSiteContentBlock, SITE_CONTENT_KEYS } from '@/lib/cms-client';
import { getDefaultPublicSiteContent } from '@/lib/site-content-defaults';

type SystemSettings = ReturnType<typeof getDefaultPublicSiteContent>[typeof SITE_CONTENT_KEYS.systemSettings];

export function SystemSettingsPanel({
  variant,
}: {
  variant: 'notifications' | 'security';
}) {
  const defaults = getDefaultPublicSiteContent()[SITE_CONTENT_KEYS.systemSettings];
  const [data, setData] = useState<SystemSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const site = await fetchPublicSiteContent();
        if (!cancelled) {
          setData({ ...defaults, ...site[SITE_CONTENT_KEYS.systemSettings] });
        }
      } catch {
        /* */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [defaults]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await saveSiteContentBlock(SITE_CONTENT_KEYS.systemSettings, data);
      setMessage('Settings saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const title = variant === 'notifications' ? 'Notification settings' : 'Security settings';
  const description =
    variant === 'notifications'
      ? 'Saved preferences for future notification features.'
      : 'Session and security preferences for the admin portal.';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={loading || saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        {variant === 'notifications' ? (
          <>
            <ToggleRow
              label="Email notifications"
              description="Send email notifications to users"
              checked={data.emailNotifications}
              onCheckedChange={(v) => setData({ ...data, emailNotifications: v })}
            />
            <ToggleRow
              label="SMS notifications"
              description="Send SMS notifications to parents"
              checked={data.smsNotifications}
              onCheckedChange={(v) => setData({ ...data, smsNotifications: v })}
            />
            <ToggleRow
              label="Result notifications"
              description="Notify when results are published"
              checked={data.resultNotifications}
              onCheckedChange={(v) => setData({ ...data, resultNotifications: v })}
            />
            <ToggleRow
              label="Admission notifications"
              description="Notify on new admission applications"
              checked={data.admissionNotifications}
              onCheckedChange={(v) => setData({ ...data, admissionNotifications: v })}
            />
          </>
        ) : (
          <>
            <ToggleRow
              label="Two-factor authentication"
              description="Require 2FA for admin accounts (when enabled in auth)"
              checked={data.twoFactorAuth}
              onCheckedChange={(v) => setData({ ...data, twoFactorAuth: v })}
            />
            <ToggleRow
              label="Session timeout"
              description="Auto logout after inactivity"
              checked={data.sessionTimeout}
              onCheckedChange={(v) => setData({ ...data, sessionTimeout: v })}
            />
            <div className="space-y-2">
              <Label htmlFor="session-duration">Session duration (minutes)</Label>
              <Input
                id="session-duration"
                type="number"
                min={5}
                max={480}
                value={data.sessionDurationMinutes}
                onChange={(e) =>
                  setData({ ...data, sessionDurationMinutes: Math.max(5, parseInt(e.target.value, 10) || 30) })
                }
              />
            </div>
            <ToggleRow
              label="Audit logging"
              description="Log admin actions (when logging is enabled)"
              checked={data.auditLogging}
              onCheckedChange={(v) => setData({ ...data, auditLogging: v })}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

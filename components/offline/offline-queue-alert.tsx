'use client';

import { CloudUpload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfflineQueue } from '@/hooks/use-offline-queue';

export function OfflineQueueAlert() {
  const { pendingCount, items } = useOfflineQueue();

  if (pendingCount === 0) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <CloudUpload className="h-4 w-4 text-amber-700" />
      <AlertDescription className="text-amber-900">
        <strong>{pendingCount}</strong> submission{pendingCount === 1 ? '' : 's'} saved offline
        {items.length > 0 ? `: ${items.map((i) => i.label).join(', ')}` : ''}. They will upload
        automatically when your connection returns.
      </AlertDescription>
    </Alert>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  flushOfflineQueue,
  getQueuedCount,
  getQueuedSubmissions,
  subscribeOfflineQueue,
  type QueuedSubmission,
} from '@/lib/offline-submit';

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [items, setItems] = useState<QueuedSubmission[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [count, rows] = await Promise.all([getQueuedCount(), getQueuedSubmissions()]);
    setPendingCount(count);
    setItems(rows);
  }, []);

  const syncNow = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
    setIsSyncing(true);
    setLastSyncMessage(null);
    try {
      const result = await flushOfflineQueue();
      await refresh();
      if (result.synced > 0) {
        setLastSyncMessage(
          result.synced === 1
            ? '1 saved item synced successfully'
            : `${result.synced} saved items synced successfully`,
        );
      } else if (result.failed > 0) {
        setLastSyncMessage(`${result.failed} item(s) still waiting to sync`);
      } else if (result.dropped > 0 && result.errors[0]) {
        setLastSyncMessage(result.errors[0]);
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
    return subscribeOfflineQueue(() => {
      void refresh();
    });
  }, [refresh]);

  return {
    pendingCount,
    items,
    isSyncing,
    lastSyncMessage,
    refresh,
    syncNow,
  };
}

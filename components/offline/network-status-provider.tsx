'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wifi, WifiOff, RefreshCw, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineQueue } from '@/hooks/use-offline-queue';

type NetworkStatusContextValue = {
  isOffline: boolean;
  wasOffline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<unknown>;
};

const NetworkStatusContext = createContext<NetworkStatusContextValue>({
  isOffline: false,
  wasOffline: false,
  pendingCount: 0,
  isSyncing: false,
  syncNow: async () => null,
});

export function useNetworkStatus() {
  return useContext(NetworkStatusContext);
}

function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      registration.addEventListener('updatefound', () => {
        const next = registration.installing;
        if (!next) return;
        next.addEventListener('statechange', () => {
          if (next.state === 'installed' && navigator.serviceWorker.controller) {
            next.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    })
    .catch(() => {
      // Service worker optional — offline banner still works
    });
}

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { pendingCount, isSyncing, syncNow, lastSyncMessage } = useOfflineQueue();
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncingRef = useRef(false);

  const runSync = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setSyncStatus('Syncing saved submissions…');
    try {
      const result = await syncNow();
      if (result && result.synced > 0) {
        setSyncStatus(
          result.synced === 1
            ? '1 offline submission synced'
            : `${result.synced} offline submissions synced`,
        );
        router.refresh();
      } else if (result && result.failed > 0) {
        setSyncStatus(`${result.failed} submission(s) still waiting to sync`);
      } else {
        setSyncStatus(null);
      }
    } finally {
      syncingRef.current = false;
    }
  }, [router, syncNow]);

  const handleOnline = useCallback(() => {
    setIsOffline(false);
    setShowReconnected(true);

    void runSync();

    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      router.refresh();
      setShowReconnected(false);
      setWasOffline(false);
      setSyncStatus(null);
    }, 2500);
  }, [router, runSync]);

  const handleOffline = useCallback(() => {
    setIsOffline(true);
    setWasOffline(true);
    setShowReconnected(false);
    setSyncStatus(null);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    if (!navigator.onLine) setWasOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [handleOnline, handleOffline]);

  useEffect(() => {
    if (navigator.onLine && pendingCount > 0) {
      void runSync();
    }
  }, [pendingCount, runSync]);

  useEffect(() => {
    if (lastSyncMessage) setSyncStatus(lastSyncMessage);
  }, [lastSyncMessage]);

  function handleManualRefresh() {
    void runSync();
    router.refresh();
    setShowReconnected(false);
    setWasOffline(false);
    setSyncStatus(null);
  }

  const statusLine =
    syncStatus ??
    (isSyncing
      ? 'Syncing saved submissions…'
      : pendingCount > 0
        ? `${pendingCount} submission${pendingCount === 1 ? '' : 's'} waiting to sync`
        : null);

  const showSyncBar =
    !isOffline && (showReconnected || isSyncing || pendingCount > 0 || Boolean(syncStatus));

  return (
    <NetworkStatusContext.Provider
      value={{ isOffline, wasOffline, pendingCount, isSyncing, syncNow: runSync }}
    >
      {isOffline ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white px-4 py-2.5 shadow-md"
        >
          <div className="container flex flex-col items-center justify-center gap-1 text-sm font-medium sm:flex-row sm:gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>You&apos;re offline — browsing cached pages still works</span>
            </div>
            {pendingCount > 0 ? (
              <span className="flex items-center gap-1 text-amber-100">
                <CloudUpload className="h-3.5 w-3.5" />
                {pendingCount} saved — will auto-upload when online
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {showSyncBar ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-[100] bg-green-600 text-white px-4 py-2.5 shadow-md"
          style={isOffline ? { top: '2.5rem' } : undefined}
        >
          <div className="container flex flex-col items-center justify-center gap-2 text-sm font-medium sm:flex-row sm:gap-3">
            <div className="flex items-center gap-2">
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4 shrink-0" />
              )}
              <span>{statusLine ?? 'Back online — refreshing latest data…'}</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              onClick={handleManualRefresh}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync now
            </Button>
          </div>
        </div>
      ) : null}

      {children}
    </NetworkStatusContext.Provider>
  );
}

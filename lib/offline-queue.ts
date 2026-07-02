export type QueuedSubmission = {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  label: string;
  queueKey?: string;
  createdAt: number;
  retries: number;
};

const DB_NAME = 'haa-offline-queue';
const STORE = 'submissions';
const MAX_RETRIES = 5;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
      }),
  );
}

const queueListeners = new Set<() => void>();

export function subscribeOfflineQueue(listener: () => void) {
  queueListeners.add(listener);
  return () => queueListeners.delete(listener);
}

function notifyQueueChange() {
  queueListeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('offline-queue-changed'));
  }
}

function makeId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function getQueuedSubmissions(): Promise<QueuedSubmission[]> {
  try {
    const rows = await runTransaction<QueuedSubmission[]>('readonly', (store) => store.getAll());
    return rows.sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

export async function getQueuedCount(): Promise<number> {
  const rows = await getQueuedSubmissions();
  return rows.length;
}

export async function enqueueSubmission(
  item: Omit<QueuedSubmission, 'id' | 'createdAt' | 'retries'> & { id?: string },
): Promise<string> {
  const rows = await getQueuedSubmissions();

  if (item.queueKey) {
    const existing = rows.find((row) => row.queueKey === item.queueKey);
    if (existing) {
      const updated: QueuedSubmission = {
        ...existing,
        url: item.url,
        method: item.method,
        headers: item.headers,
        body: item.body,
        label: item.label,
        retries: 0,
        createdAt: Date.now(),
      };
      await runTransaction<IDBValidKey>('readwrite', (store) => store.put(updated));
      notifyQueueChange();
      return existing.id;
    }
  }

  const id = item.id ?? makeId();
  const record: QueuedSubmission = {
    id,
    url: item.url,
    method: item.method,
    headers: item.headers,
    body: item.body,
    label: item.label,
    queueKey: item.queueKey,
    createdAt: Date.now(),
    retries: 0,
  };

  await runTransaction<IDBValidKey>('readwrite', (store) => store.put(record));
  notifyQueueChange();
  return id;
}

export async function removeQueuedSubmission(id: string) {
  await runTransaction<undefined>('readwrite', (store) => store.delete(id));
  notifyQueueChange();
}

export async function updateQueuedSubmission(item: QueuedSubmission) {
  await runTransaction<IDBValidKey>('readwrite', (store) => store.put(item));
  notifyQueueChange();
}

export type FlushResult = {
  synced: number;
  failed: number;
  dropped: number;
  errors: string[];
};

export async function flushOfflineQueue(): Promise<FlushResult> {
  const result: FlushResult = { synced: 0, failed: 0, dropped: 0, errors: [] };
  const rows = await getQueuedSubmissions();

  for (const item of rows) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
        credentials: 'include',
      });

      if (response.ok) {
        await removeQueuedSubmission(item.id);
        result.synced += 1;
        continue;
      }

      if (response.status === 401 || response.status === 403) {
        await removeQueuedSubmission(item.id);
        result.dropped += 1;
        result.errors.push(`${item.label}: session expired — please sign in and submit again`);
        continue;
      }

      const nextRetries = item.retries + 1;
      if (nextRetries >= MAX_RETRIES) {
        await removeQueuedSubmission(item.id);
        result.dropped += 1;
        result.errors.push(`${item.label}: gave up after ${MAX_RETRIES} attempts`);
      } else {
        await updateQueuedSubmission({ ...item, retries: nextRetries });
        result.failed += 1;
      }
    } catch {
      const nextRetries = item.retries + 1;
      if (nextRetries >= MAX_RETRIES) {
        await removeQueuedSubmission(item.id);
        result.dropped += 1;
        result.errors.push(`${item.label}: network still unavailable`);
      } else {
        await updateQueuedSubmission({ ...item, retries: nextRetries });
        result.failed += 1;
      }
    }
  }

  notifyQueueChange();
  return result;
}

export function isNetworkFailure(error: unknown) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (error instanceof TypeError) return true;
  if (error instanceof Error && /network|fetch|offline|failed to fetch/i.test(error.message)) return true;
  return false;
}

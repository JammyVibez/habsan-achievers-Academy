import {
  enqueueSubmission,
  flushOfflineQueue,
  getQueuedCount,
  getQueuedSubmissions,
  isNetworkFailure,
  subscribeOfflineQueue,
  type FlushResult,
  type QueuedSubmission,
} from '@/lib/offline-queue';

export type SubmitOrQueueOptions = {
  url: string;
  method?: string;
  body: unknown;
  label: string;
  queueKey?: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
};

export type SubmitOrQueueResult =
  | { queued: false; response: Response }
  | { queued: true; queueId: string; message: string };

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

export async function submitOrQueue(options: SubmitOrQueueOptions): Promise<SubmitOrQueueResult> {
  const method = options.method ?? 'POST';
  const headers = { ...DEFAULT_HEADERS, ...options.headers };
  const body = JSON.stringify(options.body);
  const credentials = options.credentials ?? 'include';

  const tryFetch = async () =>
    fetch(options.url, {
      method,
      headers,
      body,
      credentials,
    });

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const queueId = await enqueueSubmission({
      url: options.url,
      method,
      headers,
      body,
      label: options.label,
      queueKey: options.queueKey,
    });
    return {
      queued: true,
      queueId,
      message: 'Saved offline. It will upload automatically when your connection returns.',
    };
  }

  try {
    const response = await tryFetch();
    if (response.ok) {
      return { queued: false, response };
    }

    if (response.status >= 500 || response.status === 408) {
      const queueId = await enqueueSubmission({
        url: options.url,
        method,
        headers,
        body,
        label: options.label,
        queueKey: options.queueKey,
      });
      return {
        queued: true,
        queueId,
        message: 'Server unavailable — saved offline and will retry when connection is stable.',
      };
    }

    return { queued: false, response };
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;

    const queueId = await enqueueSubmission({
      url: options.url,
      method,
      headers,
      body,
      label: options.label,
      queueKey: options.queueKey,
    });
    return {
      queued: true,
      queueId,
      message: 'Network lost — saved offline. It will sync automatically when you are back online.',
    };
  }
}

export {
  flushOfflineQueue,
  getQueuedCount,
  getQueuedSubmissions,
  subscribeOfflineQueue,
  type FlushResult,
  type QueuedSubmission,
};

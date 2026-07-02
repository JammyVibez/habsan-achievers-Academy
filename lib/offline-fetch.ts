/**
 * Fetch wrapper that detects offline/network failures and returns a clear error.
 * Use in client forms when you want friendly offline messaging.
 */
export async function offlineAwareFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('You are offline. Connect to the internet to save or load new data.');
  }

  try {
    return await fetch(input, init);
  } catch {
    throw new Error('Network error. Check your connection and try again.');
  }
}

export function isOfflineError(message: string) {
  return /offline|network error|connection/i.test(message);
}

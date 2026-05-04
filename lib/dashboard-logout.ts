'use client';

/**
 * Clears the session cookie via the logout API and sends the user to the login page.
 * Safe to call from any dashboard (admin, teacher, student).
 */
export async function dashboardLogout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
  } catch {
    // Still navigate so the user is not stuck on a protected page without a cookie clear attempt.
  }
  window.location.assign('/login');
}

'use client';

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

/**
 * Watches the session for a RefreshTokenError and automatically
 * redirects the user to re-authenticate with GitHub.
 *
 * When a GitHub App token expires and the refresh token is also expired
 * (~6 months), we can't silently refresh. This hook forces a fresh
 * sign-in flow so the user gets a brand-new access + refresh token pair.
 */
export function useTokenGuard() {
  const { data: session } = useSession();

  useEffect(() => {
    if ((session as any)?.error === 'RefreshTokenError') {
      console.warn('[TokenGuard] Refresh token expired — forcing re-authentication');
      // Redirect to GitHub OAuth sign-in to get fresh tokens
      signIn('github');
    }
  }, [session]);
}

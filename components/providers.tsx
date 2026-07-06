'use client';

import * as React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { useTokenGuard } from '@/hooks/useTokenGuard';

import { useRealtimeEvents } from '@/hooks/useRealtimeEvents';

/** Watches the session for token errors and forces re-auth when needed */
function TokenGuard({ children }: { children: React.ReactNode }) {
  useTokenGuard();
  return <>{children}</>;
}

/** Listens to global deployment events from SSE stream */
function RealtimeListener() {
  useRealtimeEvents();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TokenGuard>
        <RealtimeListener />
        {children}
      </TokenGuard>
      <Toaster position="bottom-right" theme="dark" closeButton />
    </SessionProvider>
  );
}


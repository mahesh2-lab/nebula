'use client';

import * as React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to telemetry reporting services
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-[#FAFAFA] font-sans p-6 text-center select-none">
      <div className="max-w-md border border-red-500/20 bg-[#111113]/30 p-8 rounded-md shadow-2xl space-y-6 flex flex-col items-center">
        
        {/* Error icon */}
        <span className="h-12 w-12 border border-red-500/30 bg-red-500/10 text-red-500 flex items-center justify-center rounded-md animate-pulse">
          <ShieldAlert className="h-6 w-6" />
        </span>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
            500 - Application Error
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed font-mono">
            An unexpected error occurred in our frontend container rendering engine.
          </p>
        </div>

        {error.message && (
          <div className="w-full text-left p-3 bg-black border border-[#1f1f1f] rounded-sm max-h-24 overflow-y-auto font-mono text-[10px] text-[#EF4444] select-text">
            <code>{error.message}</code>
          </div>
        )}

        <div className="h-[1px] w-full bg-[#1f1f1f]" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 border border-[#1f1f1f] bg-black text-white hover:bg-[#111113] text-xs font-mono rounded-md transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Reset View</span>
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold rounded-md transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Go Home</span>
          </button>
        </div>

      </div>
    </div>
  );
}

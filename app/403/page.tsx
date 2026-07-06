'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-[#FAFAFA] font-sans p-6 text-center select-none">
      <div className="max-w-md border border-red-500/20 bg-[#111113]/30 p-8 rounded-md shadow-2xl space-y-6 flex flex-col items-center">
        
        {/* Animated Shield Logo */}
        <span className="h-12 w-12 border border-red-500/30 bg-red-500/10 text-red-500 flex items-center justify-center rounded-md animate-pulse">
          <ShieldAlert className="h-6 w-6" />
        </span>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
            403 - Access Forbidden
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed font-mono">
            You do not possess the administrative authorization credentials required to request this system resource.
          </p>
        </div>

        <div className="h-[1px] w-full bg-[#1f1f1f]" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            onClick={() => router.back()}
            className="flex-1 flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 border border-[#1f1f1f] bg-black text-[#A1A1AA] hover:bg-[#111113] hover:text-white text-xs font-mono rounded-md transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go Back</span>
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold rounded-md transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
}

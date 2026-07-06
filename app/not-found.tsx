'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-[#FAFAFA] font-sans p-6 text-center select-none">
      <div className="max-w-md border border-[#1f1f1f] bg-[#111113]/30 p-8 rounded-md shadow-2xl space-y-6 flex flex-col items-center">
        
        {/* Animated Question Logo */}
        <span className="h-12 w-12 border border-[#1f1f1f] bg-[#0c0c0e] text-[#A1A1AA] flex items-center justify-center rounded-md">
          <HelpCircle className="h-6 w-6 text-white" />
        </span>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
            404 - Page Not Found
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed font-mono">
            The route you have requested does not exist on our edge routing system. It may have been relocated or purged.
          </p>
        </div>

        <div className="h-[1px] w-full bg-[#1f1f1f]" />

        {/* Suggested Links */}
        <div className="w-full text-left space-y-2 text-[11px] font-mono">
          <p className="text-zinc-500 uppercase tracking-wider text-[9px]">Suggested actions</p>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard" className="p-2 border border-[#1f1f1f]/60 bg-black hover:bg-[#111113] rounded-sm text-zinc-300 hover:text-white transition-colors">
              ➜ Workspace Dashboard
            </Link>
            <Link href="/docs" className="p-2 border border-[#1f1f1f]/60 bg-black hover:bg-[#111113] rounded-sm text-zinc-300 hover:text-white transition-colors">
              ➜ Platform Documentation
            </Link>
          </div>
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
            <span>Go Home</span>
          </button>
        </div>

      </div>
    </div>
  );
}

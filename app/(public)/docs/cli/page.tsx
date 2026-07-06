'use client';

import * as React from 'react';
import { CLI } from '@/features/projects/cli';
import { BookOpen, Terminal } from 'lucide-react';

export default function DocsCliPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-[#1f1f1f] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#71717A]">
          <BookOpen className="h-4 w-4" />
          <span>Documentation</span>
          <span>/</span>
          <Terminal className="h-4 w-4 text-white" />
          <span className="text-white">CLI</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Nebula CLI Reference</h1>
        <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-xl">
          Complete guide to installing, configuring, and pushing edge builds using the Nebula Global CLI package.
        </p>
      </div>

      <div className="-mx-6">
        <CLI />
      </div>
    </div>
  );
}

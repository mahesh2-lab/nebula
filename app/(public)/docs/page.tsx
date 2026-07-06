'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Terminal, Key, Shield } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="space-y-8 font-sans">
      <div className="space-y-3 border-b border-[#1f1f1f] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#71717A]">
          <BookOpen className="h-4 w-4" />
          <span>Documentation</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Introduction to Nebula</h1>
        <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-xl">
          Learn how to compile, containerize, and deploy serverless codebases to edge servers around the globe instantly.
        </p>
      </div>

      {/* Guide Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link 
          href="/docs/cli" 
          className="border border-[#1f1f1f] bg-[#0c0c0e] hover:bg-[#111113] p-5 rounded-md hover:border-zinc-700 transition-all flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-white" />
              <h3 className="text-xs font-mono uppercase font-bold text-white tracking-wide">CLI Reference</h3>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Install and use the Nebula terminal command-line tool to initialize and deploy directories.
            </p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 mt-4 group">
            Open CLI guide <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <Link 
          href="/docs/api" 
          className="border border-[#1f1f1f] bg-[#0c0c0e] hover:bg-[#111113] p-5 rounded-md hover:border-zinc-700 transition-all flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-white" />
              <h3 className="text-xs font-mono uppercase font-bold text-white tracking-wide">API Reference</h3>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Expose webhooks, generate API authorization tokens, and query project deployments.
            </p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 mt-4">
            Open API reference <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-mono uppercase">Core Concept Overview</h2>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Nebula functions as a micro-container scheduler. Instead of maintaining persistent Linux instances, you link git repos. Our build systems compile source branches into highly optimized dockerized images, automatically deploying them to our global Edge proxy nodes.
        </p>

        <div className="border border-[#1f1f1f] p-4 rounded-md bg-[#111113]/30 space-y-2">
          <h4 className="text-xs font-semibold text-white font-mono">⚡ Zero-config automatic compilation</h4>
          <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
            By analyzing the project framework (Next.js, Vite, etc.), Nebula resolves the corresponding build and output folders automatically, ensuring zero configuration.
          </p>
        </div>
      </div>
    </div>
  );
}

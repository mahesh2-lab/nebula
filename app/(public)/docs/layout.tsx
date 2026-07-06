'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CloudLightning, BookOpen, Terminal, Key, Shield, HelpCircle } from 'lucide-react';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();

  const links = [
    { label: 'Introduction', href: '/docs', icon: HelpCircle },
    { label: 'CLI Reference', href: '/docs/cli', icon: Terminal },
    { label: 'API Reference', href: '/docs/api', icon: Key },
    { label: 'Platform Details', href: '/docs/platform', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] font-sans flex flex-col">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#1f1f1f] px-6 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <CloudLightning className="h-5 w-5 text-white animate-pulse" />
          <span className="font-semibold text-sm tracking-tight text-white font-mono uppercase">NEBULA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-[#A1A1AA]">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="text-white">Docs</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors">Log In</Link>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono px-3 py-1.5 rounded-sm transition-all"
          >
            Deploy Now
          </button>
        </div>
      </header>

      {/* Docs Body (Sidebar + Content) */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-60 border-r border-[#1f1f1f] p-6 shrink-0 space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">Documentation</h3>
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-mono rounded-sm transition-all ${
                      isActive 
                        ? 'bg-[#111113] text-white font-semibold' 
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#111113]/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Content area */}
        <main className="flex-1 p-6 md:p-10 max-w-3xl overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  CloudLightning, 
  Github, 
  Terminal, 
  Shield, 
  Globe, 
  Zap, 
  Layers, 
  Cpu, 
  Activity, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const router = useRouter();

  const featuresList = [
    {
      icon: Github,
      title: 'Git-Driven Deployments',
      description: 'Connect GitHub or GitLab. Every git push triggers an automated multi-tenant container build and CDN distribution.'
    },
    {
      icon: Terminal,
      title: 'Edge Runtime Logs',
      description: 'Real-time terminal log-streaming built on high-throughput stdout pipelines. Instant deployment telemetry.'
    },
    {
      icon: Shield,
      title: 'Secure Env Secrets',
      description: 'Environment variables are encrypted at rest and injected dynamically at request time into isolated micro-containers.'
    },
    {
      icon: Globe,
      title: 'Global Edge Router',
      description: 'Request routing happens at the nearest edge proxy POP. Negligible latency and automated SSL handshakes.'
    },
    {
      icon: Zap,
      title: 'Instant Cold Starts',
      description: 'Micro-virtualization technology allows inactive serverless containers to spin up under 50 milliseconds.'
    },
    {
      icon: Layers,
      title: 'Container Versioning',
      description: 'Every build compiles a unique image hash. Perform instant traffic splits and zero-downtime rollbacks.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] font-sans flex flex-col">
      {/* Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#1f1f1f] px-6 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <CloudLightning className="h-5 w-5 text-white animate-pulse" />
          <span className="font-semibold text-sm tracking-tight text-white font-mono uppercase">NEBULA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-[#A1A1AA]">
          <Link href="/features" className="text-white">Features</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
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

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-20 space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Designed for high performance.
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
            Orchestrate containerized services globally. Zero-config builds, automated edge routing, and instant isolated networking.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="border border-[#1f1f1f] bg-[#0c0c0e] hover:bg-[#111113] p-6 rounded-md hover:border-zinc-700 transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center border border-[#1f1f1f] bg-black text-white rounded-sm">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Stats Banner */}
        <div className="border border-[#1f1f1f] bg-[#111113]/30 rounded-md p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center select-none">
          <div className="space-y-1">
            <p className="text-2xl font-mono font-bold text-white">&lt;50ms</p>
            <p className="text-[10px] font-mono text-[#71717A] uppercase">Average cold start time</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-mono font-bold text-emerald-400">99.99%</p>
            <p className="text-[10px] font-mono text-[#71717A] uppercase">Edge deployment uptime</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-mono font-bold text-white">18</p>
            <p className="text-[10px] font-mono text-[#71717A] uppercase">Global edge proxy locations</p>
          </div>
        </div>

        {/* CTA section */}
        <div className="border border-[#1f1f1f] bg-gradient-to-r from-zinc-950 to-neutral-900 rounded-md p-8 text-center space-y-4 max-w-xl mx-auto">
          <h3 className="text-lg font-bold text-white font-mono uppercase">Start Orchestrating Today</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
            Push code, verify logs, configure settings, and deploy to edge servers under 2 minutes.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-1 bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono px-4 py-2 rounded-sm transition-all mt-2"
          >
            Create Free Project <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] py-8 text-center text-xs font-mono text-[#71717A]">
        © {new Date().getFullYear()} Nebula Org. All rights reserved.
      </footer>
    </div>
  );
}

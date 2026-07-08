'use client';

import * as React from 'react';
import { BookOpen, Shield, CloudLightning } from 'lucide-react';

export const dynamic = 'force-static';

export default function DocsPlatformPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-3 border-b border-[#1f1f1f] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#71717A]">
          <BookOpen className="h-4 w-4" />
          <span>Documentation</span>
          <span>/</span>
          <Shield className="h-4 w-4 text-white" />
          <span className="text-white">Platform Details</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Architecture</h1>
        <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-xl">
          Deep-dive into Nebula serverless micro-virtualization engine, sandboxing limits, and networking configurations.
        </p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-[#A1A1AA]">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">1. Isolated Sandboxing</h3>
          <p>
            Every project deployment spins up inside an isolated micro-container environment. By utilizing a stripped Linux namespace kernel, we prevent multi-tenant resource leakage or memory access overlaps. Applications run in read-only filesystems, with writable directories limited strictly to the ephemeral <code>/tmp</code> path.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">2. Storage Orchestration</h3>
          <p>
            Containers are fundamentally stateless. If database or persistent state is required, Nebula supports mounting remote S3 volume endpoints or connecting Neon PostgreSQL database clusters seamlessly. Persisted volumes can be mapped in your environment settings.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">3. Resource Scaling Limits</h3>
          <table className="w-full border border-[#1f1f1f] rounded-sm overflow-hidden text-left font-mono">
            <thead>
              <tr className="bg-[#111113] text-white border-b border-[#1f1f1f]">
                <th className="p-2 border-r border-[#1f1f1f] text-[10px]">Resource Parameter</th>
                <th className="p-2 text-[10px]">Allocation (Pro Plan)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              <tr>
                <td className="p-2 border-r border-[#1f1f1f]">Compute CPU Limit</td>
                <td className="p-2">Up to 2.0 vCPU per container</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-[#1f1f1f]">Memory Cap</td>
                <td className="p-2">Up to 1024 MB RAM burstable</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-[#1f1f1f]">Timeout limit</td>
                <td className="p-2">60 seconds per serverless invocation</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-[#1f1f1f]">Concurrent pipelines</td>
                <td className="p-2">3 simultaneous builds</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

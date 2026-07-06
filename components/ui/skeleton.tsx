'use client';

import * as React from 'react';

// --- Base Skeleton Primitive ---
export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-[#1f1f1f] rounded-sm ${className}`}
      style={style}
    />
  );
}

// --- Layout Skeleton (used by project layout.tsx while loading) ---
export function ProjectLayoutSkeleton() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Tab bar shimmer */}
      <div className="border-b border-[#1f1f1f] bg-[#111113]/50 flex items-center justify-between h-[38px]">
        <div className="flex gap-4 pt-1 px-6 max-w-5xl mx-auto w-full">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-14 rounded-sm" />
          ))}
        </div>
      </div>
      {/* Content shimmer */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-48 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
        <div className="border border-[#1f1f1f] bg-[#111113] rounded-md divide-y divide-[#1f1f1f] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-4 rounded-full shrink-0" />
              <Skeleton className="h-3 flex-1 max-w-xs" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Overview Skeleton ---
export function OverviewSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md flex flex-col md:flex-row gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-44" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-sm" />
          <Skeleton className="h-8 w-24 rounded-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
      <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
        <Skeleton className="h-3 w-24" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}

// --- Deployments Skeleton ---
export function DeploymentsSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-32 rounded-sm" />
      </div>
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md divide-y divide-[#1f1f1f] overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2 bg-[#0d0d0f]">
          {[112, 64, 96, 48, 40].map((w, i) => (
            <Skeleton key={i} className="h-2.5 rounded-sm" style={{ width: `${w}px` }} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-2.5 w-56" style={{ opacity: 0.7 }} />
            </div>
            <Skeleton className="h-5 w-16 rounded-sm ml-auto" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Logs Skeleton ---
export function LogsSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-3 items-center">
        <Skeleton className="h-8 flex-1 rounded-sm" />
        <Skeleton className="h-8 w-28 rounded-sm" />
      </div>
      <div className="border border-[#1f1f1f] bg-[#09090B] rounded-md p-4 space-y-2 font-mono">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <Skeleton className="h-2.5 w-20 shrink-0" style={{ opacity: 0.5 }} />
            <Skeleton className="h-2.5 w-12 shrink-0" style={{ opacity: 0.4 }} />
            <Skeleton
              className="h-2.5 rounded-sm"
              style={{ width: `${60 + Math.round(Math.sin(i) * 30)}%`, opacity: 0.6 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Domains Skeleton ---
export function DomainsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-sm" />
          <Skeleton className="h-8 w-24 rounded-sm" />
        </div>
      </div>
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md divide-y divide-[#1f1f1f] overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-2.5 w-36" style={{ opacity: 0.6 }} />
            </div>
            <Skeleton className="h-5 w-14 rounded-sm" />
            <Skeleton className="h-4 w-4 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Env Variables Skeleton ---
export function EnvSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
        <Skeleton className="h-3 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-40 rounded-sm" />
          <Skeleton className="h-8 flex-1 rounded-sm" />
          <Skeleton className="h-8 w-20 rounded-sm" />
        </div>
      </div>
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md divide-y divide-[#1f1f1f] overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 flex-1 max-w-xs" style={{ opacity: 0.4 }} />
            <div className="flex gap-2 ml-auto">
              <Skeleton className="h-6 w-6 rounded-sm" />
              <Skeleton className="h-6 w-6 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Analytics Skeleton ---
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-2.5 w-16" style={{ opacity: 0.6 }} />
          </div>
        ))}
      </div>
      <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-24 rounded-sm" />
        </div>
        <Skeleton className="h-48 w-full rounded-sm" style={{ opacity: 0.4 }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-32 w-full rounded-sm" style={{ opacity: 0.4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Settings Skeleton ---
export function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {[0, 1].map((s) => (
        <div key={s} className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-4">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-2.5 w-28" />
              <Skeleton className="h-8 w-full rounded-sm" />
            </div>
          ))}
          <Skeleton className="h-8 w-24 rounded-sm" />
        </div>
      ))}
      <div className="border border-[#EF4444]/20 bg-[#111113] p-4 rounded-md space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-72" />
        <Skeleton className="h-8 w-full rounded-sm" />
        <Skeleton className="h-8 w-32 rounded-sm" />
      </div>
    </div>
  );
}

// --- Deployment Detail Skeleton ---
export function DeploymentDetailSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-6 w-16 rounded-sm ml-auto" />
      </div>
      <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-[#1f1f1f] bg-[#09090B] rounded-sm h-[180px] flex flex-col overflow-hidden">
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#1f1f1f] h-8">
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-2.5 w-24 ml-auto mr-auto" />
          </div>
          <Skeleton className="flex-1 rounded-none" style={{ opacity: 0.3 }} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md divide-y divide-[#1f1f1f] overflow-hidden">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

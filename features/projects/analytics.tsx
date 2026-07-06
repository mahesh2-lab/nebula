'use client';

import * as React from 'react';
import { useStore, Project } from '../../store/store';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  Activity, 
  Globe2, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { AnalyticsSkeleton } from '@/components/ui/skeleton';

export function Analytics({ project: initialProject }: { project?: Project }) {
  const [mounted, setMounted] = React.useState(false);
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);

  const activeProject = initialProject || projects.find(p => p.id === activeProjectId);

  const [analyticsData, setAnalyticsData] = React.useState<{
    requestsUsed: number;
    bandwidthUsed: number;
    latency: string;
    coldStarts: string;
    timelineData: Array<{ time: string; requests: number; bandwidth: number; latency: number }>;
    regions: Array<{ id: string; name: string; requests: string; pct: number }>;
    urls: Array<{ path: string; count: string; pct: number }>;
  } | null>(null);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    let isSubscribed = true;

    async function fetchAnalytics() {
      try {
        const url = activeProject
          ? `/api/projects/${activeProject.id}/analytics`
          : `/api/analytics`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        if (isSubscribed) {
          setAnalyticsData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch telemetry:', err);
      }
    }

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeProject]);

  const stats = React.useMemo(() => {
    if (analyticsData) {
      return {
        isGlobal: !activeProject,
        name: activeProject ? activeProject.name : 'Workspace (All Projects)',
        requests: analyticsData.requestsUsed.toFixed(2) + 'M',
        bandwidth: analyticsData.bandwidthUsed.toFixed(1) + ' GB',
        latency: analyticsData.latency,
        coldStarts: analyticsData.coldStarts
      };
    }

    return {
      isGlobal: !activeProject,
      name: activeProject ? activeProject.name : 'Workspace (All Projects)',
      requests: '0.00M',
      bandwidth: '0.0 GB',
      latency: '0ms',
      coldStarts: '0.00%'
    };
  }, [activeProject, analyticsData]);

  // Aggregate project names and requests for the comparison chart
  const projectComparisonData = React.useMemo(() => {
    return projects.map(p => ({
      name: p.name.split('/').pop() || p.name,
      requests: p.billing.requestsUsed,
      bandwidth: p.billing.bandwidthUsed
    }));
  }, [projects]);

  const timelineData = analyticsData?.timelineData || [];
  const regions = analyticsData?.regions || [];
  const urls = analyticsData?.urls || [];

  if (!mounted || loading || !analyticsData) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-6 space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono font-bold">
          {stats.isGlobal ? 'Global Telemetry' : `${stats.name} / Analytics`}
        </h3>
        <p className="text-xs text-zinc-500 font-mono">
          {stats.isGlobal 
            ? 'Consolidated workspace bandwidth, requests load, and regional routing targets.'
            : 'Detailed edge function invocations, bandwidth outflow, and request distribution logs.'}
        </p>
      </div>

      {/* Grid numbers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono text-[#71717A]">REQUEST TOTALS</p>
          <div className="flex justify-between items-baseline">
            <p className="text-lg font-mono font-bold text-white">{stats.requests}</p>
            <span className="text-[10px] text-[#22C55E] flex items-center font-mono font-semibold">
              +14.2% <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono text-[#71717A]">DATA OUTFLOW</p>
          <div className="flex justify-between items-baseline">
            <p className="text-lg font-mono font-bold text-white">{stats.bandwidth}</p>
            <span className="text-[10px] text-[#22C55E] flex items-center font-mono font-semibold">
              +12.1% <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono text-[#71717A]">AVG EDGE LATENCY</p>
          <div className="flex justify-between items-baseline">
            <p className="text-lg font-mono font-bold text-[#22C55E]">{stats.latency}</p>
            <span className="text-[10px] text-[#22C55E] flex items-center font-mono font-semibold">
              -2.1ms <ArrowDownRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono text-[#71717A]">COLD START RATES</p>
          <div className="flex justify-between items-baseline">
            <p className="text-lg font-mono font-bold text-white">{stats.coldStarts}</p>
            <span className="text-[10px] text-[#22C55E] flex items-center font-mono font-semibold">
              -0.01% <ArrowDownRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Request Load chart */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider font-mono">
              {stats.isGlobal ? 'Aggregated Traffic (24h)' : 'Requests load (24h)'}
            </h4>
            <Activity className="h-3.5 w-3.5 text-[#71717A]" />
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="time" stroke="#71717A" fontSize={9} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#111113', border: '1px solid #1f1f1f', fontSize: 10, fontFamily: 'monospace' }} 
                  labelStyle={{ color: '#71717A' }}
                />
                <Line type="monotone" dataKey="requests" stroke="#FAFAFA" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global project comparison or bandwidth outflow chart */}
        {stats.isGlobal ? (
          <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider font-mono">Requests by Project (M)</h4>
              <BarChart3 className="h-3.5 w-3.5 text-[#71717A]" />
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="name" stroke="#71717A" fontSize={9} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#111113', border: '1px solid #1f1f1f', fontSize: 10, fontFamily: 'monospace' }} 
                    labelStyle={{ color: '#71717A' }}
                  />
                  <Bar dataKey="requests" fill="#FAFAFA" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider font-mono">Bandwidth Out (GB)</h4>
              <BarChart3 className="h-3.5 w-3.5 text-[#71717A]" />
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="time" stroke="#71717A" fontSize={9} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#111113', border: '1px solid #1f1f1f', fontSize: 10, fontFamily: 'monospace' }} 
                    labelStyle={{ color: '#71717A' }}
                  />
                  <Bar dataKey="bandwidth" fill="#FAFAFA" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Latency / Response Time Over Time */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider font-mono">Edge Latency (ms)</h4>
            <Clock className="h-3.5 w-3.5 text-[#71717A]" />
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="time" stroke="#71717A" fontSize={9} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#111113', border: '1px solid #1f1f1f', fontSize: 10, fontFamily: 'monospace' }} 
                  labelStyle={{ color: '#71717A' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#3B82F6" fill="rgba(59, 130, 246, 0.1)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional replication metrics list */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-[#1f1f1f]">
            <h4 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider font-mono">Traffic by Edge Region</h4>
            <Globe2 className="h-3.5 w-3.5 text-[#71717A]" />
          </div>
          <div className="space-y-3 font-mono text-xs flex-1 pt-2">
            {regions.map((reg) => (
              <div key={reg.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white bg-[#18181B] border border-[#1f1f1f] px-1 py-0.5 rounded-sm">{reg.id.toUpperCase()}</span>
                    <span className="text-[#FAFAFA]">{reg.name}</span>
                  </div>
                  <span className="text-[#71717A]">{reg.requests} ({reg.pct}%)</span>
                </div>
                <div className="w-full bg-[#09090B] h-1 border border-[#1f1f1f] overflow-hidden rounded-full">
                  <div className="bg-white h-full" style={{ width: `${reg.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Request URLs List */}
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden font-mono">
        <div className="px-4 py-3 bg-[#18181B] border-b border-[#1f1f1f]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">Top URLs & Requests</h4>
        </div>
        <div className="divide-y divide-[#1f1f1f] text-xs">
          {urls.map((u, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 hover:bg-[#18181B]/50 transition-colors">
              <span className="text-[#FAFAFA] font-medium">{u.path}</span>
              <div className="flex items-center gap-4 text-[#71717A]">
                <span>{u.count} hits</span>
                <span className="inline-block w-12 text-right text-[#A1A1AA] font-bold">{u.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

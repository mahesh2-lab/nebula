'use client';

import * as React from 'react';
import { useStore, Project } from '../../store/store';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Play,
  Pause,
  RefreshCw,
  Upload,
  SlidersHorizontal,
  ChevronLeft,
  AlertTriangle,
  FolderDot,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'warning' | 'error' | 'info' | 'fatal';
  method: string;
  status: number;
  host: string;
  request: string;
  message?: string;
  project: string;
}

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'l-1',
    timestamp: '2026-07-02T08:31:46.010Z',
    level: 'warning',
    method: 'GET',
    status: 404,
    host: 'alles-backend-nmx4e..',
    request: '/favicon.png',
    project: 'alles-backend'
  },
  {
    id: 'l-2',
    timestamp: '2026-07-02T08:31:45.770Z',
    level: 'warning',
    method: 'GET',
    status: 404,
    host: 'alles-backend-nmx4e..',
    request: '/favicon.ico',
    project: 'alles-backend'
  },
  {
    id: 'l-3',
    timestamp: '2026-07-02T08:31:42.830Z',
    level: 'warning',
    method: 'GET',
    status: 404,
    host: 'alles-backend-nmx4e..',
    request: '/',
    message: 'Legacy server listening...',
    project: 'alles-backend'
  },
  {
    id: 'l-4',
    timestamp: '2026-07-02T08:28:10.450Z',
    level: 'info',
    method: 'GET',
    status: 200,
    host: 'alles-backend-nmx4e..',
    request: '/api/v1/health',
    message: 'Health status OK',
    project: 'alles-backend'
  },
  {
    id: 'l-5',
    timestamp: '2026-07-02T08:25:33.120Z',
    level: 'error',
    method: 'POST',
    status: 500,
    host: 'alles-backend-nmx4e..',
    request: '/api/v1/db/sync',
    message: 'Postgres connection pool exhausted at pool.acquire()',
    project: 'alles-backend'
  },
  {
    id: 'l-6',
    timestamp: '2026-07-02T08:21:12.890Z',
    level: 'info',
    method: 'GET',
    status: 200,
    host: 'nebula-dashboard-65f..',
    request: '/dashboard',
    project: 'nebula-dashboard'
  },
  {
    id: 'l-7',
    timestamp: '2026-07-02T08:18:04.340Z',
    level: 'info',
    method: 'GET',
    status: 200,
    host: 'next-auth-app-921..',
    request: '/api/auth/session',
    project: 'next-auth-app'
  },
  {
    id: 'l-8',
    timestamp: '2026-07-02T08:14:40.220Z',
    level: 'error',
    method: 'POST',
    status: 500,
    host: 'next-auth-app-921..',
    request: '/api/auth/signin/github',
    message: 'OAuth callback verification failure: client_id is required',
    project: 'next-auth-app'
  }
];

export function Logs({ project: initialProject }: { project?: Project }) {
  const router = useRouter();
  const projects = useStore((s) => s.projects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);

  // If a project context was passed, use that; otherwise check activeProjectId from store
  const activeProject = initialProject || projects.find(p => p.id === activeProjectId);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLive, setIsLive] = React.useState(true);
  const [selectedLevels, setSelectedLevels] = React.useState<string[]>([]);
  const [timeRange, setTimeRange] = React.useState('8:03 - 8:33');
  const [showProjectDropdown, setShowProjectDropdown] = React.useState(false);

  const [realLogs, setRealLogs] = React.useState<LogEntry[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!activeProject) {
      setRealLogs([]);
      return;
    }

    const latestDep = activeProject.deployments[0];
    if (!latestDep) {
      setRealLogs([]);
      return;
    }

    let active = true;
    setLoading(true);
    fetch(`/api/projects/${activeProject.id}/deployments/${latestDep.id}/logs`)
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        if (data.logs) {
          const lines = data.logs.split('\n').filter((l: string) => l.trim() !== '');
          const entries: LogEntry[] = lines.map((line: string, index: number) => {
            const match = line.match(/^\[([^\]]+)\]\s+\[([^\]]+)\]\s*(.*)$/);
            if (match) {
              const [_, ts, lvl, msg] = match;
              const cleanLevel = lvl.toLowerCase();
              const level = (cleanLevel === 'info' ? 'info' : cleanLevel === 'error' ? 'error' : cleanLevel === 'warning' ? 'warning' : 'info') as any;
              return {
                id: `real-${latestDep.id}-${index}`,
                timestamp: ts,
                level,
                method: 'SYSTEM',
                status: level === 'error' ? 500 : 200,
                host: 'builder-worker',
                request: msg.length > 30 ? msg.substring(0, 30) + '...' : msg,
                message: msg,
                project: activeProject.id
              };
            }
            return {
              id: `real-${latestDep.id}-${index}`,
              timestamp: new Date().toISOString(),
              level: 'info',
              method: 'SYSTEM',
              status: 200,
              host: 'builder-worker',
              request: line.length > 30 ? line.substring(0, 30) + '...' : line,
              message: line,
              project: activeProject.id
            };
          });
          setRealLogs(entries);
        } else {
          setRealLogs([]);
        }
      })
      .catch(err => {
        console.error('Failed to load logs:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeProject?.id, activeProject?.deployments?.[0]?.id]);

  const displayedMockLogs = React.useMemo(() => {
    if (!activeProject) return MOCK_LOGS;
    return MOCK_LOGS.map(log => ({
      ...log,
      project: activeProject.id,
      host: log.host.replace('alles-backend', activeProject.id).replace('next-auth-app', activeProject.id)
    }));
  }, [activeProject]);

  const activeLogs = realLogs.length > 0 ? realLogs : displayedMockLogs;

  // Accordion toggle states
  const [accordions, setAccordions] = React.useState<Record<string, boolean>>({
    timeline: true,
    levels: true,
    resource: false,
    environment: false,
    route: false,
    path: false,
    statusCode: false,
    reqType: false,
    host: false,
    service: false,
    method: false
  });

  const toggleAccordion = (key: string) => {
    setAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleResetFilters = () => {
    setSelectedLevels([]);
    setSearchQuery('');
    setTimeRange('8:03 - 8:33');
    toast.info('Filters reset to default');
  };

  // Filter logs list
  const filteredLogs = React.useMemo(() => {
    return activeLogs.filter(log => {
      // Filter by project context if a project is active
      if (activeProject && log.project !== activeProject.id) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesRequest = log.request.toLowerCase().includes(query);
        const matchesMsg = log.message?.toLowerCase().includes(query) || false;
        const matchesHost = log.host.toLowerCase().includes(query);
        if (!matchesRequest && !matchesMsg && !matchesHost) return false;
      }

      // Filter by levels
      if (selectedLevels.length > 0) {
        if (!selectedLevels.includes(log.level)) return false;
      }

      return true;
    });
  }, [activeLogs, activeProject, searchQuery, selectedLevels]);

  // Compute stats counts
  const levelCounts = React.useMemo(() => {
    const counts = { warning: 0, error: 0, fatal: 0 };
    activeLogs.forEach(log => {
      if (activeProject && log.project !== activeProject.id) return;
      if (log.level === 'warning') counts.warning++;
      if (log.level === 'error') counts.error++;
      if (log.level === 'fatal') counts.fatal++;
    });
    return counts;
  }, [activeProject, activeLogs]);

  return (
    <div className="flex h-[calc(100vh-48px)] w-full overflow-hidden bg-[#09090B] text-zinc-300 font-sans">

      {/* 1. Left Filters Sidebar */}
      <div className="w-64 border-r border-[#1f1f1f] bg-[#111113] flex flex-col shrink-0">
        {/* Header toolbar */}
        <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold font-mono text-white">
            <button
              onClick={() => {
                if (activeProject) {
                  router.push(`/project/${activeProject.id}`);
                } else {
                  router.push('/dashboard');
                }
              }}
              className="flex items-center gap-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer mr-1"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span>Logs Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[10px] font-mono text-zinc-500 hover:text-white px-2 py-0.5 border border-[#1f1f1f] bg-[#09090B] rounded-sm transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Collapsible Accordion Panels */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono text-xs select-none">

          {/* Timeline range selector */}
          <div className="space-y-2">
            <div
              onClick={() => toggleAccordion('timeline')}
              className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider cursor-pointer hover:text-white"
            >
              <span>Timeline</span>
              {accordions.timeline ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </div>
            {accordions.timeline && (
              <div className="pt-1">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#1f1f1f] rounded-md h-9 px-2 text-zinc-300 text-xs focus:outline-none focus:border-white cursor-pointer"
                >
                  <option>8:03 - 8:33</option>
                  <option>7:30 - 8:00</option>
                  <option>Yesterday</option>
                  <option>Last 7 Days</option>
                </select>
              </div>
            )}
          </div>

          <div className="h-[1px] bg-[#1f1f1f]" />

          {/* Console level indicators */}
          <div className="space-y-2">
            <div
              onClick={() => toggleAccordion('levels')}
              className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider cursor-pointer hover:text-white"
            >
              <span>Contains Console Level</span>
              {accordions.levels ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </div>
            {accordions.levels && (
              <div className="space-y-2 pt-1.5 pl-1">
                {[
                  { id: 'warning', label: 'Warning', count: levelCounts.warning },
                  { id: 'error', label: 'Error', count: levelCounts.error },
                  { id: 'fatal', label: 'Fatal', count: levelCounts.fatal }
                ].map(level => (
                  <label key={level.id} className="flex items-center justify-between cursor-pointer hover:text-white transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(level.id)}
                        onChange={() => handleLevelChange(level.id)}
                        className="rounded border-[#1f1f1f] bg-[#09090B] text-white focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 cursor-pointer accent-white"
                      />
                      <span className="text-xs">{level.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-semibold">{level.count}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="h-[1px] bg-[#1f1f1f]" />

          {/* Collapsed accordions matching the reference screenshot */}
          {[
            { id: 'resource', label: 'Resource' },
            { id: 'environment', label: 'Environment' },
            { id: 'route', label: 'Route' },
            { id: 'path', label: 'Request Path' },
            { id: 'statusCode', label: 'Status Code' },
            { id: 'reqType', label: 'Request Type' },
            { id: 'host', label: 'Host' },
            { id: 'service', label: 'Service' },
            { id: 'method', label: 'Request Method' }
          ].map(acc => (
            <div key={acc.id} className="space-y-1">
              <div
                onClick={() => toggleAccordion(acc.id)}
                className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold uppercase tracking-wider cursor-pointer hover:text-zinc-300 py-1"
              >
                <span>{acc.label}</span>
                {accordions[acc.id] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </div>
              {accordions[acc.id] && (
                <div className="pl-2 pt-1 text-[11px] text-zinc-600">No filters available</div>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* 2. Main Terminal Content Window */}
      <div className="flex-1 flex flex-col bg-[#09090B] overflow-hidden relative">

        {/* Top Header toolbar matching image layout */}
        <div className="h-12 border-b border-[#1f1f1f] px-6 flex items-center justify-between shrink-0">

          {/* Project switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-[#1f1f1f] bg-[#09090B] hover:bg-[#111113] text-xs font-semibold text-white font-mono rounded-md transition-colors cursor-pointer"
            >
              <FolderDot className="h-3.5 w-3.5 text-zinc-400" />
              <span>{activeProject ? activeProject.name : 'All Projects'}</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {showProjectDropdown && (
              <div className="absolute top-10 left-0 w-52 border border-[#1f1f1f] bg-[#09090B] rounded-md shadow-2xl z-50 p-1 font-mono text-xs">
                <button
                  onClick={() => {
                    setActiveProjectId(null);
                    setShowProjectDropdown(false);
                    router.push('/dashboard/logs');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-sm hover:bg-[#18181B] text-zinc-300 hover:text-white transition-colors"
                >
                  All Projects
                </button>
                <div className="h-[1px] bg-[#1f1f1f] my-1" />
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setShowProjectDropdown(false);
                      router.push(`/project/${p.id}/logs`);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-sm hover:bg-[#18181B] transition-colors flex items-center gap-1.5 ${activeProject?.id === p.id ? 'bg-[#18181B] text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center Title */}
          <h2 className="text-xs font-bold font-mono tracking-widest text-[#FAFAFA] uppercase">Logs</h2>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex h-8 items-center gap-1.5 px-3 border rounded-md text-xs font-semibold transition-all cursor-pointer ${isLive
                ? 'bg-white text-black border-white'
                : 'bg-black text-zinc-400 border-[#1f1f1f] hover:text-white'
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-[#22C55E] animate-pulse' : 'bg-zinc-500'}`} />
              <span>Live</span>
            </button>

            <button
              onClick={() => toast.success('Reloading runtime edge feeds')}
              className="h-8 w-8 flex items-center justify-center border border-[#1f1f1f] bg-[#09090B] hover:bg-[#111113] text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => toast.success('Share link generated')}
              className="h-8 w-8 flex items-center justify-center border border-[#1f1f1f] bg-[#09090B] hover:bg-[#111113] text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer"
              title="Export"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Search Bar Row matching reference image */}
        <div className="p-4 border-b border-[#1f1f1f] flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border border-[#1f1f1f] bg-[#111113] rounded-md">
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111113] border border-[#1f1f1f] rounded-md h-9 pl-9 pr-3 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* 4. Timeline Slider Row matching reference image */}
        <div className="px-6 py-4 bg-[#111113]/40 border-b border-[#1f1f1f] select-none shrink-0 space-y-1">
          <div className="relative h-6 w-full font-mono text-[9px] text-zinc-600 flex justify-between items-center">
            <span>08:03:00</span>
            <span>08:10:40</span>
            <span>08:17:50</span>
            <span>08:25:00</span>
            <span>08:33:00</span>

            {/* Timeline Tick markings */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 border-b border-[#1f1f1f] flex justify-between">
              <span className="h-1.5 w-[1px] bg-[#1f1f1f]" />
              <span className="h-1 w-[1px] bg-[#1f1f1f]/50" />
              <span className="h-1.5 w-[1px] bg-[#1f1f1f]" />
              <span className="h-1 w-[1px] bg-[#1f1f1f]/50" />
              <span className="h-1.5 w-[1px] bg-[#1f1f1f]" />
            </div>

            {/* Range highlight overlay */}
            <div className="absolute bottom-0 left-[5%] right-[25%] h-1 border-b border-[#F59E0B]/80" />
            <div className="absolute bottom-[-2px] right-[25%] h-2.5 w-1 bg-white rounded-sm" />
          </div>
        </div>

        {/* 5. Logs Table Header */}
        <div className="px-6 py-2 bg-[#09090B] border-b border-[#1f1f1f]/60 grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono select-none shrink-0">
          <div className="col-span-2">Time</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Host</div>
          <div className="col-span-3">Request</div>
          <div className="col-span-4">Messages</div>
        </div>

        {/* 6. Realtime Log Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1f1f1f]/35 font-mono text-xs bg-[#09090B]">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No logs found matching your filters.
            </div>
          ) : (
            filteredLogs.map(log => {
              const isWarning = log.level === 'warning';
              const isError = log.level === 'error';

              let rowClass = "hover:bg-[#070707] transition-colors grid grid-cols-12 items-center px-6 py-2 ";
              if (isWarning) {
                rowClass += "bg-[#F59E0B]/5 hover:bg-[#F59E0B]/8 text-[#F59E0B]/90";
              } else if (isError) {
                rowClass += "bg-[#EF4444]/5 hover:bg-[#EF4444]/8 text-[#EF4444]/90";
              } else {
                rowClass += "text-zinc-300";
              }

              return (
                <div key={log.id} className={rowClass}>
                  {/* Time column */}
                  <div className="col-span-2 flex items-center gap-1.5 text-[10px]">
                    {isWarning && <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B]" />}
                    {isError && <AlertTriangle className="h-3.5 w-3.5 text-[#EF4444]" />}
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>

                  {/* Status column */}
                  <div className="col-span-1">
                    <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${log.status >= 500
                      ? 'bg-[#EF4444]/15 border border-[#EF4444]/25 text-[#EF4444]'
                      : log.status >= 400
                        ? 'bg-[#F59E0B]/15 border border-[#F59E0B]/25 text-[#F59E0B]'
                        : 'bg-[#22C55E]/15 border border-[#22C55E]/25 text-[#22C55E]'
                      }`}>
                      {log.status}
                    </span>
                  </div>

                  {/* Host column */}
                  <div className="col-span-2 truncate text-zinc-500 font-mono text-[10px] pr-2">
                    {log.host}
                  </div>

                  {/* Request column */}
                  <div className="col-span-3 truncate flex items-center gap-1 font-semibold">
                    <span className="text-[9px] px-1 border border-[#1f1f1f] bg-black/60 text-zinc-500 rounded-sm">f</span>
                    <span className="truncate">{log.request}</span>
                  </div>

                  {/* Message column */}
                  <div className="col-span-4 truncate text-xs text-zinc-400 font-mono">
                    {log.message && (
                      <span className="px-2 py-0.5 border border-[#1f1f1f] bg-black/50 text-[10px] text-zinc-300 rounded-md">
                        {log.message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* End indicator matching reference screenshot */}
          <div className="py-8 text-center select-none text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
            No more logs to show within selected timeline
          </div>
        </div>

      </div>

    </div>
  );
}

'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useStore, Project } from '../../store/store';
import {
  GitBranch,
  GitCommit,
  Clock,
  ChevronRight,
  ChevronDown,
  Copy,
  Download,
  Share2,
  FileText,
  Globe,
  ExternalLink,
  ArrowLeft,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const LazyLog = dynamic(
  () => import('react-lazylog').then((mod) => mod.LazyLog),
  { ssr: false, loading: () => <div className="p-4 text-xs font-mono text-[#71717A]">Initializing logs engine...</div> }
);

function FrameworkIcon({ framework }: { framework: string }) {
  switch (framework?.toLowerCase()) {
    case 'next.js':
    case 'nextjs':
      return (
        <svg className="h-4 w-4 text-white shrink-0" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="90" cy="90" r="90" fill="black"/>
          <path d="M149.508 157.52L69.142 54H54V126H68.307V73.685L138.835 163.666C142.613 161.802 146.185 159.739 149.508 157.52Z" fill="url(#dd-g1)"/>
          <rect x="115" y="54" width="15" height="72" fill="url(#dd-g1)"/>
          <defs>
            <linearGradient id="dd-g1" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      );
    case 'vite':
    case 'react':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient x1="90.07%" y1="17.44%" x2="13.5%" y2="78.77%" id="dd-g2">
              <stop stopColor="#41D1FF" offset="0%"/><stop stopColor="#BD34FE" offset="100%"/>
            </linearGradient>
          </defs>
          <path d="M192.52 28.56L102.6 222.03a4.7 4.7 0 0 1-8.52.2L12.56 50.1a4.7 4.7 0 0 1 5.92-6.52l167.36 41a4.7 4.7 0 0 1 6.68-6.02z" fill="url(#dd-g2)"/>
        </svg>
      );
    case 'go / docker':
    case 'go':
    case 'docker':
      return <svg className="h-4 w-4 text-[#2496ED] shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.983 11.078h2.119a.185.185 0 00.186-.185V9.006a.185.185 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185M23.99 12.49c-.24-.815-.97-1.354-1.743-1.354h-.29v1.2a1.44 1.44 0 01-1.44 1.44H1.616a1.44 1.44 0 01-1.44-1.44v-3.578H.15C.03 8.758 0 8.766 0 8.766v3.724c0 2.28 1.882 4.16 4.161 4.16h15.677c.186.006.368-.008.551-.031a6.99 6.99 0 005.618-4.13"/></svg>;
    default:
      return <Cpu className="h-4 w-4 text-zinc-400 shrink-0" />;
  }
}

interface DeploymentDetailProps {
  deploymentId: string;
  project?: Project;      // provided for project-scoped routes
  backHref: string;       // where Back button goes
}

export function DeploymentDetail({ deploymentId, project: initialProject, backHref }: DeploymentDetailProps) {
  const router = useRouter();
  const projects = useStore((s) => s.projects);
  const deployState = useStore((s) => s.deployState);
  const updateDeploymentStatus = useStore((s) => s.updateDeploymentStatus);

  const isDeploying = deployState.step !== 'ready' && deployState.step !== 'failed';

  const deployDomain = process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'nebula.dev';
  const isLocalhost = deployDomain.includes('localhost') || deployDomain.includes('hostmyidea.me');
  const protocol = isLocalhost ? 'http' : 'https';

  // Resolve the deployment across all projects
  const { targetDeployment, currentProject } = React.useMemo(() => {
    // Live simulator deployment
    if (deploymentId === 'dep-current-active' && initialProject) {
      return {
        targetDeployment: {
          id: deploymentId,
          status: isDeploying ? 'building' : 'ready',
          branch: initialProject.branch,
          commit: initialProject.lastCommit,
          latency: initialProject.latency,
          region: initialProject.region,
          updatedAt: new Date().toISOString(),
        } as any,
        currentProject: initialProject,
      };
    }

    // Scoped project search
    if (initialProject) {
      const dep = initialProject.deployments.find(d => d.id === deploymentId);
      return { targetDeployment: dep || null, currentProject: initialProject };
    }

    // Global search across all projects
    for (const p of projects) {
      const dep = p.deployments.find(d => d.id === deploymentId);
      if (dep) return { targetDeployment: dep, currentProject: p };
    }
    return { targetDeployment: null, currentProject: null };
  }, [deploymentId, initialProject, projects, isDeploying]);

  const [realtimeLogs, setRealtimeLogs] = React.useState<string[]>([]);
  const [deploymentStatus, setDeploymentStatus] = React.useState<string>('queued');

  React.useEffect(() => {
    if (targetDeployment?.status) {
      setDeploymentStatus(targetDeployment.status);
    }
  }, [targetDeployment?.status]);

  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (deploymentStatus !== 'queued' && deploymentStatus !== 'building') return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [deploymentStatus]);

  const { durationStr, timeAgoStr } = React.useMemo(() => {
    if (!targetDeployment) return { durationStr: 'N/A', timeAgoStr: '' };

    const created = new Date(targetDeployment.createdAt || targetDeployment.updatedAt);
    const updated = new Date(targetDeployment.updatedAt);
    const now = new Date();

    // 1. Calculate duration
    let durationMs = 0;
    if (deploymentStatus === 'queued' || deploymentStatus === 'building') {
      durationMs = now.getTime() - created.getTime();
    } else {
      durationMs = updated.getTime() - created.getTime();
    }

    if (durationMs < 0) durationMs = 0;
    const totalSecs = Math.floor(durationMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    // 2. Calculate time ago (relative to now)
    const diffMs = now.getTime() - created.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeAgoStr = 'just now';
    if (diffDays > 0) {
      timeAgoStr = `${diffDays}d ago`;
    } else if (diffHours > 0) {
      timeAgoStr = `${diffHours}h ago`;
    } else if (diffMins > 0) {
      timeAgoStr = `${diffMins}m ago`;
    } else if (diffSecs > 5) {
      timeAgoStr = `${diffSecs}s ago`;
    }

    return { durationStr, timeAgoStr };
  }, [targetDeployment, deploymentStatus, tick]);

  const authorName = targetDeployment?.commit?.author || 'System';
  const authorInitials = React.useMemo(() => {
    return authorName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'SYS';
  }, [authorName]);

  const formattedCreated = React.useMemo(() => {
    if (!targetDeployment) return '';
    const createdDate = new Date(targetDeployment.createdAt || targetDeployment.updatedAt);
    return `${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [targetDeployment]);

  React.useEffect(() => {
    if (!currentProject || !targetDeployment) return;

    let active = true;
    fetch(`/api/projects/${currentProject.id}/deployments/${targetDeployment.id}/logs`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load logs");
        return res.json();
      })
      .then((data) => {
        if (active && data.logs) {
          // split and filter empty lines (except single returns if wanted)
          const lines = data.logs.split('\n');
          setRealtimeLogs(lines);
        }
      })
      .catch((err) => {
        console.error("[Logs Fetch] Failed:", err.message);
      });

    return () => {
      active = false;
    };
  }, [currentProject?.id, targetDeployment?.id]);

  React.useEffect(() => {
    if (!currentProject || !targetDeployment) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:9002';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('Connected to Socket.io log server');
      socket.emit('subscribe', `logs:${currentProject.id}`);
    });

    socket.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message);
        if (parsed.deploymentId === targetDeployment.id) {
          if (parsed.log) {
            setRealtimeLogs((prev) => {
              if (prev.includes(parsed.log)) return prev;
              return [...prev, parsed.log];
            });
          }
          if (parsed.status) {
            setDeploymentStatus(parsed.status);
            updateDeploymentStatus(currentProject.id, targetDeployment.id, parsed.status as any);
            toast.success(`Deployment status updated: ${parsed.status.toUpperCase()}`);
          }
        }
      } catch (e) {
        setRealtimeLogs((prev) => {
          if (prev.includes(message)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io log server');
    });

    return () => {
      socket.emit('unsubscribe', `logs:${currentProject.id}`);
      socket.disconnect();
    };
  }, [currentProject?.id, targetDeployment?.id]);

  const [activeSubTab, setActiveSubTab] = React.useState('deployment');
  const [expandedSection, setExpandedSection] = React.useState<string | null>('logs');
  const [follow, setFollow] = React.useState(true);
  const [wordWrap, setWordWrap] = React.useState(true);

  const logsText = React.useMemo(() => {
    if (realtimeLogs.length > 0) {
      return realtimeLogs.join('\n');
    }
    if (targetDeployment && (targetDeployment.status === 'queued' || targetDeployment.status === 'building')) {
      return 'Silence is usually a good sign. Waiting for build logs stream...';
    }
    if (deploymentId === 'dep-current-active') {
      if (deployState.logs.length === 0) return 'Silence is usually a good sign. Deploy starting...';
      return deployState.logs.map(l =>
        `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.type.toUpperCase()}] ${l.text}`
      ).join('\n');
    }
    return `[18:05:10] [SYSTEM] Initializing deployment on Edge Worker v1.2...\n[18:05:11] [SYSTEM] Checking cache layers for lockfile resolution...\n[18:05:12] [STDOUT] pnpm-lock.yaml found. Resolving dependencies...\n[18:05:14] [STDOUT] Dependency resolution successful: fetched 104 pkgs.\n[18:05:15] [SYSTEM] Executing build scripts (next build)...\n[18:05:18] [STDOUT] ▲ Next.js compilation targets: client, server\n[18:05:22] [STDOUT] ✓ Compile client distribution targets.\n[18:05:25] [STDOUT] ✓ Routing mapping compiled: 14 dynamic pages.\n[18:05:28] [SYSTEM] Creating optimized CDN assets...\n[18:05:31] [SUCCESS] Deployment finished and routes synced.`;
  }, [deploymentId, deployState.logs, realtimeLogs, targetDeployment]);

  if (!targetDeployment || !currentProject) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-mono text-[#71717A]">
        Deployment <span className="text-white mx-1">{deploymentId}</span> not found.
      </div>
    );
  }

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  const handleCopyLogs = () => { navigator.clipboard.writeText(logsText); toast.success('Logs copied to clipboard'); };
  const handleDownloadLogs = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([logsText], { type: 'text/plain' }));
    a.download = `${currentProject.name}-build-logs.txt`;
    document.body.appendChild(a); a.click();
    toast.success('Downloading logs file');
  };

  return (
    <div className="space-y-6">

      {/* Sub-tab nav + Back button */}
      <div className="border-b border-border bg-surface flex items-center justify-between px-6 pt-1">
        <div className="flex gap-1">
          {['Deployment', 'Logs', 'Source', 'Open Graph'].map((label) => {
            const id = label.toLowerCase().replace(' ', '');
            return (
              <button
                key={id}
                onClick={() => { setActiveSubTab(id); if (id === 'logs') setExpandedSection('logs'); }}
                className={`px-3 py-1.5 text-xs font-mono border-b-2 transition-all cursor-pointer ${
                  activeSubTab === id
                    ? 'border-foreground text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => router.push(backHref)}
          className="text-xs text-muted-foreground hover:text-foreground font-mono flex items-center gap-1.5 py-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Deployments
        </button>
      </div>

      <div className="px-6 space-y-6 max-w-5xl mx-auto w-full pb-8">

        {/* Header toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FrameworkIcon framework={currentProject.framework} />
            <h2 className="text-sm font-semibold text-foreground font-mono">
              {currentProject.name} / Deployment Details
            </h2>
          </div>
          <button
            onClick={() => toast.success('Share link generated')}
            className="flex h-7 items-center gap-1.5 border border-border hover:bg-accent px-3 text-[11px] font-mono text-muted-foreground hover:text-foreground rounded-sm transition-colors cursor-pointer"
          >
            <Share2 className="h-3 w-3" /><span>Share</span>
          </button>
        </div>

        {/* Detail panel */}
        {activeSubTab === 'deployment' && (
          <>
            <div className="border border-border bg-surface p-4 rounded-md grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left: real iframe browser preview */}
              <div className="lg:col-span-1 border border-border bg-background rounded-sm h-[180px] flex flex-col relative overflow-hidden group select-none">
                {/* Browser Top Bar */}
                <div className="flex justify-between items-center px-3 py-1.5 border-b border-border bg-surface h-8 shrink-0">
                  <div className="flex gap-1 s-hrink-0">
                    <span className="h-1.5 w-1.5 bg-[#EF4444] rounded-full" />
                    <span className="h-1.5 w-1.5 bg-[#F59E0B] rounded-full" />
                    <span className="h-1.5 w-1.5 bg-[#22C55E] rounded-full" />
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground truncate max-w-[120px]">
                    {currentProject.name}.{deployDomain}
                  </span>
                  <div className="w-3" />
                </div>
                {/* Live Preview Iframe Container */}
                <div className="flex-1 relative bg-zinc-950 overflow-hidden">
                  {deploymentStatus === 'ready' ? (
                    <iframe
                      src={`${protocol}://${currentProject.id}.${deployDomain}`}
                      className="absolute inset-0 border-0 pointer-events-none"
                      scrolling="no"
                      style={{ 
                        width: '400%', 
                        height: '400%', 
                        transform: 'scale(0.25)', 
                        transformOrigin: 'top left',
                        overflow: 'hidden'
                      }}
                      title="Website Snapshot"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-1">
                      <span className="h-2 w-2 bg-[#F59E0B] rounded-full animate-pulse" />
                      <p className="text-[10px] text-zinc-500 font-mono">Waiting for deployment to be ready...</p>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <a
                    href={`${protocol}://${currentProject.id}.${deployDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150 cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-white flex items-center gap-1.5">
                      Visit Deployment <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                </div>
              </div>

              {/* Right: metadata grid */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4 text-xs font-mono">

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Created</span>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <span className="h-4 w-4 rounded-full bg-border flex items-center justify-center text-[8px] font-bold text-foreground">
                      {authorInitials}
                    </span>
                    <span>{authorName}</span>
                    <span className="text-muted-foreground">{formattedCreated}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Status</span>
                  <div className="flex items-center gap-1.5">
                    {deploymentStatus === 'queued' && (
                      <>
                        <span className="h-2 w-2 bg-zinc-500 rounded-full animate-pulse" />
                        <span className="text-zinc-500 font-semibold">Queued</span>
                      </>
                    )}
                    {deploymentStatus === 'building' && (
                      <>
                        <span className="h-2 w-2 bg-[#F59E0B] rounded-full animate-pulse" />
                        <span className="text-[#F59E0B] font-semibold">Building</span>
                      </>
                    )}
                    {deploymentStatus === 'ready' && (
                      <>
                        <span className="h-2 w-2 bg-[#22C55E] rounded-full" />
                        <span className="text-[#22C55E] font-semibold">Ready</span>
                        <span className="text-[9px] bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-1 rounded-sm">Latest</span>
                      </>
                    )}
                    {deploymentStatus === 'failed' && (
                      <>
                        <span className="h-2 w-2 bg-[#EF4444] rounded-full" />
                        <span className="text-[#EF4444] font-semibold">Failed</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Duration</span>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{durationStr}</span>
                    {timeAgoStr && <span className="text-muted-foreground">{timeAgoStr}</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Environment</span>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Production</span>
                  </div>
                </div>

                <div className="col-span-2 space-y-1 border-t border-border pt-2">
                  <span className="text-[10px] text-muted-foreground block">Domains</span>
                  <div className="flex items-center gap-2 text-foreground">
                    <a href={`${protocol}://${currentProject.id}.${deployDomain}`} target="_blank" className="hover:underline flex items-center gap-1">
                      {currentProject.id}.{deployDomain} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                    <span className="text-[9px] font-mono border border-border px-1 bg-surface text-muted-foreground rounded-sm">+2</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{currentProject.name}-git-main.nebula.app</p>
                </div>

                <div className="col-span-2 space-y-1 border-t border-border pt-2">
                  <span className="text-[10px] text-muted-foreground block">Source</span>
                  <div className="flex items-center gap-2 text-foreground">
                    <span className="flex items-center gap-0.5">
                      <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                      {targetDeployment.branch}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 truncate max-w-[300px]">
                      <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{targetDeployment.commit.hash.substring(0, 7)}</span>
                      <span>{targetDeployment.commit.message}</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Accordion sections */}
            <div className="border border-border bg-surface rounded-md divide-y divide-border overflow-hidden">

              <div>
                <button
                  onClick={() => toggleSection('settings')}
                  className="flex items-center justify-between w-full px-4 py-3 font-mono hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    {expandedSection === 'settings' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span>Deployment Settings</span>
                    <span className="text-[9px] bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 px-1 rounded-sm font-semibold">
                      3 Recommendations
                    </span>
                  </div>
                </button>
                {expandedSection === 'settings' && (
                  <div className="p-4 bg-surface text-xs font-mono text-muted-foreground space-y-2">
                    <p>• Enable Node.js version 22 execution framework (Recommended)</p>
                    <p>• Upgrade memory limit preset size to 1024MB (Recommended)</p>
                    <p>• Implement lazy route chunk compilation (Recommended)</p>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('logs')}
                  className="flex items-center justify-between w-full px-4 py-3 font-mono hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    {expandedSection === 'logs' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span>Build Logs</span>
                  </div>
                </button>
                {expandedSection === 'logs' && (
                  <div className="p-4 bg-surface space-y-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-mono">Live compilation terminal</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFollow(!follow)}
                          className={`px-2 py-0.5 border rounded-sm text-[10px] font-mono cursor-pointer transition-colors ${follow ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' : 'border-border text-muted-foreground'}`}
                        >Follow</button>
                        <button
                          onClick={() => setWordWrap(!wordWrap)}
                          className={`px-2 py-0.5 border rounded-sm text-[10px] font-mono cursor-pointer transition-colors ${wordWrap ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]' : 'border-border text-muted-foreground'}`}
                        >Wrap</button>
                      </div>
                    </div>
                    <div className="h-80 w-full rounded border border-border overflow-hidden text-xs">
                      <LazyLog text={logsText} stream follow={follow} wordWrap={wordWrap} extraLines={1} style={{ background: '#09090B', color: '#e4e4e7' }} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleCopyLogs} className="flex h-7 items-center gap-1 border border-border hover:bg-accent px-3 text-[10px] font-mono text-foreground rounded-sm cursor-pointer">
                        <Copy className="h-3 w-3" /><span>Copy Logs</span>
                      </button>
                      <button onClick={handleDownloadLogs} className="flex h-7 items-center gap-1 border border-border hover:bg-accent px-3 text-[10px] font-mono text-foreground rounded-sm cursor-pointer">
                        <Download className="h-3 w-3" /><span>Download Logs</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </>
        )}

        {activeSubTab === 'logs' && (
          <div className="border border-border bg-surface p-4 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-mono">Live compilation terminal</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFollow(!follow)}
                  className={`px-2 py-0.5 border rounded-sm text-[10px] font-mono cursor-pointer transition-colors ${follow ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' : 'border-border text-muted-foreground'}`}
                >Follow</button>
                <button
                  onClick={() => setWordWrap(!wordWrap)}
                  className={`px-2 py-0.5 border rounded-sm text-[10px] font-mono cursor-pointer transition-colors ${wordWrap ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]' : 'border-border text-muted-foreground'}`}
                >Wrap</button>
              </div>
            </div>
            <div className="h-[450px] w-full rounded border border-border overflow-hidden text-xs">
              <LazyLog text={logsText} stream follow={follow} wordWrap={wordWrap} extraLines={1} style={{ background: '#09090B', color: '#e4e4e7' }} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopyLogs} className="flex h-7 items-center gap-1 border border-border hover:bg-accent px-3 text-[10px] font-mono text-foreground rounded-sm cursor-pointer">
                <Copy className="h-3 w-3" /><span>Copy Logs</span>
              </button>
              <button onClick={handleDownloadLogs} className="flex h-7 items-center gap-1 border border-border hover:bg-accent px-3 text-[10px] font-mono text-foreground rounded-sm cursor-pointer">
                <Download className="h-3 w-3" /><span>Download Logs</span>
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'source' && (
          <div className="border border-border bg-surface p-6 rounded-md space-y-6">
            <h3 className="text-sm font-semibold text-foreground font-mono border-b border-border pb-2">Commit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Repository</span>
                  <span className="text-foreground font-semibold">{currentProject.name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Branch</span>
                  <span className="text-foreground flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                    {targetDeployment.branch}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Commit</span>
                  <span className="text-foreground flex items-center gap-1">
                    <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{(targetDeployment.commit.hash || '').substring(0, 7)}</span>
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Author</span>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <span>{targetDeployment.commit.author}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Commit Message</span>
                  <span className="text-foreground block bg-background p-2 border border-border rounded-sm max-w-lg">
                    {targetDeployment.commit.message}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'opengraph' && (
          <div className="border border-border bg-surface p-6 rounded-md space-y-6">
            <h3 className="text-sm font-semibold text-foreground font-mono border-b border-border pb-2">Open Graph Preview</h3>
            <div className="max-w-md border border-border bg-background rounded-md overflow-hidden shadow-lg select-none">
              {/* Mock OG Image Card */}
              <div className="h-48 bg-gradient-to-tr from-surface via-surface-hover to-border flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-3 left-3 bg-surface border border-border px-2 py-0.5 rounded-sm text-[8px] font-mono text-muted-foreground">
                  NEBULA PREVIEW
                </div>
                <FrameworkIcon framework={currentProject.framework} />
                <h4 className="text-sm font-bold text-foreground font-mono mt-3">{currentProject.name}</h4>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">deployed at {currentProject.name}.{deployDomain}</p>
              </div>
              {/* OG Metadata details */}
              <div className="p-4 space-y-2 border-t border-border font-sans">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">og:url</p>
                <p className="text-xs text-blue-400 font-medium truncate">{protocol}://${currentProject.name}.${deployDomain}</p>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider pt-1">og:title</p>
                <p className="text-xs text-foreground font-semibold">{currentProject.name} - Production Deployment</p>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider pt-1">og:description</p>
                <p className="text-xs text-muted-foreground">Successfully built and deployed on Nebula Edge Worker Network.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

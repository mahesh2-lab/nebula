'use client';

import * as React from 'react';
import { useStore } from '@/store/store';
import type { Project } from '@/store/store';
import { mapDbProjectToStoreProject } from '@/lib/db/mappers';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Search,
  Github,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';

function FrameworkIcon({ framework }: { framework: string }) {
  switch (framework.toLowerCase()) {
    case 'next.js':
    case 'nextjs':
      return (
        <svg className="h-5 w-5 text-white shrink-0" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="90" cy="90" r="90" fill="black" />
          <path d="M149.508 157.52L69.142 54H54V126H68.307V73.685L138.835 163.666C142.613 161.802 146.185 159.739 149.508 157.52Z" fill="url(#nextjs-grad)" />
          <rect x="115" y="54" width="15" height="72" fill="url(#nextjs-grad)" />
          <defs>
            <linearGradient id="nextjs-grad" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'vite':
    case 'react':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient x1="90.07%" y1="17.44%" x2="13.5%" y2="78.77%" id="vite-g1">
              <stop stopColor="#41D1FF" offset="0%" />
              <stop stopColor="#BD34FE" offset="100%" />
            </linearGradient>
            <linearGradient x1="68.22%" y1="36.87%" x2="25.56%" y2="82.49%" id="vite-g2">
              <stop stopColor="#FFEA79" offset="0%" />
              <stop stopColor="#FFAD1F" offset="38.7%" />
              <stop stopColor="#B30000" offset="100%" />
            </linearGradient>
          </defs>
          <path d="M192.52 28.56L102.6 222.03a4.7 4.7 0 0 1-8.52.2L12.56 50.1a4.7 4.7 0 0 1 5.92-6.52l167.36 41a4.7 4.7 0 0 1 6.68-6.02z" fill="url(#vite-g1)" />
          <path d="M243.44 95.8L153.52 289.28a4.7 4.7 0 0 1-8.52.2L63.48 117.35a4.7 4.7 0 0 1 5.92-6.52l167.36 41a4.7 4.7 0 0 1 6.68-6.02z" fill="url(#vite-g2)" transform="scale(0.85) translate(20, 20)" />
        </svg>
      );
    case 'go / docker':
    case 'go':
    case 'docker':
      return (
        <svg className="h-5 w-5 text-[#2496ED] shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.983 11.078h2.119c.102 0 .186-.083.186-.185V9.006a.185.185 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118c.103 0 .185-.083.185-.186V3.574a.186.186 0 00-.185-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118c.103 0 .185-.083.185-.186V6.29a.185.185 0 00-.185-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12c.102 0 .185-.083.185-.186V6.29a.185.185 0 00-.185-.185H8.099a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 2.715h2.119c.102 0 .185-.083.185-.185V9.006a.186.186 0 00-.185-.186h-2.119a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m-2.92 0h2.12c.102 0 .185-.083.185-.185V9.006a.186.186 0 00-.185-.186H2.214a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185m-2.93 0h2.12c.102 0 .185-.083.185-.185V9.006a.185.185 0 00-.185-.186h-2.12a.185.185 0 00-.184.186v1.888c0 .102.083.185.185.185m5.85 2.716h2.118c.103 0 .185-.083.185-.186v-1.886a.186.186 0 00-.185-.186H8.099a.186.186 0 00-.185.186v1.886c0 .103.082.186.185.186m-2.93 0h2.12c.102 0 .185-.083.185-.186v-1.886a.186.186 0 00-.185-.186H5.17a.185.185 0 00-.185.186v1.886c0 .103.083.186.185.186m-2.964 0h2.119c.102 0 .185-.083.185-.186v-1.886a.186.186 0 00-.185-.186h-2.119a.185.185 0 00-.186.186v1.886c0 .103.084.186.186.186m-2.92 0h2.12c.102 0 .185-.083.185-.186v-1.886a.185.185 0 00-.185-.186H2.214a.185.185 0 00-.185.186v1.886c0 .103.083.186.185.186M23.99 12.49c-.24-.815-.97-1.354-1.743-1.354h-.29v1.2a1.44 1.44 0 01-1.44 1.44H1.616a1.44 1.44 0 01-1.44-1.44v-3.578H.15C.03 8.758 0 8.766 0 8.766v3.724c0 2.28 1.882 4.16 4.161 4.16h15.677c.186.006.368-.008.551-.031a6.99 6.99 0 005.618-4.13" />
        </svg>
      );
    case 'python':
    case 'python / fastapi':
    case 'python / docker':
      return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-67.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.2v30.7c0 29.2 25 54.2 53.4 54.2h11.6v-39.7c0-30.6 25-55.6 55.6-55.6h108.3c30.6 0 55.6-25 55.6-55.6v-49.9zm-299.7 11h-11.6c-29.2 0-54.2 25-54.2 54.2v49.9c0 30.9 14.5 54.2 45.6 54.2h40.1v-47.4c0-36.8 31.2-67.8 67.8-67.8h105.8c29.2 0 54.2-25 54.2-54.2v-30.7c0-29.2-25-54.2-54.2-54.2h-11.6v39.7c0 30.6-25 55.6-55.6 55.6H195.7c-30.6 0-55.6 25-55.6 55.6v49.9z" fill="url(#python-grad)" />
          <defs>
            <linearGradient id="python-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#3776AB" offset="0%" />
              <stop stopColor="#FFD343" offset="100%" />
            </linearGradient>
          </defs>
        </svg>
      );
    default:
      return <Cpu className="h-5 w-5 text-zinc-400 shrink-0" />;
  }
}

function ProjectSkeletonCard({ animate = false }: { animate?: boolean }) {
  return (
    <div className={`border border-[#1f1f1f] bg-[#111113] p-4 rounded-md h-36 flex flex-col justify-between ${animate ? 'animate-pulse' : ''}`}>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`h-5 w-5 rounded-full ${animate ? 'bg-zinc-800/40' : 'bg-zinc-800'}`} />
            <div className={`h-4 w-28 rounded ${animate ? 'bg-zinc-800/40' : 'bg-zinc-800'}`} />
          </div>
          <div className={`h-4 w-12 rounded ${animate ? 'bg-zinc-800/40' : 'bg-zinc-800'}`} />
        </div>
        <div className={`h-3 w-32 rounded ${animate ? 'bg-zinc-800/40' : 'bg-zinc-800'}`} />
      </div>
      <div className="border-t border-[#1f1f1f]/50 pt-3 flex justify-between items-center">
        <div className={`h-3.5 w-32 rounded ${animate ? 'bg-zinc-800/40' : 'bg-zinc-800'}`} />
        <div className={`h-3 w-16 rounded ${animate ? 'bg-zinc-800/40' : 'bg-zinc-800'}`} />
      </div>
    </div>
  );
}

// Handled via shared mapping utility

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: session } = useSession();
  const router = useRouter();
  const projects = useStore((s) => s.projects);
  const setProjects = useStore((s) => s.setProjects);
  const [projectsLoading, setProjectsLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadProjects() {
      setProjectsLoading(true);
      try {
        const res = await fetch('/api/projects');
        console.log(res);
        if (!res.ok) {
          throw new Error(`Failed to fetch projects: ${res.statusText}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map(mapDbProjectToStoreProject);
          setProjects(mapped);
        }
      } catch (err: any) {
        console.error('Failed to load projects:', err);
        toast.error(err.message || 'Failed to load projects');
      } finally {
        setProjectsLoading(false);
      }
    }

    loadProjects();
  }, [setProjects]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);

  React.useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
    }
    loadAnalytics();
  }, [projects]);



  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />;
      case 'building':
        return <span className="h-2.5 w-2.5 bg-[#F59E0B] rounded-full animate-ping" />;
      case 'failed':
        return <XCircle className="h-3.5 w-3.5 text-[#EF4444]" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-[#71717A]" />;
    }
  };

  const filteredProjects = React.useMemo(() => {
    if (!searchQuery.trim()) return projects;
    return projects.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.repository.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono text-[#71717A]">ACTIVE CONTAINERS</p>
          <p className="text-lg font-mono font-bold text-white">{projects.length}</p>
        </div>
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono text-[#71717A]">GLOBAL EDGE POPs</p>
          <p className="text-lg font-mono font-bold text-[#22C55E]">
            {analyticsData?.regions?.length || (projects.length > 0 ? 1 : 0)} online
          </p>
        </div>
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono text-[#71717A]">MONTHLY TRAFFIC</p>
          <p className="text-lg font-mono font-bold text-white">
            {analyticsData?.requestsUsed ? `${analyticsData.requestsUsed.toFixed(2)}M` : '0.00M'} reqs
          </p>
        </div>
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono text-[#71717A]">BUILD QUEUE STATUS</p>
          <p className={`text-lg font-mono font-bold ${projects.some(p => p.status === 'building' || p.deployments.some(d => d.status === 'building')) ? 'text-[#F59E0B] animate-pulse' : 'text-white'}`}>
            {projects.some(p => p.status === 'building' || p.deployments.some(d => d.status === 'building')) ? 'Active' : 'Idle'}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono font-bold">Projects</h3>
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#71717A]" />
          <input
            type="text"
            placeholder="Filter projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-[#1f1f1f] bg-[#111113] text-xs font-mono text-[#FAFAFA] placeholder:text-[#71717A] rounded-sm outline-none focus:border-white transition-colors w-60"
          />
        </div>
      </div>

      {projectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <ProjectSkeletonCard key={i} animate />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="border border-[#1f1f1f] p-8 text-center text-xs font-mono text-[#71717A] rounded-md">
          No projects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => router.push(`/project/${proj.id}`)}
              className="border border-[#1f1f1f] bg-[#111113] hover:bg-[#18181B] p-4 rounded-md cursor-pointer transition-colors space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FrameworkIcon framework={proj.framework} />
                    <h4 className="text-sm font-semibold text-white hover:underline">{proj.name}</h4>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-[#A1A1AA] font-mono">
                    {getStatusIcon(proj.status)}
                  </span>
                </div>
                <a
                  href={`http://${proj.id}.${process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'nebula.dev'}`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-[#A1A1AA] hover:text-white flex items-center gap-1 font-mono"
                >
                  {proj.id}.{process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'nebula.dev'} <ExternalLink className="h-3 w-3 text-[#71717A]" />
                </a>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#71717A] font-mono border-t border-[#1f1f1f]/50 pt-3 mt-2">
                <span className="flex items-center gap-1 truncate max-w-[160px]">
                  <Github className="h-3.5 w-3.5 shrink-0" />
                  {proj.repository.replace('github.com/', '')}
                </span>
                <span>•</span>
                <span>{proj.branch}</span>
                <span className="ml-auto text-[10px] text-[#71717A]">
                  {new Date(proj.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}



    </div>
  );
}

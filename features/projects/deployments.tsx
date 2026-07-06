'use client';

import * as React from 'react';
import { Project, useStore, Deployment } from '../../store/store';
import { useRouter } from 'next/navigation';
import { 
  GitBranch, 
  Play, 
  Cpu
} from 'lucide-react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { DeploymentsSkeleton } from '@/components/ui/skeleton';

function FrameworkIcon({ framework }: { framework: string }) {
  switch (framework?.toLowerCase()) {
    case 'next.js':
    case 'nextjs':
      return (
        <svg className="h-4 w-4 text-white shrink-0" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="90" cy="90" r="90" fill="black"/>
          <path d="M149.508 157.52L69.142 54H54V126H68.307V73.685L138.835 163.666C142.613 161.802 146.185 159.739 149.508 157.52Z" fill="url(#nextjs-grad-dep)"/>
          <rect x="115" y="54" width="15" height="72" fill="url(#nextjs-grad-dep)"/>
          <defs>
            <linearGradient id="nextjs-grad-dep" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
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
            <linearGradient x1="90.07%" y1="17.44%" x2="13.5%" y2="78.77%" id="vite-g1-dep">
              <stop stopColor="#41D1FF" offset="0%"/><stop stopColor="#BD34FE" offset="100%"/>
            </linearGradient>
          </defs>
          <path d="M192.52 28.56L102.6 222.03a4.7 4.7 0 0 1-8.52.2L12.56 50.1a4.7 4.7 0 0 1 5.92-6.52l167.36 41a4.7 4.7 0 0 1 6.68-6.02z" fill="url(#vite-g1-dep)"/>
        </svg>
      );
    case 'go / docker':
    case 'go':
    case 'docker':
      return <svg className="h-4 w-4 text-[#2496ED] shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.983 11.078h2.119a.185.185 0 00.186-.185V9.006a.185.185 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185M23.99 12.49c-.24-.815-.97-1.354-1.743-1.354h-.29v1.2a1.44 1.44 0 01-1.44 1.44H1.616a1.44 1.44 0 01-1.44-1.44v-3.578H.15C.03 8.758 0 8.766 0 8.766v3.724c0 2.28 1.882 4.16 4.161 4.16h15.677c.186.006.368-.008.551-.031a6.99 6.99 0 005.618-4.13"/></svg>;
    case 'python':
    case 'python / fastapi':
    case 'python / docker':
      return (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-67.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.2v30.7c0 29.2 25 54.2 53.4 54.2h11.6v-39.7c0-30.6 25-55.6 55.6-55.6h108.3c30.6 0 55.6-25 55.6-55.6v-49.9zm-299.7 11h-11.6c-29.2 0-54.2 25-54.2 54.2v49.9c0 30.9 14.5 54.2 45.6 54.2h40.1v-47.4c0-36.8 31.2-67.8 67.8-67.8h105.8c29.2 0 54.2-25 54.2-54.2v-30.7c0-29.2-25-54.2-54.2-54.2h-11.6v39.7c0 30.6-25 55.6-55.6 55.6H195.7c-30.6 0-55.6 25-55.6 55.6v49.9z" fill="url(#python-grad-dep)"/>
          <defs>
            <linearGradient id="python-grad-dep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#3776AB" offset="0%"/><stop stopColor="#FFD343" offset="100%"/>
            </linearGradient>
          </defs>
        </svg>
      );
    default:
      return <Cpu className="h-4 w-4 text-zinc-400 shrink-0" />;
  }
}

const getStatusBadge = (status: Deployment['status']) => {
  switch (status) {
    case 'ready':
      return <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">READY</span>;
    case 'building':
      return <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 animate-pulse">BUILDING</span>;
    case 'failed':
      return <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">FAILED</span>;
    default:
      return <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#71717A]/10 text-[#71717A] border border-[#71717A]/20">QUEUED</span>;
  }
};

export function Deployments({ project: initialProject, onTabChange }: { project?: Project; onTabChange?: (tab: string) => void }) {
  const router = useRouter();
  const projects = useStore((s) => s.projects);
  const setProjects = useStore((s) => s.setProjects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const activeProject = initialProject || projects.find(p => p.id === activeProjectId);

  const updateDeploymentStatus = useStore((s) => s.updateDeploymentStatus);

  const [loading, setLoading] = React.useState(!activeProject && projects.length === 0);

  React.useEffect(() => {
    // If activeProject is resolved or projects already exist, we don't need to load
    if (activeProject || projects.length > 0) {
      setLoading(false);
      return;
    }

    async function loadProjects() {
      setLoading(true);
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const { mapDbProjectToStoreProject } = await import('@/lib/db/mappers');
            const mapped = data.map(mapDbProjectToStoreProject);
            setProjects(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load projects in Deployments component:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [activeProject, projects.length, setProjects]);

  React.useEffect(() => {
    if (!activeProject) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:9002';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      socket.emit('subscribe', `logs:${activeProject.id}`);
    });

    socket.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message);
        if (parsed.status && parsed.deploymentId) {
          updateDeploymentStatus(activeProject.id, parsed.deploymentId, parsed.status);
        }
      } catch (e) {
        // Ignore non-JSON logs
      }
    });

    return () => {
      socket.emit('unsubscribe', `logs:${activeProject.id}`);
      socket.disconnect();
    };
  }, [activeProject?.id, updateDeploymentStatus]);

  const allDeployments = React.useMemo(() => {
    if (activeProject) {
      return activeProject.deployments.map(d => ({ ...d, project: activeProject }));
    }
    const list: any[] = [];
    projects.forEach(p => p.deployments.forEach(d => list.push({ ...d, project: p })));
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [activeProject, projects]);



  // Navigate to the correct detail page based on context
  const handleInspect = (dep: any) => {
    if (activeProject) {
      router.push(`/project/${activeProject.id}/deployments/${dep.id}`);
    } else {
      router.push(`/dashboard/deployments/${dep.id}`);
    }
  };

  if (loading) {
    return <DeploymentsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">

      {/* Deployments table */}
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-[#18181B] border-b border-[#1f1f1f] flex items-center gap-2">
          {activeProject && <FrameworkIcon framework={activeProject.framework} />}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">
            {activeProject ? `${activeProject.name} Deploy History` : 'Workspace Deploy History'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f1f1f] bg-[#09090B]/60 text-[10px] font-mono text-[#71717A] uppercase">
                {!activeProject && <th className="p-3">Project</th>}
                <th className="p-3">Deployment ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Commit</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Region</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allDeployments.length === 0 ? (
                <tr>
                  <td colSpan={activeProject ? 8 : 9} className="p-12 text-center text-zinc-500 font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-10 w-10 rounded-full border border-dashed border-[#1f1f1f] bg-[#09090B] flex items-center justify-center text-zinc-400">
                        <Play className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold text-white">No deployments found</p>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        {activeProject 
                          ? "This project has not been deployed yet. Trigger a build to get started." 
                          : "Connect a repository and trigger a build to see your deployment history."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                allDeployments.map((dep) => (
                  <tr
                    key={dep.id}
                    className="hover:bg-[#18181B]/35 border-b border-[#1f1f1f]/50 transition-colors text-xs font-mono text-[#71717A] cursor-pointer"
                    onClick={() => handleInspect(dep)}
                  >
                    {!activeProject && (
                      <td className="p-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <FrameworkIcon framework={dep.project.framework} />
                          <span>{dep.project.name}</span>
                        </div>
                      </td>
                    )}
                    <td className="p-3 text-zinc-300 font-semibold">{dep.id}</td>
                    <td className="p-3">{getStatusBadge(dep.status)}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-[#71717A]" />
                        {dep.branch}
                      </span>
                    </td>
                    <td className="p-3 max-w-[200px] truncate">
                      <span className="text-[#A1A1AA] font-semibold">{dep.commit.hash}</span>
                      <span className="mx-1 text-[#1f1f1f]">|</span>
                      <span>{dep.commit.message}</span>
                    </td>
                    <td className="p-3 text-zinc-300">{dep.latency}</td>
                    <td className="p-3 text-zinc-400">{dep.region}</td>
                    <td className="p-3 text-zinc-400">
                      <div>{new Date(dep.createdAt || dep.updatedAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-[#71717A]">{new Date(dep.createdAt || dep.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleInspect(dep)}
                        className="px-2.5 py-1 border border-[#1f1f1f] hover:bg-[#09090B] hover:text-[#FAFAFA] rounded-sm text-[#A1A1AA] transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

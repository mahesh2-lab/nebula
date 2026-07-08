'use client';

import * as React from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/store';
import { mapDbProjectToStoreProject } from '@/lib/db/mappers';
import { SidebarLayout } from '@/components/layouts/sidebar-layout';
import { ChevronRight } from 'lucide-react';
import { ProjectLayoutSkeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const projectId = params?.projectId as string;
  
  const projects = useStore((s) => s.projects);
  const setProjects = useStore((s) => s.setProjects);
  const project = projects.find(p => p.id === projectId);
  const inspectedDeploymentId = useStore((s) => s.inspectedDeploymentId);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);

  const [loading, setLoading] = React.useState(projects.length === 0 || !projects.some(p => p.id === projectId));

  React.useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map(mapDbProjectToStoreProject);
            setProjects(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }

    if (projects.length === 0 || !projects.some(p => p.id === projectId)) {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [projects.length, projectId, setProjects]);

  React.useEffect(() => {
    if (projectId) {
      setActiveProjectId(projectId);
    }
    return () => {
      setActiveProjectId(null);
    };
  }, [projectId, setActiveProjectId]);

  const activeTab = pathname ? (pathname.split('/').pop() === projectId ? 'overview' : pathname.split('/').pop() || 'overview') : 'overview';
  const isLogsPage = pathname ? (pathname.endsWith('/logs') || pathname.includes('/logs')) : false;

  if (loading) {
    return (
      <SidebarLayout 
        hideSidebar={isLogsPage}
        activeTab={activeTab === 'overview' ? 'overview' : activeTab} 
        setActiveTab={() => {}}
        onCreateProjectClick={() => {}}
      >
        <ProjectLayoutSkeleton />
      </SidebarLayout>
    );
  }

  if (!project) {
    return (
      <SidebarLayout 
        activeTab="projects" 
        setActiveTab={(tab) => {
          if (tab === 'projects') router.push('/dashboard');
          else router.push(`/dashboard/${tab}`);
        }}
        onCreateProjectClick={() => {
          router.push('/new');
        }}
      >
        <div className="p-12 text-center text-xs font-mono text-[#71717A] flex flex-col items-center justify-center space-y-4">
          <p className="text-sm text-zinc-200">Project Not Found</p>
          <p className="text-zinc-500 max-w-sm">This project doesn't exist, was deleted, or belongs to another user. Maybe it's time to start fresh?</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 border border-zinc-700 bg-zinc-900 hover:bg-white hover:text-black hover:border-white text-zinc-300 rounded-sm font-bold cursor-pointer transition-all duration-200"
          >
            Go Back to Dashboard
          </button>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout 
      hideSidebar={isLogsPage}
      activeTab={activeTab === 'overview' ? 'overview' : activeTab} 
      setActiveTab={(tab) => {
        const globalOnlyTabs = ['projects', 'cli', 'billing', 'user-settings', 'team', 'api-keys', 'notifications'];
        if (tab === 'overview') {
          router.push(`/project/${projectId}`);
        } else if (globalOnlyTabs.includes(tab)) {
          if (tab === 'projects') router.push('/dashboard');
          else router.push(`/dashboard/${tab}`);
        } else {
          router.push(`/project/${projectId}/${tab}`);
        }
      }}
      onCreateProjectClick={() => {
        router.push('/dashboard?import=true');
      }}
    >
      <div className="flex flex-col h-full">
        {/* Inner project header tabs */}
        {!inspectedDeploymentId && !isLogsPage && (
          <div className="px-6 border-b border-[#1f1f1f] bg-surface flex items-center justify-between">
            <div className="flex flex-wrap gap-1 pt-2 max-w-5xl mx-auto w-full">
              {[
                { id: 'overview', label: 'Overview', path: `/project/${projectId}` },
                { id: 'deployments', label: 'Deployments', path: `/project/${projectId}/deployments` },
                { id: 'logs', label: 'Logs', path: `/project/${projectId}/logs` },
                { id: 'domains', label: 'Domains', path: `/project/${projectId}/domains` },
                { id: 'analytics', label: 'Analytics', path: `/project/${projectId}/analytics` },
                { id: 'env', label: 'Secrets', path: `/project/${projectId}/env` },
                { id: 'settings', label: 'Settings', path: `/project/${projectId}/settings` }
              ].map((tab) => {
                const isActive = (tab.id === 'overview' && pathname === `/project/${projectId}`) || 
                                 (tab.id !== 'overview' && pathname.startsWith(tab.path));
                return (
                  <Link
                    key={tab.id}
                    href={tab.path}
                    className={`px-3 py-2 text-xs font-mono border-b-2 transition-all ${
                      isActive 
                        ? 'border-foreground text-foreground font-semibold' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
            <Link 
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground font-mono flex items-center gap-1 py-2 pr-6 shrink-0"
            >
              Dashboard <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className={`flex-1 w-full ${isLogsPage ? '' : 'max-w-5xl mx-auto'}`}>
          {children}
        </div>
      </div>
    </SidebarLayout>
  );
}

'use client';

import * as React from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/store';
import { mapDbProjectToStoreProject } from '@/lib/db/mappers';
import { SidebarLayout } from '@/components/layouts/sidebar-layout';
import { ChevronRight } from 'lucide-react';
import { ProjectLayoutSkeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

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

  const [loading, setLoading] = React.useState(projects.length === 0);

  React.useEffect(() => {
    async function loadProjects() {
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

    if (projects.length === 0) {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [projects.length, setProjects]);

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
    return <div className="p-6 text-xs font-mono text-[#71717A]">Project not found</div>;
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
          <div className="px-6 border-b border-[#1f1f1f] bg-[#111113]/50 flex items-center justify-between">
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
                        ? 'border-white text-white font-semibold' 
                        : 'border-transparent text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
            <Link 
              href="/dashboard"
              className="text-xs text-[#71717A] hover:text-[#FAFAFA] font-mono flex items-center gap-1 py-2 pr-6 shrink-0"
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

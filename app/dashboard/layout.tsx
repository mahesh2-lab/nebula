'use client';

import * as React from 'react';
import { SidebarLayout } from '@/components/layouts/sidebar-layout';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = pathname ? (pathname.split('/').pop() || 'projects') : 'projects';
  const activeProjectId = useStore((s) => s.activeProjectId);
  const isLogsPage = pathname ? (pathname.endsWith('/logs') || pathname.includes('/logs')) : false;

  return (
    <SidebarLayout 
      hideSidebar={isLogsPage}
      activeTab={activeTab === 'dashboard' ? 'projects' : activeTab} 
      setActiveTab={(tab) => {
        const projectTabs = ['overview', 'deployments', 'logs', 'domains', 'analytics', 'env', 'settings'];
        if (tab === 'projects') {
          router.push('/dashboard');
        } else if (activeProjectId && projectTabs.includes(tab)) {
          if (tab === 'overview') router.push(`/project/${activeProjectId}`);
          else router.push(`/project/${activeProjectId}/${tab}`);
        } else {
          router.push(`/dashboard/${tab}`);
        }
      }}
      onCreateProjectClick={() => {
        router.push('/new');
      }}
    >
      {children}
    </SidebarLayout>
  );
}

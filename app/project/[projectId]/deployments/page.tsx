'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import { Deployments } from '@/features/projects/deployments';

export default function ProjectDeploymentsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const projects = useStore((s) => s.projects);
  const project = projects.find(p => p.id === projectId);

  if (!project) return null;

  return (
    <Deployments 
      project={project} 
      onTabChange={(tab) => {
        router.push(`/project/${projectId}/${tab}`);
      }} 
    />
  );
}

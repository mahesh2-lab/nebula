'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/store';
import { Analytics } from '@/features/projects/analytics';

export default function ProjectAnalyticsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const projects = useStore((s) => s.projects);
  const project = projects.find(p => p.id === projectId);

  if (!project) return null;

  return <Analytics project={project} />;
}

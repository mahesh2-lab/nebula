'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/store';
import { Logs } from '@/features/projects/logs';

export default function ProjectLogsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const projects = useStore((s) => s.projects);
  const project = projects.find(p => p.id === projectId);

  if (!project) return null;

  return (
    <div className="h-full w-full bg-[#09090B]">
      <Logs project={project} />
    </div>
  );
}

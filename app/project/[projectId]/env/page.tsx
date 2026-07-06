'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/store';
import { EnvVariables } from '@/features/projects/env-variables';

export default function ProjectEnvPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const projects = useStore((s) => s.projects);
  const project = projects.find(p => p.id === projectId);

  if (!project) return null;

  return <EnvVariables project={project} />;
}

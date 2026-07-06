'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/store';
import { DeploymentDetail } from '@/features/projects/deployment-detail';

export default function ProjectDeploymentDetailPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const deploymentId = params?.deploymentId as string;
  const projects = useStore((s) => s.projects);
  const project = projects.find(p => p.id === projectId);
  const setInspectedDeploymentId = useStore((s) => s.setInspectedDeploymentId);

  React.useEffect(() => {
    if (deploymentId) {
      setInspectedDeploymentId(deploymentId);
    }
    return () => {
      setInspectedDeploymentId(null);
    };
  }, [deploymentId, setInspectedDeploymentId]);

  if (!project) return null;

  return (
    <DeploymentDetail
      deploymentId={deploymentId}
      project={project}
      backHref={`/project/${projectId}/deployments`}
    />
  );
}

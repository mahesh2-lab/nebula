'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { DeploymentDetail } from '@/features/projects/deployment-detail';

export default function GlobalDeploymentDetailPage() {
  const params = useParams();
  const deploymentId = params?.deploymentId as string;

  return (
    <DeploymentDetail
      deploymentId={deploymentId}
      backHref="/dashboard/deployments"
    />
  );
}

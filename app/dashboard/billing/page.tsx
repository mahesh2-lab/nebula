'use client';

import * as React from 'react';
import { Billing } from '@/features/projects/billing';
import { useStore } from '@/store/store';

export default function BillingPage() {
  const projects = useStore((s) => s.projects);

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8">
      <Billing project={projects[0]} />
    </div>
  );
}

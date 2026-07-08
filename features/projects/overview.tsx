'use client';

import * as React from 'react';
import { Project, useStore } from '../../store/store';
import { 
  GitBranch, 
  GitCommit, 
  Clock, 
  Activity, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { OverviewSkeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export function Overview({ project, onTabChange }: { project: Project; onTabChange: (tab: string) => void }) {
  const triggerDeployment = useStore((s) => s.triggerDeployment);
  const activeProjectId = useStore((s) => s.activeProjectId);
    const router = useRouter();

  const handleRedeploy = () => {
    if (activeProjectId) {
      triggerDeployment(activeProjectId);
      toast.success('Simulated rebuild pipeline triggered');
      onTabChange('deployments');
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />;
      case 'building':
        return <span className="h-3 w-3 bg-[#F59E0B] rounded-full animate-ping" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-[#EF4444]" />;
      default:
        return <Clock className="h-4 w-4 text-[#71717A]" />;
    }
  };

   const handleInspect = (dep: any) => {
    if (activeProjectId) {
      router.push(`/project/${activeProjectId}/deployments/${dep.id}`);
    } else {
      router.push(`/dashboard/deployments/${dep.id}`);
    }
  };
  const latestDeployment = project.deployments[0];

  if (!project || project.deployments.length === 0) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      
      {/* Overview Top Info Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border border-[#1f1f1f] bg-[#111113] p-4 rounded-md gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#71717A]">PROD-DEPLOYMENT</span>
            <span className="text-xs px-1.5 py-0.5 border border-[#1f1f1f] bg-[#09090B] text-[#A1A1AA] font-mono rounded-sm">production</span>
          </div>
          <h2 className="text-sm font-semibold text-[#FAFAFA] flex items-center gap-2">
            {project.id}.{process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'nebula.dev'}
            <a 
              href={`https://${project.id}.${process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'nebula.dev'}`} 
              target="_blank" 
              className="text-[#71717A] hover:text-[#FAFAFA] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </h2>
          <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3 text-[#71717A]" />
              {project.branch}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <GitCommit className="h-3 w-3 text-[#71717A]" />
              {(project.lastCommit.hash || '').substring(0, 7)} - {project.lastCommit.message}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[#1f1f1f] bg-[#09090B] rounded-sm">
            {getStatusIcon(project.status)}
            <span className="text-xs font-mono capitalize">{project.status}</span>
          </div>
          
          <button
            onClick={handleRedeploy}
            className="px-3 py-1 bg-white text-[#09090B] hover:bg-zinc-200 active:bg-zinc-300 text-xs font-semibold rounded-sm transition-colors"
          >
            Redeploy
          </button>
        </div>
      </div>

      {/* Grid of Key Technical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Latency metric */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-2">
          <div className="flex justify-between items-center text-xs text-[#71717A] font-mono">
            <span>EDGE LATENCY</span>
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-lg font-mono font-semibold text-[#FAFAFA]">{project.latency}</p>
            <p className="text-[10px] text-[#A1A1AA]">Weighted avg across all replicated POPs</p>
          </div>
        </div>

        {/* Bandwidth Usage */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-2">
          <div className="flex justify-between items-center text-xs text-[#71717A] font-mono">
            <span>BANDWIDTH</span>
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <p className="text-lg font-mono font-semibold text-[#FAFAFA]">{project.billing.bandwidthUsed} GB</p>
              <span className="text-[10px] font-mono text-[#71717A]">/ {project.billing.bandwidthLimit} GB</span>
            </div>
            <div className="w-full bg-[#09090B] h-1 rounded-full border border-[#1f1f1f] overflow-hidden mt-1">
              <div 
                className="bg-white h-full" 
                style={{ width: `${(project.billing.bandwidthUsed / project.billing.bandwidthLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Requests usage */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-2">
          <div className="flex justify-between items-center text-xs text-[#71717A] font-mono">
            <span>REQUESTS</span>
            <span className="text-[10px] font-mono text-[#71717A]">HTTPS</span>
          </div>
          <div>
            <div className="flex justify-between items-baseline">
              <p className="text-lg font-mono font-semibold text-[#FAFAFA]">{project.billing.requestsUsed}M</p>
              <span className="text-[10px] font-mono text-[#71717A]">/ {project.billing.requestsLimit}M</span>
            </div>
            <div className="w-full bg-[#09090B] h-1 rounded-full border border-[#1f1f1f] overflow-hidden mt-1">
              <div 
                className="bg-white h-full" 
                style={{ width: `${(project.billing.requestsUsed / project.billing.requestsLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Recent Deployments Table */}
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1f1f1f] px-4 py-3 bg-[#18181B]/50">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">{project.name} Recent Deployments</h3>
          <button 
            onClick={() => onTabChange('deployments')}
            className="text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] font-mono flex items-center gap-1"
          >
            All Deployments <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y divide-[#1f1f1f]">
          {project.deployments.slice(0, 3).map((dep) => (
            <div key={dep.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-[#18181B] transition-colors gap-2 cursor-pointer"
              onClick={ () => handleInspect(dep)}
            >
              <div className="flex items-center gap-3">
                {dep.status === 'ready' ? (
                  <span className="h-2 w-2 bg-[#22C55E] rounded-full" />
                ) : dep.status === 'failed' ? (
                  <span className="h-2 w-2 bg-[#EF4444] rounded-full" />
                ) : (
                  <span className="h-2 w-2 bg-[#F59E0B] rounded-full animate-pulse" />
                )}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#FAFAFA]">{dep.id}</span>
                    <span className="text-[10px] font-mono text-[#71717A]">{dep.branch}</span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] max-w-[400px] truncate">{dep.commit.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-[#A1A1AA] font-mono">
                <span>{dep.region}</span>
                <span>{dep.updatedAt ? new Date(dep.updatedAt).toLocaleDateString() : 'N/A'}</span>
                <span className={`text-[10px] uppercase font-semibold ${dep.status === 'ready' ? 'text-[#22C55E]' : dep.status === 'failed' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                  {dep.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

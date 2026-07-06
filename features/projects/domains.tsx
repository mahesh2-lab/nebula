'use client';

import * as React from 'react';
import { Project, useStore, DomainInfo } from '../../store/store';
import { 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { DomainsSkeleton } from '@/components/ui/skeleton';

export function Domains({ project }: { project: Project }) {
  const addDomain = useStore((s) => s.addDomain);
  const deleteDomain = useStore((s) => s.deleteDomain);
  
  const [newDomain, setNewDomain] = React.useState('');
  const [redirectTarget, setRedirectTarget] = React.useState('none');
  const [isVerifying, setIsVerifying] = React.useState<Record<string, boolean>>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    // Check if domain already exists
    if (project.domains.some(d => d.name === newDomain.trim())) {
      toast.error('Domain already configured for this project');
      return;
    }

    const domainItem: DomainInfo = {
      name: newDomain.trim(),
      ssl: 'generating',
      dns: 'CNAME: cname.nebula-dns.com',
      redirect: redirectTarget,
      verified: false,
      health: 'healthy'
    };

    addDomain(project.id, domainItem);
    setNewDomain('');
    setRedirectTarget('none');
    toast.success(`Domain ${domainItem.name} added. DNS configuration pending.`);

    // Simulate verification update
    setTimeout(() => {
      useStore.setState((state) => ({
        projects: state.projects.map(p => {
          if (p.id === project.id) {
            return {
              ...p,
              domains: p.domains.map(d => d.name === domainItem.name ? { ...d, verified: true, ssl: 'active' } : d)
            };
          }
          return p;
        })
      }));
      toast.success(`SSL cert compiled and DNS verified for ${domainItem.name}`);
    }, 4000);
  };

  const handleVerify = (name: string) => {
    setIsVerifying(prev => ({ ...prev, [name]: true }));
    setTimeout(() => {
      setIsVerifying(prev => ({ ...prev, [name]: false }));
      useStore.setState((state) => ({
        projects: state.projects.map(p => {
          if (p.id === project.id) {
            return {
              ...p,
              domains: p.domains.map(d => d.name === name ? { ...d, verified: true, ssl: 'active' } : d)
            };
          }
          return p;
        })
      }));
      toast.success(`Domain verified: ${name}`);
    }, 1500);
  };

  const handleDelete = (name: string) => {
    deleteDomain(project.id, name);
    toast.info(`Domain mapping for ${name} removed`);
  };

  if (!project) {
    return <DomainsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Configure Domain Form */}
      <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA] font-mono">Add Domain</h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="my-domain.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-[#1f1f1f] bg-[#09090B] text-xs font-mono text-[#FAFAFA] placeholder:text-[#71717A] rounded-sm outline-none focus:border-white transition-colors"
            required
          />
          
          <select
            value={redirectTarget}
            onChange={(e) => setRedirectTarget(e.target.value)}
            className="px-3 py-1.5 border border-[#1f1f1f] bg-[#09090B] text-xs font-mono text-[#A1A1AA] rounded-sm outline-none focus:border-white"
          >
            <option value="none">No Redirect</option>
            <option value="canonical">Redirect to Canonical ({project.name}.{process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'nebula.dev'})</option>
          </select>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-white text-[#09090B] hover:bg-neutral-200 active:bg-neutral-300 text-xs font-semibold rounded-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Domain Mapping Grid / Tables */}
      <div className="space-y-4">
        {project.domains.length === 0 ? (
          <div className="border border-[#1f1f1f] p-6 text-center text-xs font-mono text-[#71717A] rounded-md">
            No domains configured. The cloud is patiently waiting.
          </div>
        ) : (
          project.domains.map((dom) => (
            <div key={dom.name} className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#A1A1AA]" />
                  <span className="font-semibold text-xs font-mono text-[#FAFAFA]">{dom.name}</span>
                  {dom.redirect !== 'none' && (
                    <span className="flex items-center gap-1 text-[10px] text-[#71717A] font-mono">
                      <ArrowRight className="h-3 w-3" /> redirects to {dom.redirect}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Health Check Badge */}
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    dom.health === 'healthy' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                  }`}>
                    {dom.health === 'healthy' ? 'EDGE HEALTHY' : 'DEGRADED'}
                  </span>

                  {/* Verification Status */}
                  {dom.verified ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                      ACTIVE & VERIFIED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 animate-pulse">
                      VERIFICATION REQUIRED
                    </span>
                  )}

                  {/* SSL Indicator */}
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    dom.ssl === 'active' 
                      ? 'bg-neutral-800 text-[#FAFAFA]' 
                      : 'bg-yellow-950 text-[#F59E0B]'
                  }`}>
                    <ShieldCheck className="h-3 w-3" />
                    <span>SSL: {dom.ssl.toUpperCase()}</span>
                  </span>
                </div>
              </div>

              {/* DNS settings requirements block */}
              {!dom.verified && (
                <div className="bg-[#09090B] border border-[#1f1f1f] p-3 text-xs font-mono rounded-sm space-y-2">
                  <p className="text-[#A1A1AA] text-[11px]">Configure the following DNS settings on your domain registrar to verify ownership:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1 text-[11px]">
                    <div>
                      <span className="text-[#71717A]">Type: </span>
                      <span className="text-white">CNAME</span>
                    </div>
                    <div>
                      <span className="text-[#71717A]">Name/Host: </span>
                      <span className="text-white">@ (or subdomain)</span>
                    </div>
                    <div>
                      <span className="text-[#71717A]">Value/Target: </span>
                      <span className="text-white">cname.nebula-dns.com</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-[#1f1f1f]/50">
                    <button
                      onClick={() => handleVerify(dom.name)}
                      disabled={isVerifying[dom.name]}
                      className="px-2.5 py-0.5 bg-white text-[#09090B] text-[10px] font-semibold rounded-sm disabled:opacity-50"
                    >
                      {isVerifying[dom.name] ? 'Verifying...' : 'Verify Now'}
                    </button>
                    <button
                      onClick={() => toast.info('SSL certificate regeneration queued...')}
                      className="px-2.5 py-0.5 border border-[#1f1f1f] text-[#A1A1AA] hover:text-[#FAFAFA] text-[10px] rounded-sm"
                    >
                      Regenerate SSL
                    </button>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex justify-between items-center pt-2 border-t border-[#1f1f1f]/50 text-xs font-mono">
                <span className="text-[#71717A] text-[10px]">Active routing via {dom.dns}</span>
                <button
                  onClick={() => handleDelete(dom.name)}
                  className="text-[#71717A] hover:text-[#EF4444] transition-colors p-1"
                  title="Delete domain mapping"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

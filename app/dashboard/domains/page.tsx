'use client';

import * as React from 'react';
import { useStore, Project, DomainInfo } from '@/store/store';
import { useRouter } from 'next/navigation';
import { Globe, ShieldCheck, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function GlobalDomainsPage() {
  const projects = useStore((s) => s.projects);
  const router = useRouter();

  const allDomains = React.useMemo(() => {
    const list: (DomainInfo & { project: Project })[] = [];
    projects.forEach(proj => {
      proj.domains.forEach(dom => {
        list.push({
          ...dom,
          project: proj
        });
      });
    });
    return list;
  }, [projects]);

  const getSslBadge = (ssl: DomainInfo['ssl']) => {
    switch (ssl) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
            <ShieldCheck className="h-3 w-3 shrink-0" /> SSL ACTIVE
          </span>
        );
      case 'generating':
        return (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 animate-pulse">
            GENERATING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
            <ShieldAlert className="h-3 w-3 shrink-0" /> EXPIRED
          </span>
        );
    }
  };

  const getHealthBadge = (health: DomainInfo['health']) => {
    if (health === 'healthy') {
      return (
        <span className="inline-flex items-center gap-1 text-[#22C55E]">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Healthy</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[#EF4444]">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Unhealthy</span>
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-6 space-y-6">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono font-bold">Global Domains</h3>
        <p className="text-xs text-zinc-500 font-mono">Monitor routing targets, verification flags, and SSL lifecycles across projects.</p>
      </div>

      <div className="border border-[#1f1f1f] bg-[#0a0a0a] rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-[#111113] border-b border-[#1f1f1f]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Registered Custom Domains
          </h3>
        </div>

        <div className="overflow-x-auto">
          {allDomains.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#71717A]">
              No custom domains registered. Select a project to bind a domain name.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-black/60 text-[10px] font-mono text-[#71717A] uppercase">
                  <th className="p-3">Project</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">DNS CNAME / A</th>
                  <th className="p-3">SSL Security</th>
                  <th className="p-3">Health Status</th>
                  <th className="p-3">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f] text-xs font-mono">
                {allDomains.map((dom) => (
                  <tr key={dom.name} className="hover:bg-[#111113] transition-colors">
                    <td className="p-3">
                      <button 
                        onClick={() => router.push(`/project/${dom.project.id}`)}
                        className="font-bold text-white hover:underline hover:text-white/80 cursor-pointer font-sans"
                      >
                        {dom.project.name}
                      </button>
                    </td>
                    <td className="p-3 text-white font-semibold">{dom.name}</td>
                    <td className="p-3 text-zinc-400 font-mono text-[11px]">{dom.dns}</td>
                    <td className="p-3">{getSslBadge(dom.ssl)}</td>
                    <td className="p-3">{getHealthBadge(dom.health)}</td>
                    <td className="p-3 text-zinc-400">{dom.verified ? 'Verified' : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

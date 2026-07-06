'use client';

import * as React from 'react';
import { useStore, Project, EnvVar } from '@/store/store';
import { useRouter } from 'next/navigation';
import { Key, Eye, EyeOff, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalSecretsPage() {
  const projects = useStore((s) => s.projects);
  const router = useRouter();

  const allSecrets = React.useMemo(() => {
    const list: (EnvVar & { project: Project })[] = [];
    projects.forEach(proj => {
      proj.env.forEach(secret => {
        list.push({
          ...secret,
          project: proj
        });
      });
    });
    return list;
  }, [projects]);

  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleToggleReveal = (id: string) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    toast.success('Copied secret value');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-6 space-y-6">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono font-bold">Global Secrets Vault</h3>
        <p className="text-xs text-zinc-500 font-mono">View environment variables and database keys configured across your project list.</p>
      </div>

      <div className="border border-[#1f1f1f] bg-[#0a0a0a] rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-[#111113] border-b border-[#1f1f1f]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Decrypted System Secrets
          </h3>
        </div>

        <div className="overflow-x-auto">
          {allSecrets.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#71717A]">
              No secrets configured in the workspace. Select a project to inject environment values.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-black/60 text-[10px] font-mono text-[#71717A] uppercase">
                  <th className="p-3">Project</th>
                  <th className="p-3">Secret Key</th>
                  <th className="p-3">Decrypted Value</th>
                  <th className="p-3">Target Environments</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f] text-xs font-mono">
                {allSecrets.map((sec) => (
                  <tr key={sec.id} className="hover:bg-[#111113] transition-colors">
                    <td className="p-3">
                      <button 
                        onClick={() => router.push(`/project/${sec.project.id}`)}
                        className="font-bold text-white hover:underline hover:text-white/80 cursor-pointer font-sans"
                      >
                        {sec.project.name}
                      </button>
                    </td>
                    <td className="p-3 font-semibold text-white tracking-tight">{sec.key}</td>
                    <td className="p-3 text-zinc-400">
                      <span>{revealed[sec.id] ? sec.value : '••••••••••••'}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        {sec.env.map((e) => (
                          <span 
                            key={e} 
                            className="px-1.5 py-0.5 text-[9px] border border-[#1f1f1f] bg-black text-[#A1A1AA] uppercase rounded-md"
                          >
                            {e.slice(0, 4)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => handleToggleReveal(sec.id)}
                          className="p-2 border border-[#1f1f1f] bg-black text-[#A1A1AA] hover:text-[#FAFAFA] rounded-md cursor-pointer"
                          title="Reveal secret value"
                        >
                          {revealed[sec.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(sec.id, sec.value)}
                          className="p-2 border border-[#1f1f1f] bg-black text-[#A1A1AA] hover:text-[#FAFAFA] rounded-md cursor-pointer"
                          title="Copy secret value"
                        >
                          {copiedId === sec.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => router.push(`/project/${sec.project.id}/env`)}
                          className="p-2 border border-[#1f1f1f] bg-black text-[#A1A1AA] hover:text-white rounded-md cursor-pointer"
                          title="Configure secret in project"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
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

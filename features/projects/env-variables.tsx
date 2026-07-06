'use client';

import * as React from 'react';
import { Project, useStore, EnvVar } from '../../store/store';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Plus, 
  ShieldAlert, 
  Check, 
  Lock 
} from 'lucide-react';
import { toast } from 'sonner';
import { EnvSkeleton } from '@/components/ui/skeleton';

export function EnvVariables({ project }: { project: Project }) {
  const addEnvVar = useStore((s) => s.addEnvVar);
  const deleteEnvVar = useStore((s) => s.deleteEnvVar);
  
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');
  const [selectedEnvs, setSelectedEnvs] = React.useState<string[]>(['production']);
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    // Validate key name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newKey)) {
      toast.error('Invalid Env Key. Use alphanumeric characters and underscores only.');
      return;
    }

    if (project.env.some(e => e.key === newKey.trim())) {
      toast.error('Key already exists for this project');
      return;
    }

    addEnvVar(project.id, {
      key: newKey.trim(),
      value: newValue.trim(),
      env: selectedEnvs
    });

    setNewKey('');
    setNewValue('');
    toast.success(`Secret ${newKey.trim()} created successfully`);
  };

  const handleToggleReveal = (id: string) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    toast.success('Copied secret value');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, key: string) => {
    deleteEnvVar(project.id, id);
    toast.info(`Deleted env variable: ${key}`);
  };

  const toggleEnvSelection = (env: string) => {
    setSelectedEnvs(prev => 
      prev.includes(env) ? prev.filter(e => e !== env) : [...prev, env]
    );
  };

  if (!project) {
    return <EnvSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 space-y-8">
      
      {/* Add Secret Form */}
      <div className="pb-8 border-b border-[#1f1f1f] space-y-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#A1A1AA]" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA] font-mono">Create Environment Secret</h3>
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">KEY</label>
              <input
                type="text"
                placeholder="DATABASE_PASSWORD"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs font-mono text-[#FAFAFA] placeholder:text-zinc-700 rounded-md outline-none focus:border-white transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">VALUE</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs font-mono text-[#FAFAFA] placeholder:text-zinc-700 rounded-md outline-none focus:border-white transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-[#71717A] tracking-wider block">ENVIRONMENTS</label>
              <div className="flex flex-wrap gap-2">
                {['production', 'preview', 'development'].map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => toggleEnvSelection(env)}
                    className={`px-3 py-1 border text-[10px] font-mono rounded-md transition-colors cursor-pointer ${
                      selectedEnvs.includes(env)
                        ? 'bg-white text-black border-white font-semibold'
                        : 'text-[#A1A1AA] border-[#1f1f1f] hover:bg-[#111113]'
                    }`}
                  >
                    {env.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="flex h-10 items-center justify-center gap-1.5 px-4 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-md transition-colors cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Variable</span>
            </button>
          </div>
        </form>
      </div>

      {/* Variables List Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono font-semibold text-[#71717A] uppercase tracking-wider">Active Variables Table</p>
        </div>

        {project.env.length === 0 ? (
          <div className="p-8 border border-dashed border-[#1f1f1f] rounded-md text-center text-xs font-mono text-[#71717A]">
            No environment variables configured.
          </div>
        ) : (
          <div className="border border-[#1f1f1f] bg-black/40 rounded-md overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-black/60 text-[10px] font-mono text-[#71717A] uppercase">
                  <th className="p-3">Key</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Environments</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f] text-xs font-mono">
                {project.env.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#111113] transition-colors">
                    <td className="p-3 font-semibold text-white">{ev.key}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#A1A1AA]">
                          {revealed[ev.id] ? ev.value : '••••••••••••'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        {ev.env.map((e) => (
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
                          onClick={() => handleToggleReveal(ev.id)}
                          className="p-2 border border-[#1f1f1f] bg-black text-[#A1A1AA] hover:text-[#FAFAFA] rounded-md cursor-pointer"
                          title="Reveal secret"
                        >
                          {revealed[ev.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(ev.id, ev.value)}
                          className="p-2 border border-[#1f1f1f] bg-black text-[#A1A1AA] hover:text-[#FAFAFA] rounded-md cursor-pointer"
                          title="Copy secret"
                        >
                          {copiedId === ev.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id, ev.key)}
                          className="p-2 border border-[#1f1f1f] bg-black text-[#A1A1AA] hover:text-red-500 rounded-md cursor-pointer"
                          title="Delete secret"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

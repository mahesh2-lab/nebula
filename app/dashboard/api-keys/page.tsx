'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Key, Copy, Check, Plus, Trash2 } from 'lucide-react';

export default function ApiKeysPage() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [scope, setScope] = React.useState('read');
  const [keys, setKeys] = React.useState([
    { id: '1', name: 'GitHub Action Deployer', prefix: 'neb_live_7e2b...', token: 'neb_live_7e2b9c108fac482f091bc', scope: 'Read/Write', created: '3 months ago' },
    { id: '2', name: 'CLI Development Token', prefix: 'neb_live_8f0a...', token: 'neb_live_8f0a1c8901ebcf80a1d4b', scope: 'Admin', created: '1 week ago' }
  ]);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const randomHash = Math.random().toString(16).substring(2, 14);
    const newToken = `neb_live_${randomHash}01a2b3c4d5e`;
    const newKey = {
      id: Math.random().toString(),
      name,
      prefix: `neb_live_${randomHash.substring(0, 4)}...`,
      token: newToken,
      scope: scope === 'read' ? 'Read' : scope === 'write' ? 'Read/Write' : 'Admin',
      created: 'Just now'
    };

    setKeys([newKey, ...keys]);
    toast.success(`API Key "${name}" generated! Make sure to copy it now.`);
    setName('');
  };

  const handleCopy = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast.success('Copied API Key to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, keyName: string) => {
    setKeys(keys.filter(k => k.id !== id));
    toast.info(`API Key "${keyName}" revoked`);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-6">
      
      {/* Header block */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">API Keys</h2>
        <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">Generate authentication keys to deploy services programmatically.</p>
      </div>

      {/* Generate API key form */}
      <form onSubmit={handleCreateKey} className="border border-[#1f1f1f] bg-[#111113] p-5 rounded-md space-y-4 max-w-xl font-mono text-xs">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Plus className="h-4.5 w-4.5" />
          Generate New API Token
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] text-[#71717A]">TOKEN DESCRIPTION</label>
            <input
              type="text"
              placeholder="e.g. Vercel integration, CI pipeline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs text-white placeholder:text-zinc-650 rounded-sm outline-none focus:border-white transition-colors"
              required
            />
          </div>
          <div className="w-full sm:w-40 space-y-1">
            <label className="text-[9px] text-[#71717A]">ACCESS SCOPE</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs text-[#A1A1AA] rounded-sm outline-none focus:border-white"
            >
              <option value="read">Read Only</option>
              <option value="write">Read & Write</option>
              <option value="admin">Admin Full Scope</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-sm transition-colors"
        >
          Generate Secret Key
        </button>
      </form>

      {/* Active API keys */}
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden max-w-3xl">
        <div className="px-4 py-3 bg-[#18181B] border-b border-[#1f1f1f]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">Active Tokens</h4>
        </div>

        <div className="divide-y divide-[#1f1f1f] font-mono text-xs">
          {keys.map((k) => (
            <div key={k.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#18181B]/40">
              <div className="space-y-1">
                <p className="text-white font-semibold">{k.name}</p>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#71717A]">
                  <span className="bg-[#09090b] px-1.5 py-0.5 rounded border border-[#1f1f1f] font-bold text-zinc-300">{k.scope}</span>
                  <span>Prefix: <code>{k.prefix}</code></span>
                  <span>•</span>
                  <span>Created {k.created}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleCopy(k.token, k.id)}
                  className="px-2.5 py-1 border border-[#1f1f1f] bg-[#09090B] hover:bg-[#18181B] text-zinc-300 text-[10px] rounded-sm transition-colors flex items-center gap-1.5"
                >
                  {copiedId === k.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Key className="h-3 w-3" />}
                  <span>{copiedId === k.id ? 'Copied' : 'Copy Key'}</span>
                </button>
                <button
                  onClick={() => handleDelete(k.id, k.name)}
                  className="p-1 border border-[#1f1f1f] bg-[#09090B] hover:bg-red-500/10 hover:text-red-400 text-[#71717A] rounded-sm transition-colors"
                  title="Revoke access immediately"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

'use client';

import * as React from 'react';
import { Terminal, Copy, Check, TerminalSquare, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export function CLI() {
  const [copiedCmd, setCopiedCmd] = React.useState<string | null>(null);

  const handleCopy = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    toast.success('Copied CLI Command');
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const steps = [
    {
      title: '1. Install Nebula Global CLI',
      desc: 'Run the global package installation using your favorite package manager.',
      cmd: 'npm install -g @nebula-org/cli',
      id: 'inst'
    },
    {
      title: '2. Authenticate CLI session',
      desc: 'Link your local development machine with your Nebula workspace.',
      cmd: 'nebula login',
      id: 'auth'
    },
    {
      title: '3. Initialize & deploy project directory',
      desc: 'Run inside your project workspace root directory to configure and push builds.',
      cmd: 'nebula init && nebula deploy',
      id: 'init'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* CLI Introduction Header */}
      <div className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-2">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-4.5 w-4.5 text-white" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA] font-mono">Nebula Terminal CLI</h3>
        </div>
        <p className="text-xs text-[#A1A1AA]">
          Control and deploy your infrastructure directly from your code workspace terminal. Spin up new preview deployments, fetch logs, or configure environmental settings securely.
        </p>
      </div>

      {/* Guide Steps */}
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.id} className="border border-[#1f1f1f] bg-[#111113] p-4 rounded-md space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-white font-mono">{s.title}</h4>
              <p className="text-[11px] text-[#71717A] mt-0.5">{s.desc}</p>
            </div>
            
            <div className="flex items-center gap-2 bg-[#09090B] border border-[#1f1f1f] p-2.5 rounded-sm">
              <span className="text-[10px] text-[#71717A] font-mono select-none">$</span>
              <code className="flex-1 text-xs font-mono text-[#FAFAFA] select-all">{s.cmd}</code>
              <button
                onClick={() => handleCopy(s.cmd, s.id)}
                className="text-[#71717A] hover:text-[#FAFAFA] transition-colors p-1 border border-[#1f1f1f] bg-[#111113] rounded-sm"
              >
                {copiedCmd === s.id ? <Check className="h-3.5 w-3.5 text-[#22C55E]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CLI commands cheat sheet */}
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden font-mono text-xs">
        <div className="px-4 py-3 bg-[#18181B] border-b border-[#1f1f1f]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">CLI Commands Reference</h4>
        </div>
        
        <div className="divide-y divide-[#1f1f1f]">
          <div className="p-3 flex justify-between items-center hover:bg-[#18181B]/40">
            <span className="text-white">nebula env pull [file]</span>
            <span className="text-[#71717A] text-[10px]">Fetch production variables into local .env file securely</span>
          </div>
          <div className="p-3 flex justify-between items-center hover:bg-[#18181B]/40">
            <span className="text-white">nebula logs --follow</span>
            <span className="text-[#71717A] text-[10px]">Stream active deployment console output on terminal</span>
          </div>
          <div className="p-3 flex justify-between items-center hover:bg-[#18181B]/40">
            <span className="text-white">nebula rollback --id [dep-id]</span>
            <span className="text-[#71717A] text-[10px]">Instantly switch router endpoints to past deployment</span>
          </div>
        </div>
      </div>

    </div>
  );
}

'use client';

import * as React from 'react';
import { 
  User, 
  Github, 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Lock, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession, signIn } from 'next-auth/react';

export function UserSettings() {
  const { data: session } = useSession();
  const user = session?.user;

  const userInitials = React.useMemo(() => {
    if (!user?.name) {
      if (user?.email) {
        return user.email.slice(0, 2).toUpperCase();
      }
      return 'MK';
    }
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user]);

  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Mahesh Kumar');
  const userEmail = user?.email || 'mahesh@nebula-org.com';

  const [sshKeys, setSshKeys] = React.useState([
    { id: 'ssh-1', title: 'Mahesh MacBook Air', fingerprint: 'SHA256:d82b3a8c10e92ca82e18f2', created: '2026-05-10' }
  ]);

  const [newSshTitle, setNewSshTitle] = React.useState('');
  const [newSshKey, setNewSshKey] = React.useState('');
  const [copiedKeyId, setCopiedKeyId] = React.useState<string | null>(null);

  const handleAddSshKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSshTitle.trim() || !newSshKey.trim()) return;

    if (!newSshKey.startsWith('ssh-rsa') && !newSshKey.startsWith('ssh-ed25519')) {
      toast.error('Invalid SSH key. Must start with ssh-rsa or ssh-ed25519');
      return;
    }

    const keyItem = {
      id: `ssh-${Math.random().toString(36).substring(7)}`,
      title: newSshTitle.trim(),
      fingerprint: `SHA256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      created: new Date().toISOString().split('T')[0]
    };

    setSshKeys(prev => [...prev, keyItem]);
    setNewSshTitle('');
    setNewSshKey('');
    toast.success(`SSH key "${keyItem.title}" authorized`);
  };

  const handleDeleteSshKey = (id: string, title: string) => {
    setSshKeys(prev => prev.filter(k => k.id !== id));
    toast.info(`Deleted SSH Key: ${title}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 space-y-8">
      
      {/* Profile Header section */}
      <div className="flex items-center gap-4 pb-8 border-b border-[#1f1f1f]">
        <div className="h-14 w-14 rounded-full border border-[#1f1f1f] bg-[#09090B] overflow-hidden flex items-center justify-center text-sm font-semibold font-mono text-white">
          {user?.image ? (
            <img src={user.image} alt={userName} className="h-full w-full object-cover" />
          ) : (
            <span>{userInitials}</span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white tracking-tight">{userName}</h3>
          <p className="text-xs text-[#71717A] font-mono">{userEmail} · Administrator</p>
        </div>
      </div>

      {/* GitHub Integration context */}
      <div className="pb-8 border-b border-[#1f1f1f] space-y-4">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-[#A1A1AA]" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA] font-mono">GitHub Connection</h3>
        </div>
        <div className="flex items-center justify-between bg-black/40 border border-[#1f1f1f] p-4 rounded-md">
          {!(session as any)?.accessToken ? (
            <>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                <span className="font-mono text-zinc-400">Not connected to GitHub</span>
              </div>
              <button 
                onClick={() => signIn('github')}
                className="px-3 py-1.5 bg-white text-black hover:bg-zinc-200 text-[10px] font-mono font-bold rounded-md transition-colors cursor-pointer"
              >
                Connect to GitHub
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                <span className="font-mono text-zinc-300">connected to github.com</span>
              </div>
              <button 
                onClick={() => toast.success('GitHub account configuration synchronized')}
                className="px-3 py-1.5 border border-[#1f1f1f] hover:bg-[#111113] active:bg-[#18181B] text-[10px] font-mono rounded-md transition-colors text-zinc-300 cursor-pointer"
              >
                Sync Account
              </button>
            </>
          )}
        </div>
      </div>

      {/* SSH Keys Form & Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-[#A1A1AA]" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA] font-mono">Authorized SSH Keys</h3>
        </div>

        <form onSubmit={handleAddSshKey} className="space-y-4 font-mono text-xs max-w-xl">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">KEY NAME / DESCRIPTION</label>
            <input
              type="text"
              placeholder="e.g. My MacBook Pro"
              value={newSshTitle}
              onChange={(e) => setNewSshTitle(e.target.value)}
              className="w-full h-10 px-3.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-[#71717A] tracking-wider">SSH KEY VALUE (PUBKEY)</label>
            <textarea
              placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5..."
              value={newSshKey}
              onChange={(e) => setNewSshKey(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 border border-[#1f1f1f] bg-black text-xs text-[#FAFAFA] rounded-md outline-none focus:border-white transition-colors resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold px-4 py-2 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add SSH Key</span>
          </button>
        </form>

        <div className="pt-4 space-y-3">
          <p className="text-[10px] font-mono font-semibold text-[#71717A] uppercase tracking-wider">Active SSH Public Keys</p>
          <div className="divide-y divide-[#1f1f1f] border border-[#1f1f1f] bg-black/40 rounded-md overflow-hidden">
            {sshKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 text-xs font-mono">
                <div className="space-y-1">
                  <p className="font-semibold text-white">{key.title}</p>
                  <p className="text-[10px] text-[#71717A]">{key.fingerprint}</p>
                </div>
                <button
                  onClick={() => handleDeleteSshKey(key.id, key.title)}
                  className="p-2 border border-[#1f1f1f] hover:bg-[#EF4444]/10 hover:text-[#EF4444] rounded-md text-[#71717A] transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

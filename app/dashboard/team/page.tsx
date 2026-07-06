'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Users, UserPlus, Shield, Key } from 'lucide-react';

export default function TeamPage() {
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('member');
  const [members, setMembers] = React.useState([
    { email: 'mahesh@nebula-org.com', role: 'owner', status: 'active' },
    { email: 'developer@nebula-org.com', role: 'member', status: 'active' },
    { email: 'designer@nebula-org.com', role: 'member', status: 'pending' }
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (members.some(m => m.email === email)) {
      toast.error('User is already a member of this workspace');
      return;
    }

    setMembers([...members, { email, role, status: 'pending' }]);
    toast.success(`Invite sent successfully to ${email}`);
    setEmail('');
  };

  const handleRemove = (memberEmail: string) => {
    setMembers(members.filter(m => m.email !== memberEmail));
    toast.info(`Removed ${memberEmail} from team`);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-6">
      
      {/* Header block */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">Team Management</h2>
        <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">Configure roles, permissions, and invite members to your workspace.</p>
      </div>

      {/* Invite Member form */}
      <form onSubmit={handleInvite} className="border border-[#1f1f1f] bg-[#111113] p-5 rounded-md space-y-4 max-w-xl font-mono text-xs">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <UserPlus className="h-4.5 w-4.5" />
          Invite Workspace Member
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] text-[#71717A]">EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="colleague@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs text-white placeholder:text-zinc-600 rounded-sm outline-none focus:border-white transition-colors"
              required
            />
          </div>
          <div className="w-full sm:w-40 space-y-1">
            <label className="text-[9px] text-[#71717A]">ROLE</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs text-[#A1A1AA] rounded-sm outline-none focus:border-white"
            >
              <option value="member">Member</option>
              <option value="billing">Billing admin</option>
              <option value="admin">Workspace Admin</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-sm transition-colors"
        >
          Send invitation link
        </button>
      </form>

      {/* Members table */}
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden max-w-3xl">
        <div className="px-4 py-3 bg-[#18181B] border-b border-[#1f1f1f]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">Workspace Members ({members.length})</h4>
        </div>

        <div className="divide-y divide-[#1f1f1f] font-mono text-xs">
          {members.map((m) => (
            <div key={m.email} className="p-4 flex justify-between items-center hover:bg-[#18181B]/40">
              <div className="space-y-0.5">
                <p className="text-white font-semibold">{m.email}</p>
                <p className="text-[10px] text-[#71717A] capitalize">Role: {m.role} • Status: {m.status}</p>
              </div>
              
              {m.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(m.email)}
                  className="px-2.5 py-1 border border-[#1f1f1f] bg-[#09090B] hover:bg-red-500/10 hover:text-red-400 text-[#71717A] text-[10px] rounded-sm transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

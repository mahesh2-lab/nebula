'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { User, Shield, Key, History, Activity } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = React.useMemo(() => {
    if (!user?.name) return 'MK';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-6">
      
      {/* Header block */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">User Profile</h2>
        <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">Manage your account details and view access logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start font-mono text-xs">
        
        {/* Left Column: Avatar & Basic Info */}
        <div className="border border-[#1f1f1f] bg-[#111113] p-6 rounded-md space-y-6 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full border-2 border-white/20 flex items-center justify-center text-xl font-bold bg-[#09090b]">
            {user?.image ? (
              <img src={user.image} alt={user.name || ''} className="h-full w-full object-cover rounded-full" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">{user?.name || 'Mahesh Kumar'}</h3>
            <p className="text-[#A1A1AA] text-[10px]">{user?.email || 'mahesh@nebula-org.com'}</p>
          </div>

          <div className="w-full h-[1px] bg-[#1f1f1f]" />

          <div className="w-full text-left space-y-2 text-[10px] text-[#71717A]">
            <p>Access Role: <strong className="text-zinc-350 capitalize">{(user as any)?.role || 'user'}</strong></p>
            <p>GitHub Username: <strong className="text-zinc-350">@maheshkumar</strong></p>
            <p>Onboarded: <strong className="text-zinc-350">July 2, 2026</strong></p>
          </div>
          
          <Link 
            href="/dashboard/user-settings"
            className="w-full text-center py-1.5 border border-[#1f1f1f] hover:bg-[#18181B] text-zinc-300 hover:text-white rounded-sm transition-colors text-[10px] uppercase font-bold"
          >
            Update Account Settings
          </Link>
        </div>

        {/* Right Column: Access History & Metrics */}
        <div className="md:col-span-2 space-y-6">
          {/* Metrics */}
          <div className="border border-[#1f1f1f] bg-[#111113] p-5 rounded-md space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-[#22C55E]" />
              Workspace Usage summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#1f1f1f]/60 bg-[#09090b] p-3 rounded-sm">
                <p className="text-[9px] text-[#71717A] uppercase">Active projects</p>
                <p className="text-lg font-bold text-white mt-1">2</p>
              </div>
              <div className="border border-[#1f1f1f]/60 bg-[#09090b] p-3 rounded-sm">
                <p className="text-[9px] text-[#71717A] uppercase">Total edge requests</p>
                <p className="text-lg font-bold text-white mt-1">61.3M</p>
              </div>
            </div>
          </div>

          {/* Access Logs */}
          <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden">
            <div className="px-4 py-3 bg-[#18181B] border-b border-[#1f1f1f] flex items-center gap-2">
              <History className="h-4 w-4 text-[#A1A1AA]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">Security access history</h4>
            </div>

            <div className="divide-y divide-[#1f1f1f] text-[10px] text-[#71717A]">
              <div className="p-3 flex justify-between items-center hover:bg-[#18181B]/40">
                <span>Login from 127.0.0.1 (Credentials)</span>
                <span>Just now</span>
              </div>
              <div className="p-3 flex justify-between items-center hover:bg-[#18181B]/40">
                <span>CLI Auth Token generated</span>
                <span>1 week ago</span>
              </div>
              <div className="p-3 flex justify-between items-center hover:bg-[#18181B]/40">
                <span>GitHub OAuth sync authorized</span>
                <span>2 weeks ago</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

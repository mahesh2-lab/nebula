'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Bell, Check, Trash2, ShieldAlert, Cpu, Info } from 'lucide-react';

export default function NotificationsPage() {
  const [alerts, setAlerts] = React.useState([
    { id: '1', type: 'system', title: 'Edge replication complete', message: 'Deployment dep-current-active synced to all 18 Edge POP locations successfully.', time: '10 mins ago', read: false },
    { id: '2', type: 'warning', title: 'Domain SSL generating delay', message: 'Domain test-neb-app.nebula.dev SSL certificate handshake is taking longer than expected.', time: '1 hour ago', read: false },
    { id: '3', type: 'info', title: 'Monthly billing cycle update', message: 'Your Hobby tier billing bandwidth limit usage has reached 45%. We will auto-throttle above 100%.', time: '1 day ago', read: true }
  ]);

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
    toast.success('Marked all notifications as read');
  };

  const handleRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.info('Notification cleared');
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8 space-y-6">
      
      {/* Header block */}
      <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-mono">Notifications Inbox</h2>
          <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">Platform updates, build reports, and billing threshold alerts.</p>
        </div>
        
        {alerts.some(a => !a.read) && (
          <button
            onClick={markAllRead}
            className="text-xs font-mono px-3 py-1 border border-[#1f1f1f] bg-[#111113] hover:bg-[#18181B] text-[#FAFAFA] rounded-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="border border-[#1f1f1f] bg-[#111113] rounded-md overflow-hidden max-w-3xl">
        <div className="divide-y divide-[#1f1f1f] font-mono text-xs">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-[#71717A] flex flex-col items-center justify-center gap-2 select-none">
              <Bell className="h-6 w-6 text-zinc-650" />
              <span>Inbox is empty. No new alerts.</span>
            </div>
          ) : (
            alerts.map((a) => {
              const Icon = a.type === 'warning' ? ShieldAlert : a.type === 'system' ? Cpu : Info;
              return (
                <div 
                  key={a.id} 
                  onClick={() => handleRead(a.id)}
                  className={`p-4 flex gap-4 hover:bg-[#18181B]/40 cursor-pointer transition-colors items-start justify-between ${
                    !a.read ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-sm shrink-0 border mt-0.5 ${
                      !a.read 
                        ? 'bg-white text-black border-white' 
                        : 'bg-[#09090b] text-[#71717A] border-[#1f1f1f]'
                    }`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="space-y-0.5">
                      <p className={`font-semibold ${!a.read ? 'text-white' : 'text-zinc-400'}`}>
                        {a.title}
                      </p>
                      <p className="text-[11px] text-[#A1A1AA] leading-normal max-w-xl">
                        {a.message}
                      </p>
                      <p className="text-[9px] text-[#71717A] pt-1">{a.time}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a.id);
                    }}
                    className="text-[#71717A] hover:text-[#EF4444] transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

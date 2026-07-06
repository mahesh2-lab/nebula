'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, CloudLightning } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !confirmPassword.trim()) return;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Your password has been updated. Please log in.');
      router.push('/login');
    }, 1500);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-[#ededed] font-sans">
      <div className="w-full max-w-sm border border-[#1f1f1f] bg-[#0a0a0a] p-6 rounded-md shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center select-none">
          <span className="h-10 w-10 border border-[#1f1f1f] bg-black flex items-center justify-center rounded-md">
            <CloudLightning className="text-white h-5 w-5 animate-pulse" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-white font-mono uppercase">
            Reset Password
          </h2>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Enter your new secure workspace password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs font-mono text-white placeholder:text-zinc-650 rounded-md outline-none focus:border-zinc-550 transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs font-mono text-white placeholder:text-zinc-650 rounded-md outline-none focus:border-zinc-550 transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-40 text-xs font-semibold rounded-md transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Saving Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

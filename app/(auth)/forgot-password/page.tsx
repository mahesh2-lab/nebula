'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, CloudLightning, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success('Reset link dispatched to your email.');
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
            Recover Password
          </h2>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Enter your email below to receive a password reset token.
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  <span>Processing...</span>
                </>
              ) : (
                <span>Request Recovery Link</span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center gap-2 p-4 bg-[#111113]/55 border border-[#1f1f1f] rounded-md">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <p className="text-xs font-semibold text-white">Dispatched Success!</p>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                We've sent a magic reset token link to <strong>{email}</strong>. Check your inbox (and spam folder) to reset your password.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-1.5 border border-[#1f1f1f] hover:bg-[#111113] hover:text-white text-xs font-mono rounded-md transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}

        {!isSuccess && (
          <div className="border-t border-[#1f1f1f]/60 pt-4 text-center text-[10px] font-mono text-zinc-500 select-none">
            Remember your credentials?{' '}
            <Link href="/login" className="text-white hover:underline uppercase font-bold">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

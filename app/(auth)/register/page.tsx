'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/store';
import { Github, RefreshCw, CloudLightning } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const setIsAuthenticated = useStore((s) => s.setIsAuthenticated);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingProvider, setLoadingProvider] = React.useState<'github' | 'email' | null>(null);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all registration credentials.');
      return;
    }
    if (!agreeTerms) {
      toast.error('You must accept the terms of service.');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('email');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account');
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setIsAuthenticated(true);
      toast.success('Nebula account created successfully! Welcome to early access.');
      router.push('/onboarding');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleGithubClick = () => {
    setIsLoading(true);
    setLoadingProvider('github');
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
      setLoadingProvider(null);
      toast.success('Successfully registered via GitHub!');
      router.push('/onboarding'); // Redirect to onboarding first!
    }, 1200);
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
            Create Account
          </h2>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Sign up to launch and manage global edge-container micro-services.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              placeholder="Mahesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs font-mono text-white placeholder:text-zinc-650 rounded-md outline-none focus:border-zinc-505 transition-colors"
              disabled={isLoading}
              required
            />
          </div>

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

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Password</label>
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

          <div className="flex items-start gap-2 pt-1 select-none">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 border-[#1f1f1f] rounded-sm bg-black accent-[#22c55e] cursor-pointer"
              disabled={isLoading}
              required
            />
            <label htmlFor="terms" className="text-[9px] font-mono text-zinc-500 leading-normal">
              I agree to the <span className="text-zinc-450 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-zinc-450 hover:underline cursor-pointer">Privacy Policy</span>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-40 text-xs font-semibold rounded-md transition-colors"
          >
            {isLoading && loadingProvider === 'email' ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="relative flex py-1 items-center select-none">
          <div className="flex-grow border-t border-[#1f1f1f]"></div>
          <span className="flex-shrink mx-3 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">or register with</span>
          <div className="flex-grow border-t border-[#1f1f1f]"></div>
        </div>

        <button
          type="button"
          onClick={handleGithubClick}
          disabled={isLoading}
          className="w-full flex cursor-pointer items-center justify-center gap-2 px-3 py-2 border border-[#1f1f1f] bg-black hover:bg-[#111113] hover:text-white disabled:opacity-40 text-xs font-mono text-zinc-300 rounded-md transition-colors"
        >
          {isLoading && loadingProvider === 'github' ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Github className="h-3.5 w-3.5 text-white" />
          )}
          <span>GitHub Account</span>
        </button>

        <div className="border-t border-[#1f1f1f]/60 pt-4 text-center text-[10px] font-mono text-zinc-500 select-none">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:underline uppercase font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

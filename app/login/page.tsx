'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/store';
import { Github, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { signIn, useSession, getProviders } from 'next-auth/react';

// Custom SVG Google OAuth Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className={props.className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const router = useRouter();
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const setIsAuthenticated = useStore((s) => s.setIsAuthenticated);

  // Auth States
  const [view, setView] = React.useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingProvider, setLoadingProvider] = React.useState<'github' | 'google' | 'email' | 'saml' | null>(null);

  // Form input states
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(false);

  const [configuredProviders, setConfiguredProviders] = React.useState<string[]>([]);

  React.useEffect(() => {
    getProviders().then((provs) => {
      if (provs) {
        setConfiguredProviders(Object.keys(provs));
      }
    }).catch(() => {});
  }, []);

  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === 'authenticated' || isAuthenticated) {
      if (status === 'authenticated' && !isAuthenticated) {
        setIsAuthenticated(true);
      }
      router.push('/dashboard');
    }
  }, [status, isAuthenticated, router, setIsAuthenticated]);

  const handleGithubClick = () => {
    if (!configuredProviders.includes('github')) {
      toast.error('GitHub authentication is not configured. Define GITHUB_ID and GITHUB_SECRET in your .env file.');
      return;
    }
    simulateOAuth('github');
  };

  const handleGoogleClick = () => {
    if (!configuredProviders.includes('google')) {
      setIsLoading(true);
      setLoadingProvider('google');
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLoading(false);
        setLoadingProvider(null);
        toast.success('Successfully authenticated via Google (Simulated)');
        router.push('/dashboard');
      }, 1200);
      return;
    }
    simulateOAuth('google');
  };

  const simulateOAuth = async (provider: 'github' | 'google' | 'saml') => {
    setIsLoading(true);
    setLoadingProvider(provider);
    
    if (provider === 'saml') {
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLoading(false);
        setLoadingProvider(null);
        toast.success('Successfully authenticated via Single Sign-On (SAML SSO)');
        router.push('/dashboard');
      }, 1200);
      return;
    }

    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err) {
      toast.error(`Authentication failed for ${provider}`);
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all credentials.');
      return;
    }
    if (view === 'signup' && !name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (view === 'signup' && !agreeTerms) {
      toast.error('You must accept the terms of service.');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('email');

    try {
      if (view === 'signup') {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const regData = await regRes.json();
        if (!regRes.ok) {
          throw new Error(regData.error || 'Failed to register account');
        }
      }

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      });

      if (res?.error) {
        toast.error(res.error || 'Invalid credentials');
        setIsLoading(false);
        setLoadingProvider(null);
      } else {
        setIsAuthenticated(true);
        toast.success(view === 'signin' ? 'Welcome back to Nebula Workspace!' : 'Nebula account created successfully!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Credentials sign-in error occurred.');
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-xs font-mono text-zinc-500">
        Redirecting to dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-[#ededed] font-sans selection:bg-[#ededed] selection:text-black">
      <div className="w-full max-w-sm border border-[#1f1f1f] bg-[#0a0a0a] p-6 rounded-md shadow-2xl space-y-6">

        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center select-none">
          <span className="h-10 w-10 border border-[#1f1f1f] bg-black flex items-center justify-center rounded-md">
            <span className="text-white text-lg font-bold">▲</span>
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-white font-mono uppercase">
            {view === 'signin' ? 'Sign in to Nebula' : 'Create Account'}
          </h2>
          <p className="text-[11px] text-zinc-500 leading-normal">
            {view === 'signin' 
              ? 'Connect git repositories to orchestrate serverless containers.' 
              : 'Sign up to launch and manage global edge-container micro-services.'}
          </p>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {view === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                placeholder="Mahesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs font-mono text-white placeholder:text-zinc-600 rounded-md outline-none focus-visible:shadow-3 focus:border-zinc-500 transition-colors"
                disabled={isLoading}
                required
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs font-mono text-white placeholder:text-zinc-600 rounded-md outline-none focus-visible:shadow-3 focus:border-zinc-500 transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Password</label>
              {view === 'signin' && (
                <button
                  type="button"
                  onClick={() => toast.info('Password recovery demo triggered.')}
                  className="text-[9px] font-mono text-zinc-500 hover:text-white uppercase hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs font-mono text-white placeholder:text-zinc-600 rounded-md outline-none focus-visible:shadow-3 focus:border-zinc-500 transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          {view === 'signup' && (
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
                I agree to the <span className="text-zinc-400 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-zinc-400 hover:underline cursor-pointer">Privacy Policy</span>.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-40 text-xs font-semibold rounded-md transition-colors"
          >
            {isLoading && loadingProvider === 'email' ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{view === 'signin' ? 'Continue with Email' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Divider separator */}
        <div className="relative flex py-1 items-center select-none">
          <div className="flex-grow border-t border-[#1f1f1f]"></div>
          <span className="flex-shrink mx-3 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">or continue with</span>
          <div className="flex-grow border-t border-[#1f1f1f]"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleGithubClick}
            disabled={isLoading}
            className="flex cursor-pointer items-center justify-center gap-2 px-3 py-2 border border-[#1f1f1f] bg-black hover:bg-[#111113] hover:text-white disabled:opacity-40 text-xs font-mono text-zinc-300 rounded-md transition-colors"
          >
            {isLoading && loadingProvider === 'github' ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Github className="h-3.5 w-3.5 text-white" />
            )}
            <span>GitHub</span>
          </button>
          
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="flex cursor-pointer items-center justify-center gap-2 px-3 py-2 border border-[#1f1f1f] bg-black hover:bg-[#111113] hover:text-white disabled:opacity-40 text-xs font-mono text-zinc-300 rounded-md transition-colors"
          >
            {isLoading && loadingProvider === 'google' ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <GoogleIcon className="h-3.5 w-3.5" />
            )}
            <span>Google</span>
          </button>
        </div>

        {/* SAML SSO alternative */}
        {view === 'signin' && (
          <button
            type="button"
            onClick={() => simulateOAuth('saml')}
            disabled={isLoading}
            className="w-full flex cursor-pointer items-center justify-center py-1.5 border border-[#1f1f1f] bg-black hover:bg-[#111113] hover:text-white text-[10px] font-mono text-zinc-400 rounded-md transition-colors"
          >
            {isLoading && loadingProvider === 'saml' ? (
              <RefreshCw className="h-2.5 w-2.5 animate-spin mr-1.5" />
            ) : null}
            <span>Single Sign-On (SAML SSO)</span>
          </button>
        )}

        {/* Switch Signin/Signup Toggle */}
        <div className="border-t border-[#1f1f1f]/60 pt-4 text-center text-[10px] font-mono text-zinc-500 select-none">
          {view === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setView('signup')}
                className="text-white hover:underline uppercase font-bold cursor-pointer"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setView('signin')}
                className="text-white hover:underline uppercase font-bold cursor-pointer"
                disabled={isLoading}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

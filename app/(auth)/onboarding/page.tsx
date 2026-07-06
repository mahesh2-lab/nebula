'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CloudLightning, Github, User, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState('Mahesh Kumar');
  const [teamName, setTeamName] = React.useState('mahesh-org');
  const [isGithubConnected, setIsGithubConnected] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleConnectGithub = () => {
    toast.info('Connecting github account...');
    setTimeout(() => {
      setIsGithubConnected(true);
      toast.success('Successfully linked GitHub: @maheshkumar');
    }, 1000);
  };

  const handleComplete = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Nebula workspace successfully configured!');
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-[#ededed] font-sans select-none">
      <div className="w-full max-w-md border border-[#1f1f1f] bg-[#0a0a0a] p-8 rounded-md shadow-2xl space-y-8">
        
        {/* Step indicator header */}
        <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
          <div className="flex items-center gap-2">
            <CloudLightning className="h-4.5 w-4.5 text-white animate-pulse" />
            <span className="text-xs font-semibold text-white font-mono uppercase">Nebula Setup</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Step {step} of 3</span>
        </div>

        {/* Wizard Panel Content */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white font-mono uppercase">1. Workspace Owner Profile</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Tell us your name so members of your workspace can recognize you.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs font-mono text-white rounded-md outline-none focus:border-zinc-550 transition-colors"
                required
              />
            </div>

            <button
              onClick={nextStep}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold font-mono rounded-md transition-colors"
            >
              <span>Continue Workspace Setup</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white font-mono uppercase">2. Namespace & Team Name</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Nebula routes projects under organization paths. Define your primary team sub-domain.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Team Namespace</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="flex-1 px-3 py-1.5 border border-[#1f1f1f] bg-black text-xs font-mono text-white rounded-l-md outline-none focus:border-zinc-550 transition-colors"
                  required
                />
                <span className="bg-[#111113] border-t border-b border-r border-[#1f1f1f] px-3 py-1.5 text-xs text-[#71717A] font-mono rounded-r-md">
                  .{process.env.NEXT_PUBLIC_DEPLOY_DOMAIN || 'nebula.dev'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-[#1f1f1f] hover:bg-[#111113] hover:text-white text-xs font-mono rounded-md transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold font-mono rounded-md transition-colors"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white font-mono uppercase">3. Git Integration</h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Deploy repositories instantly from Github. Link your credentials to allow pull authorization.
              </p>
            </div>

            <div className="border border-[#1f1f1f] bg-[#0c0c0e] p-5 rounded-md flex flex-col items-center justify-center text-center space-y-4">
              {isGithubConnected ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">GitHub connected!</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Linked namespace: @maheshkumar</p>
                  </div>
                </>
              ) : (
                <>
                  <Github className="h-8 w-8 text-white animate-bounce" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">GitHub Integration</p>
                    <p className="text-[10px] text-zinc-500 leading-normal">We'll request read access for your repositories.</p>
                  </div>
                  <button
                    onClick={handleConnectGithub}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] hover:bg-zinc-800 text-xs font-semibold font-mono rounded-sm border border-[#1f1f1f] text-white"
                  >
                    <Github className="h-4 w-4" />
                    <span>Authorize GitHub</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-[#1f1f1f] hover:bg-[#111113] hover:text-white text-xs font-mono rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-45 text-xs font-bold font-mono rounded-md transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Initializing Workspace...</span>
                ) : (
                  <span>Complete Onboarding</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

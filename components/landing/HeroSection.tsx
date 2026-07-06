'use client';

import * as React from 'react';
import { useLandingPage } from './LandingPageContext';
import { Network, Globe, Sparkles, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  const { submitWaitlist } = useLandingPage();
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    const success = await submitWaitlist(email);
    setIsSubmitting(false);

    if (success) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="relative w-full bg-[#ffffff] pt-24 pb-20 px-6 md:px-12 lg:px-24 flex flex-col items-center text-center overflow-hidden border-b border-[#e8e8ed]">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-[#5e5ce6]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Confident Apple-style category badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] text-[#5e5ce6] text-xs font-semibold tracking-wide uppercase mb-6 border border-[#e8e8ed] select-none">
        <Sparkles className="w-3.5 h-3.5 fill-current" />
        Introducing Nebula Edge
      </div>

      {/* Hero Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#1d1d1f] tracking-[-0.04em] leading-[1.05] max-w-4xl mb-6">
        Deploy code. <span className="bg-gradient-to-r from-[#5e5ce6] to-[#8b5cf6] bg-clip-text text-transparent">Instant edge.</span> Zero overhead.
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-[#86868b] max-w-2xl leading-relaxed mb-10 tracking-tight font-medium">
        Nebula connects git repository code directly to global micro-containers. Sub-second cold starts, automated SSL mappings, and live deployment simulation.
      </p>

      {/* CTA Waitlist Form */}
      <div className="w-full max-w-md mb-16 relative z-10">
        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-[#22c55e] font-semibold text-sm bg-[#22c55e]/10 border border-[#22c55e]/20 py-3.5 px-6 rounded-full animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4" />
            Added successfully! Welcome to the deployment future.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-full focus-within:ring-2 focus-within:ring-[#5e5ce6] focus-within:border-transparent transition-all">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-2.5 bg-transparent text-[#1d1d1f] placeholder-[#86868b] border-none outline-none focus:ring-0 text-sm placeholder:font-medium font-medium"
              disabled={isSubmitting}
              required
              suppressHydrationWarning
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto shrink-0 px-6 py-2.5 bg-white border border-[#d2d2d7] hover:bg-[#f5f5f7] hover:border-[#86868b] text-[#1d1d1f] font-semibold text-xs rounded-full transition-all tracking-tight uppercase shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>
        )}
      </div>

      {/* Hero Visual: Contained Dark Panel with SVG Globe */}
      <div className="w-full max-w-4xl border border-[#27272a] bg-[#1d1d1f] rounded-[22px] overflow-hidden shadow-2xl relative group">
        {/* Terminal top header bar */}
        <div className="h-10 border-b border-[#27272a]/60 bg-[#161618] flex items-center px-4 justify-between select-none">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="text-[10px] text-[#71717a] font-mono tracking-wider uppercase">Active Edge Network Simulation</div>
          <div className="w-14" />
        </div>

        {/* Globe Container */}
        <div className="h-[320px] sm:h-[420px] w-full flex items-center justify-center relative p-6 select-none bg-[#09090b]">
          {/* Subtle radar background ring decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-[300px] h-[300px] border border-[#22c55e] rounded-full animate-ping" style={{ animationDuration: '4s' }} />
            <div className="w-[450px] h-[450px] border border-white/20 rounded-full absolute" />
          </div>

          {/* SVG Globe */}
          <svg
            viewBox="0 0 800 500"
            className="w-full h-full max-w-[650px] text-white overflow-visible transition-transform duration-300"
          >
            {/* Ambient globe glow */}
            <defs>
              <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Central Globe Circle glow */}
            <circle cx="400" cy="250" r="160" fill="url(#globeGlow)" />

            {/* Globe Wireframe Group with rotation */}
            <g className="origin-[400px_250px] animate-[spin_50s_linear_infinite] motion-reduce:animate-none">
              {/* Globe Outline */}
              <circle cx="400" cy="250" r="165" fill="none" stroke="#27272a" strokeWidth="1" />
              <circle cx="400" cy="250" r="160" fill="none" stroke="#3f3f46" strokeWidth="1.5" />

              {/* Longitudinal arcs */}
              <ellipse cx="400" cy="250" rx="160" ry="60" fill="none" stroke="#27272a" strokeWidth="1" />
              <ellipse cx="400" cy="250" rx="160" ry="110" fill="none" stroke="#27272a" strokeWidth="1" />
              <ellipse cx="400" cy="250" rx="60" ry="160" fill="none" stroke="#27272a" strokeWidth="1" />
              <ellipse cx="400" cy="250" rx="110" ry="160" fill="none" stroke="#27272a" strokeWidth="1" />

              {/* Latitudinal lines */}
              <line x1="240" y1="250" x2="560" y2="250" stroke="#3f3f46" strokeWidth="1.2" />
              <line x1="250" y1="170" x2="550" y2="170" stroke="#27272a" strokeWidth="0.8" />
              <line x1="250" y1="330" x2="550" y2="330" stroke="#27272a" strokeWidth="0.8" />
              <line x1="290" y1="100" x2="510" y2="100" stroke="#27272a" strokeWidth="0.8" />
              <line x1="290" y1="400" x2="510" y2="400" stroke="#27272a" strokeWidth="0.8" />

              {/* Simulated network topology connections */}
              <path d="M 280 200 Q 320 150 400 170" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <path d="M 400 170 Q 480 180 500 250" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <path d="M 500 250 Q 450 330 350 330" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <path d="M 350 330 Q 260 300 280 200" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <path d="M 300 250 Q 400 250 500 250" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <path d="M 400 90 Q 400 250 400 410" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Active edge nodes (emerald green dots) with locator rings */}
              {/* Node 1: North America */}
              <g>
                <circle cx="280" cy="200" r="8" fill="none" stroke="#22c55e" strokeWidth="1" className="animate-pulse" />
                <circle cx="280" cy="200" r="4.5" fill="#22c55e" filter="url(#glow)" />
              </g>
              {/* Node 2: Europe */}
              <g>
                <circle cx="400" cy="170" r="8" fill="none" stroke="#22c55e" strokeWidth="1" className="animate-pulse" />
                <circle cx="400" cy="170" r="4.5" fill="#22c55e" filter="url(#glow)" />
              </g>
              {/* Node 3: Asia */}
              <g>
                <circle cx="500" cy="250" r="8" fill="none" stroke="#22c55e" strokeWidth="1" className="animate-pulse" />
                <circle cx="500" cy="250" r="4.5" fill="#22c55e" filter="url(#glow)" />
              </g>
              {/* Node 4: South America */}
              <g>
                <circle cx="350" cy="330" r="8" fill="none" stroke="#22c55e" strokeWidth="1" className="animate-pulse" />
                <circle cx="350" cy="330" r="4.5" fill="#22c55e" filter="url(#glow)" />
              </g>
            </g>

            {/* Static labels pointing to active nodes */}
            <g className="text-[10px] font-mono fill-[#71717a] transition-all">
              <text x="140" y="195" textAnchor="start">Node: us-east-1</text>
              <line x1="218" y1="192" x2="274" y2="198" stroke="#3f3f46" strokeWidth="0.8" strokeDasharray="3 3" />
              <circle cx="218" cy="192" r="1.5" fill="#71717a" />

              <text x="400" y="115" textAnchor="middle">Node: eu-west-1</text>
              <line x1="400" y1="125" x2="400" y2="162" stroke="#3f3f46" strokeWidth="0.8" strokeDasharray="3 3" />
              <circle cx="400" cy="125" r="1.5" fill="#71717a" />

              <text x="590" y="245" textAnchor="end">Node: ap-northeast-1</text>
              <line x1="508" y1="249" x2="528" y2="243" stroke="#3f3f46" strokeWidth="0.8" strokeDasharray="3 3" />
              <circle cx="528" cy="243" r="1.5" fill="#71717a" />
            </g>
          </svg>

          {/* Telemetry panel floating in bottom corner */}
          <div className="absolute bottom-4 right-4 bg-[#161618]/90 border border-[#27272a] p-3 rounded-xl font-mono text-[10px] text-[#86868b] flex items-center gap-4 shadow-xl select-none backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-[#FAFAFA] font-semibold">ALL EDGE NODES OPERATIONAL</span>
            </div>
            <span className="text-[#71717a] hidden sm:inline">RTT: 12ms avg</span>
            <span className="text-[#71717a] hidden sm:inline">99.99% SLA</span>
          </div>
        </div>
      </div>
    </section>
  );
}

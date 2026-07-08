'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Info, CloudLightning } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function PricingPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'annually'>('monthly');

  const tiers = [
    {
      id: 'hobby',
      name: 'Hobby',
      price: billingPeriod === 'monthly' ? '$0' : '$0',
      description: 'Perfect for personal projects and deploying hobby sites.',
      features: [
        '100 GB global edge bandwidth',
        '1,000 automated build minutes / mo',
        '1 active concurrent deployment pipeline',
        'Community Slack support access',
        'Automated SSL certificates'
      ],
      cta: 'Start Deploying Free',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingPeriod === 'monthly' ? '$20' : '$16',
      description: 'Ideal for scaling startups and active production workloads.',
      features: [
        '1 TB global edge bandwidth (+$0.10/GB excess)',
        'Unlimited automated build minutes / mo',
        '3 active concurrent deployment pipelines',
        'Priority email support (under 4 hr RTT)',
        'Custom domains with automated SSL mapping',
        'Password protected deployments'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'Custom setups requiring SLA guarantees and security.',
      features: [
        'Unlimited bandwidth and pipelines',
        'Dedicated global Edge proxy nodes',
        '99.99% network SLA guarantee',
        'Single Sign-On (SAML SSO) integration',
        'Dedicated engineering account manager',
        'Custom isolated VPC nodes'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] font-sans flex flex-col">
      {/* Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#1f1f1f] px-6 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <CloudLightning className="h-5 w-5 text-white animate-pulse" />
          <span className="font-semibold text-sm tracking-tight text-white font-mono uppercase">NEBULA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-[#A1A1AA]">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="text-white">Pricing</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors">Log In</Link>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono px-3 py-1.5 rounded-sm transition-all"
          >
            Deploy Now
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-20 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Transparent, utility-based pricing.
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
            Choose a tier that matches your deployment lifecycle. Scale dynamically as traffic fluctuates without hidden surcharges.
          </p>

          {/* Toggle Monthly/Annually */}
          <div className="inline-flex items-center border border-[#1f1f1f] bg-[#111113] p-1 rounded-md mt-6 select-none">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1 text-xs font-mono rounded-sm transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-black font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annually')}
              className={`px-4 py-1 text-xs font-mono rounded-sm transition-all flex items-center gap-1.5 ${
                billingPeriod === 'annually'
                  ? 'bg-white text-black font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <span>Annually</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded-sm">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`border p-6 rounded-md flex flex-col justify-between transition-all duration-300 relative ${
                tier.popular
                  ? 'bg-[#111113] border-white/40 shadow-2xl scale-[1.02] ring-2 ring-white/10'
                  : 'bg-[#09090b] border-[#1f1f1f] hover:border-zinc-700'
              }`}
            >
              {tier.popular && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-white text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                  Popular
                </span>
              )}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-white uppercase font-mono">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1">
                    {tier.description}
                  </p>
                </div>

                <div className="py-2 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-white">
                    {tier.price}
                  </span>
                  {tier.price !== 'Custom' && (
                    <span className="text-xs text-[#71717A] font-mono">/ mo</span>
                  )}
                </div>

                <div className="h-[1px] bg-[#1f1f1f]" />

                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#A1A1AA] leading-normal">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={() => router.push('/login')}
                  className={`w-full py-2 text-xs font-bold font-mono rounded-sm transition-all cursor-pointer ${
                    tier.popular
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'border border-[#1f1f1f] bg-[#09090b] hover:bg-[#111113] text-[#FAFAFA]'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SLA Notice */}
        <div className="flex items-center gap-3 p-4 border border-[#1f1f1f] bg-[#111113]/30 rounded-md max-w-2xl mx-auto select-none">
          <Info className="w-4 h-4 text-[#A1A1AA] shrink-0" />
          <p className="text-xs text-[#A1A1AA] leading-normal">
            Need HIPAA compliance, SOC2 Type II reports, or custom storage nodes? Check our Enterprise details or contact our solutions coordinators.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] py-8 text-center text-xs font-mono text-[#71717A]">
        © {new Date().getFullYear()} Nebula Org. All rights reserved.
      </footer>
    </div>
  );
}

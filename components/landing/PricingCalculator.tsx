'use client';

import * as React from 'react';
import { useLandingPage, PricingTierType } from './LandingPageContext';
import { Check, Info, ShieldAlert, Cpu } from 'lucide-react';

interface TierSpec {
  id: PricingTierType;
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
}

const TIERS: TierSpec[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: '$0',
    description: 'Perfect for personal projects and deploying hobby sites.',
    features: [
      '100 GB global edge bandwidth',
      '1,000 automated build minutes / mo',
      '1 active concurrent deployment pipeline',
      'Community Slack support access',
    ],
    cta: 'Start Deploying Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$20',
    description: 'Ideal for scaling startups and active production workloads.',
    features: [
      '1 TB global edge bandwidth (+$0.10/GB excess)',
      'Unlimited automated build minutes / mo',
      '3 active concurrent deployment pipelines',
      'Priority email support (under 4 hr RTT)',
      'Custom domains with automated SSL mapping',
    ],
    cta: 'Upgrade to Pro Workspace',
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
    ],
    cta: 'Contact Nebula Sales',
  },
];

export function PricingCalculator() {
  const { pricingTier, setPricingTier } = useLandingPage();

  return (
    <section className="w-full bg-[#ffffff] py-24 px-6 md:px-12 lg:px-24 flex flex-col items-center border-b border-[#e8e8ed]">
      {/* Title */}
      <div className="max-w-3xl text-center mb-16">
        <h2 className="text-3xl sm:text-5xl font-bold text-[#1d1d1f] tracking-[-0.035em] mb-4">
          Transparent, utility-based pricing.
        </h2>
        <p className="text-base sm:text-lg text-[#86868b] leading-relaxed tracking-tight max-w-xl mx-auto font-medium">
          Choose a tier that matches your deployment lifecycle. Scale dynamically as traffic fluctuates without hidden surcharges.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl items-stretch">
        {TIERS.map((tier) => {
          const isSelected = pricingTier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => setPricingTier(tier.id)}
              className={`p-8 rounded-[22px] border transition-all duration-300 flex flex-col justify-between cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#1d1d1f] border-transparent text-white shadow-2xl scale-[1.03] ring-4 ring-[#5e5ce6]/25'
                  : 'bg-[#fbfbfd] border-[#d2d2d7] text-[#1d1d1f] hover:border-[#86868b] hover:shadow-md'
              }`}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-xl font-bold tracking-tight ${isSelected ? 'text-white' : 'text-[#1d1d1f]'}`}>
                      {tier.name}
                    </h3>
                    <p className={`text-xs mt-1 leading-normal ${isSelected ? 'text-zinc-400' : 'text-[#86868b]'}`}>
                      {tier.description}
                    </p>
                  </div>
                  {tier.id === 'pro' && (
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/10 text-white' : 'bg-[#e8e8ed] text-[#5e5ce6]'
                    }`}>
                      Popular
                    </span>
                  )}
                </div>

                {/* Price block */}
                <div className="py-2">
                  <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight font-sans ${isSelected ? 'text-white' : 'text-[#1d1d1f]'}`}>
                    {tier.price}
                  </span>
                  {tier.price !== 'Custom' && (
                    <span className={`text-xs ml-1 font-semibold ${isSelected ? 'text-zinc-400' : 'text-[#86868b]'}`}>
                      / month
                    </span>
                  )}
                </div>

                <div className={`h-[1px] ${isSelected ? 'bg-zinc-800' : 'bg-[#e8e8ed]'}`} />

                {/* Features list */}
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs leading-normal">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#22c55e]' : 'text-[#5e5ce6]'}`} />
                      <span className={isSelected ? 'text-zinc-300' : 'text-[#1d1d1f]'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  className={`w-full py-3 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-white text-[#1d1d1f] hover:bg-zinc-100'
                      : 'bg-[#1d1d1f] text-white hover:bg-[#2d2d2f]'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA note */}
      <div className="mt-12 flex items-center gap-2 p-3.5 bg-[#f5f5f7] border border-[#e8e8ed] rounded-xl text-[10px] text-[#86868b] max-w-md select-none font-medium">
        <Info className="w-4 h-4 text-[#5e5ce6] shrink-0" />
        <span>
          Need HIPAA compliance, SOC2 Type II reports, or custom storage nodes? Check our Enterprise details or contact our solutions coordinators.
        </span>
      </div>
    </section>
  );
}

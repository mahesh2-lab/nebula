'use client';

import * as React from 'react';
import { toast } from 'sonner';

export type FeatureType = 'git' | 'telemetry' | 'secrets';
export type PricingTierType = 'hobby' | 'pro' | 'enterprise';

interface LandingPageContextType {
  activeFeature: FeatureType;
  setActiveFeature: (feature: FeatureType) => void;
  pricingTier: PricingTierType;
  setPricingTier: (tier: PricingTierType) => void;
  submitWaitlist: (email: string) => Promise<boolean>;
}

const LandingPageContext = React.createContext<LandingPageContextType | undefined>(undefined);

export function LandingPageProvider({ children }: { children: React.ReactNode }) {
  const [activeFeature, setActiveFeature] = React.useState<FeatureType>('git');
  const [pricingTier, setPricingTier] = React.useState<PricingTierType>('hobby');

  const submitWaitlist = async (email: string): Promise<boolean> => {
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success('Thank you! You have been added to the Nebula waitlist.', {
          description: `We will contact you at ${email} as spots open.`,
        });
        resolve(true);
      }, 800);
    });
  };

  return (
    <LandingPageContext.Provider
      value={{
        activeFeature,
        setActiveFeature,
        pricingTier,
        setPricingTier,
        submitWaitlist,
      }}
    >
      {children}
    </LandingPageContext.Provider>
  );
}

export function useLandingPage() {
  const context = React.useContext(LandingPageContext);
  if (!context) {
    throw new Error('useLandingPage must be used within a LandingPageProvider');
  }
  return context;
}

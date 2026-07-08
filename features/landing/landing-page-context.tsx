'use client';

import * as React from 'react';
import { toast } from 'sonner';

export type PricingTier = 'hobby' | 'pro' | 'enterprise';
export type FeatureTab = 'deployment' | 'analytics' | 'edge' | 'secrets';

export interface LandingPageContextProps {
  activeFeature: FeatureTab;
  setActiveFeature: (tab: FeatureTab) => void;
  pricingTier: PricingTier;
  setPricingTier: (tier: PricingTier) => void;
  emailInput: string;
  setEmailInput: (email: string) => void;
  isSubmitting: boolean;
  submitWaitlist: (e: React.FormEvent) => Promise<void>;
}

const LandingPageContext = React.createContext<LandingPageContextProps | undefined>(undefined);

export function LandingPageProvider({ children }: { children: React.ReactNode }) {
  const [activeFeature, setActiveFeature] = React.useState<FeatureTab>('deployment');
  const [pricingTier, setPricingTier] = React.useState<PricingTier>('hobby');
  const [emailInput, setEmailInput] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API waitlist write
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setEmailInput('');
    toast.success('Successfully subscribed to Nebula early access waitlist!');
  };

  return (
    <LandingPageContext.Provider value={{
      activeFeature,
      setActiveFeature,
      pricingTier,
      setPricingTier,
      emailInput,
      setEmailInput,
      isSubmitting,
      submitWaitlist
    }}>
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

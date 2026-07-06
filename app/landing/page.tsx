'use client';

import * as React from 'react';
import { LandingPageProvider } from '../../components/context/landing-page-context';
import { LandingPage } from '../../components/landing/LandingPage';

export default function Page() {
  return (
    <LandingPageProvider>
      <LandingPage />
    </LandingPageProvider>
  );
}

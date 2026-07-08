'use client';

import * as React from 'react';
import { LandingPageProvider } from '../features/landing/landing-page-context';
import { LandingPage } from '../features/landing/LandingPage';

export const dynamic = 'force-static';

export default function Home() {
  return (
    <LandingPageProvider>
      <LandingPage />
    </LandingPageProvider>
  );
}

'use client';

import * as React from 'react';
import { UserSettings } from '@/features/projects/user-settings';

export default function UserSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8">
      <UserSettings />
    </div>
  );
}

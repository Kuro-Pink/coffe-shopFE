// components/layout/HostClientLayout.tsx
'use client';

import { ReactNode } from 'react';
import HostLayoutContent from './HostLayoutContent';

export default function HostClientLayout({ children }: { children: ReactNode }) {
  return <HostLayoutContent>{children}</HostLayoutContent>;
}

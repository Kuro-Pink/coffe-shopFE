// app/host/layout.tsx
import { ReactNode } from 'react';
import HostClientLayout from '@/components/layout/HostClientLayout';

export default function HostLayout({ children }: { children: ReactNode }) {
  return <HostClientLayout>{children}</HostClientLayout>;
}

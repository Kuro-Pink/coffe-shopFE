'use client';

import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function StoreInfoLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['host']}>{children}</ProtectedRoute>;
}

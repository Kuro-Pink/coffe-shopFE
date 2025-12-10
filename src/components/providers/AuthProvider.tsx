'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    // ✅ Lắng nghe event logout từ interceptor
    const handleLogout = () => {
      logout();
      router.push('/login'); // ✅ Next.js router - không reload
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [logout, router]);

  return <>{children}</>;
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'host')[];
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, token, initAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      initAuth();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentState = useAuthStore.getState();
      const hasToken = currentState.token;
      const isAuth = currentState.isAuthenticated;
      const currentUser = currentState.user;

      console.log('🔐 Auth check:', { hasToken, isAuth, user: currentUser });

      // Nếu chưa login → redirect login
      if (!hasToken || !isAuth) {
        console.log('❌ Not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      // Nếu role không được phép → redirect về trang chủ role đó
      if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
        console.log('❌ Wrong role, redirecting');
        if (currentUser.role === 'admin') {
          router.push('/admin');
        } else if (currentUser.role === 'host') {
          router.push('/host');
        }
        return;
      }

      console.log('✅ Auth check passed');
      setIsChecking(false);
    };

    checkAuth();
  }, [router, allowedRoles, initAuth]);

  // Loading state khi đang check auth
  if (isChecking) {
    return <LoadingSpinner />;
  }

  // Sau khi check xong, kiểm tra lại lần cuối
  if (!isAuthenticated || !token) {
    return <LoadingSpinner />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
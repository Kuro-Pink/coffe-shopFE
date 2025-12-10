'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

export default function AuthInitializer() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    // ✅ Init auth khi app load
    initAuth();
  }, [initAuth]);

  return null;
}
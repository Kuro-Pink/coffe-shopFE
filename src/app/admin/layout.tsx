'use client';

import { ReactNode, useEffect } from 'react';
import {
  Dashboard,
  Store,
  People,
  Settings,
  AdminPanelSettings,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ToastProvider } from '@/components/common/Toast';
import { SidebarMenuItem  } from '@/types';
import { useStoreRequestStore } from '@/lib/stores/storeRequestStore';

const adminTheme = {
  sidebar: {
    gradient: 'from-blue-600 to-purple-600',
    bgGradient: 'from-blue-900 to-purple-800',
    activeGradient: 'from-blue-600 to-purple-600',
    hoverBg: 'bg-purple-700',
    dividerColor: 'bg-purple-700',
    bottomBg: 'bg-purple-900/50',
    bottomBorder: 'border-purple-700',
    avatarGradient: 'from-blue-500 to-purple-600',
  },
  topbar: {
    bgColor: 'bg-gradient-to-r from-purple-600 to-blue-600',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-700',
    avatarGradient: 'from-blue-500 to-purple-600',
  },
};

const logo = {
  icon: <AdminPanelSettings className="text-blue-600" />,
  title: 'Admin Panel',
  subtitle: 'Quản trị hệ thống',
};

// ✅ TẠO COMPONENT CON ĐỂ DÙNG HOOK
function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { pendingCount, fetchRequests } = useStoreRequestStore();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ✅ DYNAMIC MENU ITEMS
  const menuItems: SidebarMenuItem[] = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Quản lý cửa hàng', icon: <Store />, path: '/admin/stores' },
    {
      text: 'Tài khoản Host',
      icon: <People />,
      path: '/admin/store-requests',
      badge: pendingCount ? pendingCount : undefined, 
      badgeColor: 'warning',
    },
    { text: 'Cài đặt', icon: <Settings />, path: '/admin/settings' },
  ];

  return (
    <DashboardLayout
      allowedRoles={['admin']}
      menuItems={menuItems}
      logo={logo}
      theme={adminTheme}
      notificationCount={3}
    >
      {children}
    </DashboardLayout>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ToastProvider />
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </>
  );
}
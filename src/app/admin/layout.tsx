'use client';

import { ReactNode } from 'react';
import {
  Dashboard,
  Store,
  People,
  Settings,
  AdminPanelSettings,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Quản lý cửa hàng', icon: <Store />, path: '/admin/stores' },
  { text: 'Tài khoản Host', icon: <People />, path: '/admin/store-requests' },
  { text: 'Cài đặt', icon: <Settings />, path: '/admin/settings' },
];

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

export default function AdminLayout({ children }: { children: ReactNode }) {
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
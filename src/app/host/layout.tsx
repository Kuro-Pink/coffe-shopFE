'use client';

import { ReactNode } from 'react';
import {
  Dashboard,
  Restaurant,
  TableBar,
  Receipt,
  BarChart,
  StoreMallDirectory,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/host' },
  { text: 'Quản lý Menu', icon: <Restaurant />, path: '/host/menu' },
  { text: 'Quản lý Bàn', icon: <TableBar />, path: '/host/tables' },
  { text: 'Đơn hàng', icon: <Receipt />, path: '/host/orders' },
  { text: 'Thống kê', icon: <BarChart />, path: '/host/stats' },
];

const hostTheme = {
  sidebar: {
    gradient: 'from-green-600 to-teal-600',
    bgGradient: 'from-green-900 to-teal-800',
    activeGradient: 'from-green-600 to-teal-600',
    hoverBg: 'bg-teal-700',
    dividerColor: 'bg-teal-700',
    bottomBg: 'bg-teal-900/50',
    bottomBorder: 'border-teal-700',
    avatarGradient: 'from-green-500 to-teal-600',
  },
  topbar: {
    bgColor: 'bg-gradient-to-r from-teal-600 to-green-600',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-700',
    avatarGradient: 'from-green-500 to-teal-600',
  },
};

const logo = {
  icon: <StoreMallDirectory className="text-green-600" />,
  title: 'Host Panel',
  subtitle: 'Quản lý nhà hàng',
};

export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout
      allowedRoles={['host']}
      menuItems={menuItems}
      logo={logo}
      theme={hostTheme}
      notificationCount={5}
    >
      {children}
    </DashboardLayout>
  );
}
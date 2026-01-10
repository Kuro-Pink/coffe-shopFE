'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Container } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuthStore } from '@/lib/stores/authStore';
import { SidebarMenuItem } from '@/types';

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'host' | 'staff')[];
  menuItems: SidebarMenuItem[];
  logo: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  };
  theme: {
    sidebar: {
      gradient: string;
      bgGradient: string;
      activeGradient: string;
      hoverBg: string;
      dividerColor: string;
      bottomBg: string;
      bottomBorder: string;
      avatarGradient: string;
    };
    topbar: {
      bgColor: string;
      borderColor: string;
      textColor: string;
      iconColor: string;
      avatarGradient: string;
    };
  };
  notificationCount?: number;
}

const DRAWER_WIDTH = 260;

export default function DashboardLayout({
  children,
  allowedRoles,
  menuItems,
  logo,
  theme,
  notificationCount = 0,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    // Initialize auth từ cookie khi app mount
    initAuth();
  }, [initAuth]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Get current page title from menu items
  const currentTitle = menuItems.find((item) => item.path === pathname)?.text || 'Dashboard';

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Box className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          drawerWidth={DRAWER_WIDTH}
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
          logo={logo}
          theme={theme.sidebar}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: { md: `${DRAWER_WIDTH}px` },
            height: '100vh',
            overflow: 'auto',
          }}
        >
          {/* Top Bar */}
          <Header
            title={currentTitle}
            onDrawerToggle={handleDrawerToggle}
            notificationCount={notificationCount}
            theme={theme.topbar}
          />

          {/* Page Content */}
          <Container maxWidth="xl" className="py-8">
            {children}
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}

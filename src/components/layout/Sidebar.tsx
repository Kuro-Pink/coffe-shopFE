'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Typography,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Badge,
  Chip,
  Collapse,
} from '@mui/material';
import NextLink from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { SidebarMenuItem } from '@/types';
import { useState, useEffect } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useOrderBadgeStore } from '@/lib/stores/orderBadgeStore';

interface SidebarProps {
  menuItems: SidebarMenuItem[];
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  logo: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  };
  theme: {
    gradient: string;
    bgGradient: string;
    activeGradient: string;
    hoverBg: string;
    dividerColor: string;
    bottomBg: string;
    bottomBorder: string;
    avatarGradient: string;
  };
}

export default function Sidebar({
  menuItems,
  drawerWidth,
  mobileOpen,
  onDrawerToggle,
  logo,
  theme,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const pendingCount = useOrderBadgeStore((s) => s.pendingCount);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};

    menuItems.forEach((item) => {
      if (item.children?.some((c) => c.path === pathname)) {
        state[item.text] = true;
      }
    });

    return state;
  });

  const drawerContent = (
    <div className={`h-full bg-gradient-to-b ${theme.bgGradient}`}>
      {/* Logo Section */}
      <div className={`px-6 py-4 bg-gradient-to-r ${theme.gradient}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            {logo.icon}
          </div>
          <div>
            <Typography variant="h6" className="text-white font-bold">
              {logo.title}
            </Typography>
            <Typography variant="caption" className="text-white/80">
              {logo.subtitle}
            </Typography>
          </div>
        </div>
      </div>

      <Divider className={theme.dividerColor} />

      {/* Menu Items */}
      <List className="px-3 py-4">
        {menuItems.map((item) => {
          const hasChildren = !!item.children?.length;
          const isActive = item.path ? pathname === item.path : false;

          return (
            <div key={item.path ?? item.text}>
              {/* ITEM CHA */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (hasChildren) {
                      setOpenMenus((prev) => ({
                        ...prev,
                        [item.text]: !prev[item.text],
                      }));
                    }
                  }}
                  component={!hasChildren && item.path ? NextLink : 'div'}
                  href={!hasChildren ? item.path : undefined}
                  selected={isActive}
                  className={`rounded-lg mx-2 mb-1 ${
                    isActive ? `bg-gradient-to-r ${theme.activeGradient}` : `hover:${theme.hoverBg}`
                  }`}
                  sx={{ color: 'white' }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.text === 'Đơn hàng' && pendingCount > 0 && (
                    <Badge badgeContent={pendingCount} color="error" />
                  )}
                  {hasChildren && (openMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>

              {/* SUB MENU */}
              {hasChildren && (
                <Collapse in={openMenus[item.text]} timeout={200} unmountOnExit>
                  {item.children!.map((child) => {
                    const childActive = pathname === child.path;

                    return (
                      <ListItem key={child.path} disablePadding sx={{ pl: 3 }}>
                        <ListItemButton
                          component={NextLink}
                          href={child.path!}
                          selected={childActive}
                          className={`rounded-lg mx-2 mb-1 ${
                            childActive
                              ? `bg-gradient-to-r ${theme.activeGradient}`
                              : `hover:${theme.hoverBg}`
                          }`}
                          sx={{ color: 'white' }}
                        >
                          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText primary={child.text} />
                          {item.text === 'Đơn hàng' && pendingCount > 0 && (
                            <Badge badgeContent={pendingCount} color="error" />
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </Collapse>
              )}
            </div>
          );
        })}
      </List>

      {/* User Info at Bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 ${theme.bottomBg} border-t ${theme.bottomBorder}`}
      >
        <div className="flex items-center gap-3">
          <Avatar className={`bg-gradient-to-br ${theme.avatarGradient}`}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <div className="flex-1 min-w-0">
            <Typography variant="body2" className="text-white font-semibold truncate">
              {user?.name}
            </Typography>
            <Typography variant="caption" className="text-gray-200 truncate">
              {user?.email}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings,
  Logout,
  Notifications,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';

interface HeaderProps {
  title: string;
  onDrawerToggle: () => void;
  notificationCount?: number;
  theme: {
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
    avatarGradient: string;
  };
}

export default function Header({
  title,
  onDrawerToggle,
  notificationCount = 0,
  theme,
}: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <AppBar position="sticky" elevation={0} color="transparent">
      <Toolbar className={`${theme.bgColor} border-b ${theme.borderColor}`}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
          className={theme.iconColor}
        >
          <MenuIcon />
        </IconButton>

        {/* Notifications */}
        <IconButton color="inherit" className={`${theme.iconColor}`} sx={{ ml: 'auto', mr: 2 }}>
          <Badge badgeContent={notificationCount} color="error">
            <Notifications />
          </Badge>
        </IconButton>

        {/* User Menu */}
        <IconButton onClick={handleMenuOpen}>
          <Avatar className={`bg-gradient-to-br ${theme.avatarGradient} w-10 h-10`}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Settings fontSize="small" className="mr-2" />
            Cài đặt
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} className="text-red-600">
            <Logout fontSize="small" className="mr-2" />
            Đăng xuất
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
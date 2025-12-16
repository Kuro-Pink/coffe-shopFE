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
import Tooltip from '@mui/material/Tooltip';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { Button } from '@mui/material';
import { unlockNotificationSoundByUserGesture } from '@/utils/notificationSound';
import { showToast } from '@/components/common/Toast';
import { useSoundStore } from '@/lib/stores/soundStore'

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

  const soundEnabled = useSoundStore(s => s.enabled);
  const enableSound = useSoundStore(s => s.enable);

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
         <Tooltip title={soundEnabled ? 'Âm thanh đã bật' : 'Bật âm thanh thông báo'}>
          <span>
            <IconButton
              color={soundEnabled ? 'success' : 'default'}
              disabled={soundEnabled}
              onClick={async () => {
                try {
                  await unlockNotificationSoundByUserGesture(); // 🔓 browser
                  enableSound();                               // 🔊 user preference
                  showToast.success({ message: '🔊 Đã bật âm thanh thông báo' });
                } catch {
                  showToast.error({ message: '❌ Không thể bật âm thanh' });
                }
              }}
            >
              {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </span>
        </Tooltip>
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
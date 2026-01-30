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
  Box,
} from '@mui/material';
import { Menu as MenuIcon, Settings, Logout, Notifications, Person } from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import Tooltip from '@mui/material/Tooltip';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { unlockNotificationSoundByUserGesture } from '@/utils/notificationSound';
import { showToast } from '@/components/common/Toast';
import { useSoundStore } from '@/lib/stores/soundStore';
import { useStoreStore } from '@/lib/stores/storeStore';

interface HeaderProps {
  title: string;
  store?: {
    name: string;
    phone?: string;
    address?: string;
    logo?: string;
  };
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
  const store = useStoreStore((s) => s.store);
  console.log('store', store);
  console.log('user', user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const soundEnabled = useSoundStore((s) => s.enabled);
  const enableSound = useSoundStore((s) => s.enable);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGoProfile = () => {
    handleMenuClose();
    router.push('/host/profile');
  };
  const handleGoSetting = () => {
    handleMenuClose();
    router.push('/host/store-info');
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <AppBar position="sticky" elevation={0} color="transparent">
      <Toolbar className={`${theme.bgColor} border-b ${theme.borderColor}`}>
        {store && (
          <Box
            sx={{
              height: 89,
              display: 'flex',
              alignItems: 'center',
              gap: 4, // 👈 kéo 2 khối lại gần nhau

              color: '#fff',
            }}
          >
            {/* TÊN QUÁN */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,

                px: 2.2,
                py: 0.5,
                borderRadius: '16px',

                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.35)',
                color: '#fff',

                boxShadow: `
      0 8px 24px rgba(0,0,0,0.25),
      inset 0 1px 0 rgba(255,255,255,0.35)
    `,
              }}
            >
              {/* LOGO INLINE */}
              <Avatar
                src={store.logo}
                alt={store.name}
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '8px', // ❗ vuông bo nhẹ → KHÁC avatar user
                  border: '1px solid rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(255,255,255,0.25)',
                }}
              />

              {/* NAME */}
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {store.name}
              </Typography>
            </Box>

            {/* PHONE + ADDRESS */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: 0.95,
                }}
              >
                📞 {store.phone}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  lineHeight: 1.3,
                }}
              >
                📍 {store.address}
              </Typography>
            </Box>
          </Box>
        )}

        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
          className={theme.iconColor}
        >
          <MenuIcon />
        </IconButton>

        {/* RIGHT ACTIONS */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          {/* Sound */}
          <Tooltip title={soundEnabled ? 'Âm thanh đã bật' : 'Bật âm thanh thông báo'}>
            <span>
              <IconButton
                color={soundEnabled ? 'success' : 'default'}
                disabled={soundEnabled}
                onClick={async () => {
                  try {
                    await unlockNotificationSoundByUserGesture();
                    enableSound();
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

          {/* Notifications */}
          <IconButton color="inherit" className={theme.iconColor} sx={{ mx: 1 }}>
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Avatar */}
          <IconButton onClick={handleMenuOpen}>
            <Avatar
              src={user?.avatar}
              className={`bg-gradient-to-br ${theme.avatarGradient} w-10 h-10`}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleGoProfile}>
            <Person fontSize="small" className="mr-2" />
            Hồ sơ
          </MenuItem>
          <MenuItem onClick={handleGoSetting}>
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

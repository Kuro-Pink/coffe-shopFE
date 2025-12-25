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
} from '@mui/material';
import NextLink from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { MenuItem } from '@/types';

interface SidebarProps {
  menuItems: MenuItem[];
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

  const drawerContent = (
    <div className={`h-full bg-gradient-to-b ${theme.bgGradient}`}>
      {/* Logo Section */}
      <div className={`p-6 bg-gradient-to-r ${theme.gradient}`}>
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
       {menuItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            component={NextLink}
            href={item.path}
            prefetch
            selected={pathname === item.path}
            className={`rounded-lg mx-2 mb-1 ${
              pathname === item.path
                ? `bg-gradient-to-r ${theme.activeGradient} shadow-lg`
                : `hover:${theme.hoverBg}`
            }`}
            sx={{ color: 'white' }}
          >
            <ListItemIcon 
              sx={{ 
                color: 'inherit',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                className: pathname === item.path ? 'font-semibold' : '',
              }}
            />
            {item.badge && item.badge > 0 && (
              <Chip
                label={item.badge}
                size="small"
                color={item.badgeColor || 'error'}
                sx={{
                  height: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      ))}
      </List>

      {/* User Info at Bottom */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 ${theme.bottomBg} border-t ${theme.bottomBorder}`}>
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
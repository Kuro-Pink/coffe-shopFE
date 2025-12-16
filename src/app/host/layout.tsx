'use client';

import { ReactNode, useEffect, useRef } from 'react';
import {
  Dashboard,
  Restaurant,
  TableBar,
  Receipt,
  StoreMallDirectory,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ToastProvider, showToast } from '@/components/common/Toast';
import { MenuItem } from '@/types';
import { useAuthStore } from '@/lib/stores/authStore';
import { useOrderBadgeStore } from '@/lib/stores/orderBadgeStore';
import { initSocket, disconnectSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { useOrderNotifyStore } from '@/lib/stores/orderNotifyStore';
import {
  playNotificationSound,
  stopNotificationSound,
} from '@/utils/notificationSound';
import OrderNotification from '@/components/host/OrderManager/OrderNotification';
import { useRouter } from 'next/navigation';
import { useSoundStore } from '@/lib/stores/soundStore'

function HostLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const showNotify = useOrderNotifyStore(s => s.show);
  const closeNotify = useOrderNotifyStore(s => s.close);
  const notifyOpen = useOrderNotifyStore(s => s.open);
  const notifyOrder = useOrderNotifyStore(s => s.order);

  const fetchOrders = useOrderBadgeStore((s) => s.fetchOrders);
  const pendingCount = useOrderBadgeStore((s) => s.pendingCount);
  const setLatestOrder = useOrderBadgeStore((s) => s.setLatestOrder);
  const addOrder = useOrderBadgeStore((s) => s.addOrder);
  const updateOrder = useOrderBadgeStore((s) => s.updateOrder);

  const soundEnabled = useSoundStore(s => s.enabled);

  const socketRef = useRef<Socket | null>(null);

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

  // 🔹 FETCH ORDERS 1 LẦN
  useEffect(() => {
    if (user?.storeId) {
      fetchOrders(user.storeId);
    }
  }, [user?.storeId, fetchOrders]);

  // 🔹 SOCKET GLOBAL
  useEffect(() => {
    if (!user?.storeId || socketRef.current) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = initSocket(user.storeId, token);
    socketRef.current = socket;

    // 🔔 NEW ORDER
    socket.on('new_order', (order) => {
      addOrder(order);
      showNotify(order);

      if (soundEnabled) {
        playNotificationSound();
      }

      showToast.success({
        message: `🔔 Có đơn hàng mới #${order._id.slice(-6)}`,
      });
    });

    // 🔄 UPDATE ORDER
    socket.on('order_status_update', (updatedOrder) => {
      updateOrder(updatedOrder);
    });

    return () => {
      socketRef.current = null;
      disconnectSocket();
    };
  }, [user?.storeId, addOrder, updateOrder]);

  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/host' },
    { text: 'Quản lý Menu', icon: <Restaurant />, path: '/host/menu' },
    { text: 'Quản lý Bàn', icon: <TableBar />, path: '/host/tables' },
    {
      text: 'Đơn hàng',
      icon: <Receipt />,
      path: '/host/orders',
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'error',
    },
  ];

  return (
    <>
      <DashboardLayout
        allowedRoles={['host']}
        menuItems={menuItems}
        logo={{
          icon: <StoreMallDirectory className="text-green-600" />,
          title: 'Host Panel',
          subtitle: 'Quản lý nhà hàng',
        }}
        theme={hostTheme}
        notificationCount={pendingCount}
      >
        {children}
      </DashboardLayout>

      {/* 🔔 GLOBAL ORDER NOTIFICATION */}
      <OrderNotification
        open={notifyOpen}
        order={notifyOrder}
        onClose={() => {
          stopNotificationSound();
          closeNotify();
        }}
        onView={() => {
          stopNotificationSound();
          closeNotify();
          router.push('/host/orders');
        }}
      />
    </>
  );
}

export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ToastProvider />
      <HostLayoutContent>{children}</HostLayoutContent>
    </>
  );
}

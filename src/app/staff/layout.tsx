'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { TableBar, Receipt, Person } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ToastProvider, showToast } from '@/components/common/Toast';
import { SidebarMenuItem } from '@/types';
import { useAuthStore } from '@/lib/stores/authStore';
import { useOrderBadgeStore } from '@/lib/stores/orderBadgeStore';
import { initSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { useOrderNotifyStore } from '@/lib/stores/orderNotifyStore';
import { playNotificationSound, stopNotificationSound } from '@/utils/notificationSound';
import OrderNotification from '@/components/host/OrderManager/OrderNotification';
import { useRouter } from 'next/navigation';
import { useSoundStore } from '@/lib/stores/soundStore';
function StaffLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const showNotify = useOrderNotifyStore((s) => s.show);
  const closeNotify = useOrderNotifyStore((s) => s.close);
  const notifyOpen = useOrderNotifyStore((s) => s.open);
  const notifyOrder = useOrderNotifyStore((s) => s.order);
  const fetchOrders = useOrderBadgeStore((s) => s.fetchOrders);
  const pendingCount = useOrderBadgeStore((s) => s.pendingCount);
  const addOrder = useOrderBadgeStore((s) => s.addOrder);
  const updateOrder = useOrderBadgeStore((s) => s.updateOrder);
  const soundEnabled = useSoundStore((s) => s.enabled);
  const socketRef = useRef<Socket | null>(null);
  const staffTheme = {
    sidebar: {
      gradient: 'from-cyan-600 to-blue-600',
      bgGradient: 'from-cyan-900 to-blue-800',
      activeGradient: 'from-cyan-600 to-blue-600',
      hoverBg: 'bg-blue-700',
      dividerColor: 'bg-blue-700',
      bottomBg: 'bg-blue-900/50',
      bottomBorder: 'border-blue-700',
      avatarGradient: 'from-cyan-500 to-blue-600',
    },
    topbar: {
      bgColor: 'bg-gradient-to-r from-blue-600 to-cyan-600',
      borderColor: 'border-blue-200',
      textColor: 'border-blue-800',
      iconColor: 'text-blue-700',
      avatarGradient: 'from-cyan-500 to-blue-600',
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
      socket.disconnect();
    };
  }, [user?.storeId, addOrder, updateOrder, showNotify, soundEnabled]);
  console.log('StaffLayout render pendingCount', { pendingCount });
  const menuItems: SidebarMenuItem[] = [
    {
      text: 'Đơn hàng',
      icon: <Receipt />,
      path: '/staff',
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'error',
    },
    { text: 'Quản lý Bàn', icon: <TableBar />, path: '/staff/tables' },
  ];
  return (
    <>
      <DashboardLayout
        allowedRoles={['staff']}
        menuItems={menuItems}
        logo={{
          icon: <Person className="text-cyan-600" />,
          title: 'Staff Panel',
          subtitle: 'Nhân viên phục vụ',
        }}
        theme={staffTheme}
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
          router.push('/staff/orders');
        }}
      />
    </>
  );
}
export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ToastProvider />
      <StaffLayoutContent>{children}</StaffLayoutContent>
    </>
  );
}

'use client';
import { ReactNode, useEffect, useRef } from 'react';
import {
  Dashboard,
  Restaurant,
  TableBar,
  Receipt,
  StoreMallDirectory,
  AssignmentTurnedIn,
  Person,
  TrendingUp,
  Inventory,
  AccessTime,
  MoneyOff,
} from '@mui/icons-material';
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
import { canAccess } from '@/utils/permissions';
function HostLayoutContent({ children }: { children: ReactNode }) {
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
  // ✅ Theme based on role
  const theme =
    user?.role === 'staff'
      ? {
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
            textColor: 'text-blue-800',
            iconColor: 'text-blue-700',
            avatarGradient: 'from-cyan-500 to-blue-600',
          },
        }
      : {
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
  // ✅ FETCH ORDERS
  useEffect(() => {
    if (user?.storeId) {
      fetchOrders(user.storeId);
    }
  }, [user?.storeId, fetchOrders]);
  // ✅ SOCKET GLOBAL
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
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?.storeId, addOrder, updateOrder, showNotify, soundEnabled]);
  // ✅ Dynamic Menu Items based on Role
  const menuItems: SidebarMenuItem[] = [];
  // Host-only items
  if (canAccess(user, 'dashboard')) {
    menuItems.push({ text: 'Dashboard', icon: <Dashboard />, path: '/host' });
  }
  if (canAccess(user, 'menu')) {
    menuItems.push({ text: 'Thực đơn', icon: <Restaurant />, path: '/host/menu' });
  }
  if (canAccess(user, 'tables')) {
    menuItems.push({ text: 'Chỗ ngồi', icon: <TableBar />, path: '/host/tables' });
  }
  if (canAccess(user, 'orders')) {
    menuItems.push({
      text: 'Đơn hàng',
      icon: <AssignmentTurnedIn />,
      path: '/host/orders',
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'error',
    });
  }
  if (canAccess(user, 'bills')) {
    menuItems.push({ text: 'Hóa đơn', icon: <Receipt />, path: '/host/bills' });
  }
  // Staff-only items
  if (canAccess(user, 'my-shift')) {
    menuItems.push({ text: 'Ca làm việc', icon: <AccessTime />, path: '/host/my-shift' });
  }
  if (canAccess(user, 'unpaid-bills')) {
    menuItems.push({ text: 'Công nợ', icon: <MoneyOff />, path: '/host/unpaid-bills' });
  }
  // Host-only management items
 if (canAccess(user, 'staff')) {
menuItems.push({
    text: 'Nhân viên',
    icon: <Person />,
    children: [
      {
        text: 'Quản lý nhân viên',
        icon: <Person />,
        path: '/host/staff', // tab cũ
      },
      {
        text: 'Hiệu suất nhân viên',
        icon: <TrendingUp />,
        path: '/host/staff/performance',
      },
    ],
  });
}

  if (canAccess(user, 'inventory')) {
    menuItems.push({ text: 'Quản lý Kho', icon: <Inventory />, path: '/host/inventory' });
  }
  return (
    <>
      <DashboardLayout
        allowedRoles={['host', 'staff']}
        menuItems={menuItems}
        logo={{
          icon:
            user?.role === 'staff' ? (
              <Person className="text-cyan-600" />
            ) : (
              <StoreMallDirectory className="text-green-600" />
            ),
          title: user?.role === 'staff' ? 'Staff Panel' : 'Host Panel',
          subtitle: user?.role === 'staff' ? 'Nhân viên phục vụ' : 'Quản lý nhà hàng',
        }}
        theme={theme}
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

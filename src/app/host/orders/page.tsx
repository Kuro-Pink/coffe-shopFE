'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Tabs,
  Tab,
  Box,
  Badge,
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  Cancel,
  Notifications,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import { storeService } from '@/lib/services/storeService';
import { initSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { Order } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import OrderCard from '@/components/host/OrderManager/OrderCard';
import OrderNotification from '@/components/host/OrderManager/OrderNotification';
import { AxiosError } from 'axios';
import { showToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useOrderBadgeStore } from '@/lib/stores/orderBadgeStore';


interface ErrorResponse {
  message?: string;
  error?: string;
}

type OrderStatus = 'all' | 'pending' | 'completed' | 'cancelled';

export default function OrdersManagementPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<OrderStatus>('all');
  const [notification, setNotification] = useState<{
    open: boolean;
    order: Order | null;
  }>({ open: false, order: null });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    orderId: string;
    status: 'completed' | 'cancelled';
  }>({ open: false, orderId: '', status: 'completed' });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (user?.storeId) {
      fetchOrders();
      setupSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user]);

  const setPendingCount = useOrderBadgeStore(
    (state) => state.setPendingCount
  );
  const pending = orders.filter(o => o.status === 'pending').length;
  setPendingCount(pending);

  const fetchOrders = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      const data = await storeService.getOrders(user.storeId);
      setOrders(data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err: unknown) {
      let errorMessage = 'Không thể tải danh sách đơn hàng';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      setError(errorMessage);
      showToast.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    if (!user?.storeId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = initSocket(user.storeId, token);

    // Listen for new orders
    socket.on('new_order', (order: Order) => {
      console.log('🔔 New order received:', order);
      setOrders((prev) => [order, ...prev]);
      setNotification({ open: true, order });

      // Play notification sound
      playNotificationSound();
    });

    // Listen for order updates
    socket.on('order_status_update', (updatedOrder: Order) => {
      console.log('🔄 Order updated:', updatedOrder);
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('@/public/notification_sound.mp3');
      audio.play().catch((err) => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Notification sound failed:', err);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: 'completed' | 'cancelled') => {
    setUpdateLoading(true);
    try {
      await storeService.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status, completedAt: new Date().toISOString() } : o
        )
      );

      const statusText = status === 'completed' ? 'hoàn thành' : 'hủy';
      showToast.success({ 
        message: `Đã cập nhật đơn hàng thành ${statusText}!` 
      });
      
      // Đóng dialog sau khi thành công
      setConfirmDialog({ open: false, orderId: '', status: 'completed' });
    } catch (err: unknown) {
      let errorMessage = 'Cập nhật trạng thái thất bại';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
    } finally {
      setUpdateLoading(false);
    }
  };
  const handleOpenConfirm = (orderId: string, status: 'completed' | 'cancelled') => {
    setConfirmDialog({ open: true, orderId, status });
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === 'all') return true;
    return order.status === selectedTab;
  });

  const getOrderCount = (status: OrderStatus): number => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  if (!user?.storeId) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12">
          <Typography variant="h6" className="text-gray-800 mb-2">
            Bạn chưa được gán cửa hàng
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Vui lòng liên hệ Admin để được gán cửa hàng
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Quản lý Đơn hàng
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Theo dõi và xử lý đơn hàng real-time
          </Typography>
        </div>

        <div className="flex gap-2 items-center">
          <Chip
            icon={<Notifications />}
            label="Real-time"
            className="bg-green-50 text-green-600 animate-pulse"
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Status Tabs */}
      <Card className="shadow-md border-0 mb-6">
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          className="border-b border-gray-200"
        >
          <Tab
            label={
              <Badge 
              badgeContent={getOrderCount('all')} 
              color="primary" 
              sx={{
            '& .MuiBadge-badge': {
              top: 0,
              right: -2,
            },
          }}>
                <span className="mr-2">Tất cả</span>
              </Badge>
            }
            value="all"
          />
          <Tab
            icon={<Schedule />}
            iconPosition="start"
            label={
              <Badge badgeContent={getOrderCount('pending')} color="warning">
                <span className="mr-2">Đang chờ</span>
              </Badge>
            }
            value="pending"
          />
          <Tab
            icon={<CheckCircle />}
            iconPosition="start"
            label={
              <Badge badgeContent={getOrderCount('completed')} color="success">
                <span className="mr-2">Hoàn thành</span>
              </Badge>
            }
            value="completed"
          />
          <Tab
            icon={<Cancel />}
            iconPosition="start"
            label={
              <Badge badgeContent={getOrderCount('cancelled')} color="error">
                <span className="mr-2">Đã hủy</span>
              </Badge>
            }
            value="cancelled"
          />
        </Tabs>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Typography variant="h1">📋</Typography>
            </div>
            <Typography variant="h6" className="text-gray-800 mb-2">
              Chưa có đơn hàng nào
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Đơn hàng mới sẽ xuất hiện ở đây khi khách đặt món
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onUpdateStatus={handleOpenConfirm}
            />
          ))}
        </div>
      )}

      {/* Notification Popup */}
      <OrderNotification
        open={notification.open}
        order={notification.order}
        onClose={() => setNotification({ open: false, order: null })}
        onView={(order) => {
          setNotification({ open: false, order: null });
          setSelectedTab('pending');
          // Scroll to order
          const element = document.getElementById(`order-${order._id}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.status === 'completed' ? 'Xác nhận hoàn thành' : 'Xác nhận hủy đơn'}
        message={
          confirmDialog.status === 'completed'
            ? 'Bạn có chắc muốn đánh dấu đơn hàng này là đã hoàn thành?'
            : 'Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.'
        }
        variant={confirmDialog.status === 'completed' ? 'success' : 'danger'}
        confirmText={confirmDialog.status === 'completed' ? 'Hoàn thành' : 'Hủy đơn'}
        cancelText="Quay lại"
        loading={updateLoading}  // ← ĐÂY NÈ! Loading state
        onConfirm={() => handleUpdateStatus(confirmDialog.orderId, confirmDialog.status)}
        onCancel={() => setConfirmDialog({ open: false, orderId: '', status: 'completed' })}
      />
    </Box>
  );
}
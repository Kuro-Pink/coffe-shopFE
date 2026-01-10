'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Pending, CheckCircle, Cancel, Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { staffOrderService } from '@/lib/services/staffService';
import { Order } from '@/types';
import StaffOrderCard from '@/components/staff/StaffOrderCard';
import { useAuthStore } from '@/lib/stores/authStore';

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState<'pending' | 'completed' | 'all'>('pending');

  const filteredOrders = orders.filter((order) =>
    currentTab === 'all' ? true : order.status === currentTab,
  );

  useEffect(() => {
    if (user?.storeId) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user?.storeId) return;
    try {
      setError('');
      const status = currentTab === 'all' ? undefined : currentTab;
      const data = await staffOrderService.getOrders(user.storeId);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (orderId: string, status: 'completed' | 'cancelled') => {
    try {
      await staffOrderService.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
      setError('Không thể cập nhật đơn hàng');
    }
  };
  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status);
  };
  const pendingCount = getOrdersByStatus('pending').length;
  const completedCount = getOrdersByStatus('completed').length;
  const cancelledCount = getOrdersByStatus('cancelled').length;
  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Đơn hàng
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: vi })}
          </Typography>
        </div>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchOrders}>
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="opacity-90 mb-1">
                    Chờ xác nhận
                  </Typography>
                  <Typography variant="h3" className="font-bold">
                    {pendingCount}
                  </Typography>
                </div>
                <Pending className="text-6xl opacity-20" />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="opacity-90 mb-1">
                    Hoàn thành
                  </Typography>
                  <Typography variant="h3" className="font-bold">
                    {completedCount}
                  </Typography>
                </div>
                <CheckCircle className="text-6xl opacity-20" />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="opacity-90 mb-1">
                    Đã hủy
                  </Typography>
                  <Typography variant="h3" className="font-bold">
                    {cancelledCount}
                  </Typography>
                </div>
                <CheckCircle className="text-6xl opacity-20" />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card className="mb-4">
        <Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)} variant="fullWidth">
          <Tab label="Tất cả" value="all" />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <span>Chờ xác nhận</span>
                {pendingCount > 0 && (
                  <Chip label={pendingCount} size="small" color="warning" className="h-6" />
                )}
              </div>
            }
            value="pending"
          />

          <Tab
            label={
              <div className="flex items-center gap-2">
                <span>Hoàn thành</span>
              </div>
            }
            value="completed"
          />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <span>Đã hủy</span>
              </div>
            }
            value="cancelled"
          />
        </Tabs>
      </Card>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Pending className="text-gray-300 text-6xl mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              Không có đơn hàng
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {currentTab === 'pending' && 'Chưa có đơn hàng mới'}
              {currentTab === 'completed' && 'Chưa có đơn hoàn thành hôm nay'}
              {currentTab === 'all' && 'Chưa có đơn hàng nào'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <StaffOrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

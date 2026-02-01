'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import { Schedule, Notifications } from '@mui/icons-material';
import { AxiosError } from 'axios';
import { storeService } from '@/lib/services/storeService';
import { useAuthStore } from '@/lib/stores/authStore';
import { useOrderBadgeStore } from '@/lib/stores/orderBadgeStore';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import OrderCard from '@/components/host/OrderManager/OrderCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { showToast } from '@/components/common/Toast';
import { StatTab } from '@/components/ui/';

interface ErrorResponse {
  message?: string;
  error?: string;
}

type OrderStatus = 'all' | 'pending' | 'completed' | 'cancelled';

export default function OrdersManagementPage() {
  /* ===== GLOBAL DATA (ZUSTAND) ===== */
  const orders = useOrderBadgeStore((s) => s.orders);
  const loading = useOrderBadgeStore((s) => s.loading);
  const updateOrder = useOrderBadgeStore((s) => s.updateOrder);

  /* ===== AUTH ===== */
  const user = useAuthStore((s) => s.user);

  /* ===== LOCAL UI STATE ===== */
  const [selectedTab, setSelectedTab] = useState<OrderStatus>('all');

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    orderId: string;
    status: 'completed' | 'cancelled';
  }>({ open: false, orderId: '', status: 'completed' });

  const [updateLoading, setUpdateLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setPage(1);
  }, [selectedTab]);

  /* ===== ACTIONS ===== */
  const handleUpdateStatus = async (orderId: string, status: 'completed' | 'cancelled') => {
    setUpdateLoading(true);
    try {
      await storeService.updateOrderStatus(orderId, status);

      const currentOrder = orders.find((o) => o._id === orderId);
      if (!currentOrder) return;

      updateOrder({
        ...currentOrder,
        status,
        completedAt: new Date().toISOString(),
      });

      showToast.success({
        message: status === 'completed' ? 'Đã hoàn thành đơn hàng!' : 'Đã hủy đơn hàng!',
      });

      setConfirmDialog({ open: false, orderId: '', status: 'completed' });
    } catch (err: unknown) {
      let errorMessage = 'Cập nhật trạng thái thất bại';
      if (err instanceof AxiosError) {
        const data = err.response?.data as ErrorResponse;
        errorMessage = data?.message || data?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
    } finally {
      setUpdateLoading(false);
    }
  };

  /* ===== DERIVED DATA ===== */
  const filteredOrders = orders.filter((order) =>
    selectedTab === 'all' ? true : order.status === selectedTab,
  );

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const getOrderCount = (status: OrderStatus) => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  /* ===== UI STATES ===== */
  if (!user?.storeId) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12">
          <Typography variant="h6">Bạn chưa được gán cửa hàng</Typography>
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
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <Typography variant="h4" className="font-bold mb-2 text-gray-600">
            Quản lý Đơn hàng
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Theo dõi và xử lý đơn hàng real-time
          </Typography>
        </div>

        <Chip
          icon={<Notifications />}
          label="Real-time"
          className="bg-green-50 text-green-600 animate-pulse"
        />
      </div>

      {/* ===== TABS ===== */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatTab
          label="Tất cả"
          count={getOrderCount('all')}
          active={selectedTab === 'all'}
          color="primary"
          onClick={() => setSelectedTab('all')}
        />

        <StatTab
          label="Đang chờ"
          count={getOrderCount('pending')}
          active={selectedTab === 'pending'}
          color="warning"
          onClick={() => setSelectedTab('pending')}
        />

        <StatTab
          label="Hoàn thành"
          count={getOrderCount('completed')}
          active={selectedTab === 'completed'}
          color="success"
          onClick={() => setSelectedTab('completed')}
        />

        <StatTab
          label="Đã huỷ"
          count={getOrderCount('cancelled')}
          active={selectedTab === 'cancelled'}
          color="error"
          onClick={() => setSelectedTab('cancelled')}
        />
      </div>

      {/* ===== LIST ===== */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Typography variant="h6">Chưa có đơn hàng nào</Typography>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {paginatedOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onUpdateStatus={(id, status) => setConfirmDialog({ open: true, orderId: id, status })}
            />
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {/* Page size */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Hiển thị</span>
          <Select
            size="small"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[6, 9, 12, 24].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
          <span>yêu cầu / trang</span>
        </div>

        <Pagination
          page={page}
          count={totalPages}
          color="primary"
          onChange={(_, value) => setPage(value)}
          disabled={totalPages <= 1}
        />
      </div>

      {/* ===== CONFIRM DIALOG ===== */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.status === 'completed' ? 'Xác nhận hoàn thành' : 'Xác nhận hủy đơn'}
        message={
          confirmDialog.status === 'completed'
            ? 'Bạn có chắc muốn đánh dấu đơn hàng này là đã hoàn thành?'
            : 'Bạn có chắc muốn hủy đơn hàng này?'
        }
        variant={confirmDialog.status === 'completed' ? 'success' : 'danger'}
        confirmText={confirmDialog.status === 'completed' ? 'Hoàn thành' : 'Hủy đơn'}
        cancelText="Quay lại"
        loading={updateLoading}
        onConfirm={() => handleUpdateStatus(confirmDialog.orderId, confirmDialog.status)}
        onCancel={() => setConfirmDialog({ open: false, orderId: '', status: 'completed' })}
      />
    </Box>
  );
}

'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  TextField,
  Box,
  InputAdornment,
  Tooltip,
  Button,
} from '@mui/material';
import {
  TableBar,
  Search,
  AccessTime,
  CheckCircle,
  CleaningServices,
  Person,
  Phone,
  Warning,
  Refresh,
} from '@mui/icons-material';
import { AxiosError } from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuthStore } from '@/lib/stores/authStore';
import { staffOrderService } from '@/lib/services/staffService';
import { Table } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import QRCodeDisplay from '@/components/host/TableManager/QRCodeDisplay';
import PaymentDialog from '@/components/host/TableManager/PaymentDialog';
import { showToast } from '@/components/common/Toast';
interface ErrorResponse {
  message?: string;
  error?: string;
}
export default function StaffTablesPage() {
  const { user } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrDialog, setQrDialog] = useState<{
    open: boolean;
    table: Table | null;
  }>({ open: false, table: null });
  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    table: Table | null;
  }>({ open: false, table: null });
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  useEffect(() => {
    if (user?.storeId) {
      fetchTables();
      // Auto refresh every 30s
      const interval = setInterval(fetchTables, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);
  useEffect(() => {
    if (searchQuery) {
      const filtered = tables.filter(
        (table) =>
          table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          table.area.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredTables(filtered);
    } else {
      setFilteredTables(tables);
    }
  }, [searchQuery, tables]);
  const fetchTables = async () => {
    if (!user?.storeId) return;
    try {
      setLoading(true);
      const data = await staffOrderService.getTables(user.storeId);
      setTables(data);
      setFilteredTables(data);
    } catch (err: unknown) {
      let errorMessage = 'Không thể tải danh sách bàn';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateStatus = async (
    tableId: string,
    status: 'available' | 'occupied' | 'needs_cleaning',
  ) => {
    setStatusLoading(tableId);
    try {
      await staffOrderService.updateTableStatus(tableId, status);
      const statusMessages = {
        available: 'Bàn đã sẵn sàng',
        occupied: 'Đánh dấu có khách',
        needs_cleaning: 'Đánh dấu cần dọn',
      };
      showToast.success({ message: statusMessages[status] });
      await fetchTables();
    } catch (err: unknown) {
      let errorMessage = 'Không thể cập nhật trạng thái bàn';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
    } finally {
      setStatusLoading(null);
    }
  };
  const getStatusConfig = (table: Table) => {
    const status = table.status || 'available';
    switch (status) {
      case 'occupied':
        return {
          color: 'error' as const,
          icon: <AccessTime />,
          label: 'Có khách',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          gradientFrom: 'from-red-500',
          gradientTo: 'to-pink-600',
        };
      case 'needs_cleaning':
        return {
          color: 'warning' as const,
          icon: <CleaningServices />,
          label: 'Cần dọn',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-300',
          gradientFrom: 'from-orange-500',
          gradientTo: 'to-yellow-600',
        };
      default:
        return {
          color: 'success' as const,
          icon: <CheckCircle />,
          label: 'Sẵn sàng',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          gradientFrom: 'from-green-500',
          gradientTo: 'to-teal-600',
        };
    }
  };
  const isSessionTooLong = (startTime?: string): boolean => {
    if (!startTime) return false;
    const start = new Date(startTime);
    if (isNaN(start.getTime())) return false;
    const sessionMinutes = (Date.now() - start.getTime()) / 60000;
    return sessionMinutes > 90;
  };
  const formatFromNow = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return formatDistanceToNow(date, { locale: vi, addSuffix: true });
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
  const stats = {
    total: tables.length,
    available: tables.filter((t) => (t.status || 'available') === 'available').length,
    occupied: tables.filter((t) => (t.status || 'available') === 'occupied').length,
    needsCleaning: tables.filter((t) => (t.status || 'available') === 'needs_cleaning').length,
  };
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Quản lý Bàn
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-3">
            Theo dõi trạng thái bàn và xử lý thanh toán
          </Typography>{' '}
          {/* Status Summary */}
          <div className="flex gap-2 flex-wrap">
            <Chip icon={<TableBar />} label={`Tổng: ${stats.total}`} size="small" color="primary" />
            <Chip
              icon={<CheckCircle />}
              label={`Sẵn sàng: ${stats.available}`}
              size="small"
              color="success"
            />
            <Chip
              icon={<AccessTime />}
              label={`Có khách: ${stats.occupied}`}
              size="small"
              color="error"
            />
            <Chip
              icon={<CleaningServices />}
              label={`Cần dọn: ${stats.needsCleaning}`}
              size="small"
              color="warning"
            />
          </div>
        </div>{' '}
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTables}>
          Làm mới
        </Button>
      </div>{' '}
      {error && <ErrorMessage message={error} />} {/* Search Bar */}
      <Card className="mb-6 shadow-md">
        <CardContent>
          <TextField
            fullWidth
            placeholder="Tìm kiếm bàn theo số bàn hoặc khu vực..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>{' '}
      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TableBar className="text-gray-400 text-5xl" />
            </div>
            <Typography variant="h6" className="text-gray-800 mb-2 font-semibold">
              {searchQuery ? 'Không tìm thấy bàn' : 'Chưa có bàn nào'}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Liên hệ quản lý để thêm bàn'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredTables.map((table) => {
            const statusConfig = getStatusConfig(table);
            const isLongSession = table.currentSession
              ? isSessionTooLong(table.currentSession.startTime)
              : false;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={table._id}>
                <Card
                  className={`hover:shadow-xl transition-all duration-300 border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} h-full`}
                >
                  <CardContent>
                    {/* Status Badge & Warning */}
                    <div className="flex items-center justify-between mb-3">
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                        className="font-semibold"
                      />{' '}
                      {/* Long session warning */}
                      {isLongSession && (
                        <Tooltip title="Khách ngồi quá lâu! Kiểm tra xem có cần gì không?">
                          <Warning className="text-orange-600 animate-pulse" />
                        </Tooltip>
                      )}
                    </div>{' '}
                    {/* Table Icon */}
                    <div className="flex justify-center mb-4">
                      <div
                        className={`w-20 h-20 bg-gradient-to-br ${statusConfig.gradientFrom} ${statusConfig.gradientTo} rounded-2xl flex items-center justify-center shadow-lg`}
                      >
                        <TableBar className="text-white text-4xl" />
                      </div>
                    </div>{' '}
                    {/* Table Info */}
                    <div className="text-center mb-4">
                      <Typography variant="h5" className="font-bold text-gray-800 mb-1">
                        {table.tableNumber}
                      </Typography>
                      <Chip label={table.area} size="small" className="bg-blue-50 text-blue-600" />
                    </div>{' '}
                    {/* Session Info */}
                    {table.currentSession && (
                      <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Person fontSize="small" className="text-gray-600" />
                          <Typography variant="body2" className="font-semibold">
                            {table.currentSession.customerName || 'Khách'}
                          </Typography>
                        </div>{' '}
                        <div className="flex items-center gap-2 mb-1">
                          <Phone fontSize="small" className="text-gray-600" />
                          <Typography variant="caption" className="text-gray-600">
                            {table.currentSession.customerPhone}
                          </Typography>
                        </div>{' '}
                        <div className="flex items-center gap-2 mb-2">
                          <AccessTime fontSize="small" className="text-gray-600" />
                          <Typography
                            variant="caption"
                            className={
                              isLongSession ? 'text-orange-600 font-semibold' : 'text-gray-600'
                            }
                          >
                            Ngồi: {formatFromNow(table.currentSession?.startTime)}
                          </Typography>
                        </div>
                        <Typography variant="caption" className="text-green-600 font-bold block">
                          💰 {table.currentSession.totalAmount.toLocaleString('vi-VN')} ₫
                        </Typography>
                        <Typography variant="caption" className="text-gray-500 block">
                          {table.currentSession.totalOrders} đơn hàng
                        </Typography>
                      </div>
                    )}{' '}
                    {/* Actions */}
                    <div className="space-y-2">
                      {/* Status Action Buttons */}
                      {(table.status || 'available') === 'occupied' && (
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          onClick={() => setPaymentDialog({ open: true, table })}
                          disabled={statusLoading === table._id}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          {statusLoading === table._id ? 'Đang xử lý...' : '💳 Thanh toán'}
                        </Button>
                      )}{' '}
                      {(table.status || 'available') === 'needs_cleaning' && (
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          onClick={() => handleUpdateStatus(table._id, 'available')}
                          disabled={statusLoading === table._id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {statusLoading === table._id ? 'Đang xử lý...' : 'Đã dọn xong'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}{' '}
      {/* QR Code Dialog */}
      {qrDialog.table && (
        <QRCodeDisplay
          table={qrDialog.table}
          open={qrDialog.open}
          onClose={() => setQrDialog({ open: false, table: null })}
        />
      )}{' '}
      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialog.open}
        table={paymentDialog.table}
        onClose={() => setPaymentDialog({ open: false, table: null })}
        onSuccess={() => {
          setPaymentDialog({ open: false, table: null });
          fetchTables();
        }}
      />
    </div>
  );
}

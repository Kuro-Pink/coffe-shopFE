// Create: src/app/host/my-shift/page.tsx

'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  Error,
  AttachMoney,
  Receipt,
  TrendingUp,
  Logout,
  Login,
  Warning,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuthStore } from '@/lib/stores/authStore';
import { shiftService } from '@/lib/services/shiftService';
import { Shift, ShiftReport } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CheckInDialog from '@/components/staff/ShiftManager/CheckInDialog';
import CheckOutDialog from '@/components/staff/ShiftManager/CheckOutDialog';
import { showToast } from '@/components/common/Toast';
import ShiftReportDialog from '@/components/staff/ShiftManager/ShiftReportDialog';
import { SummaryCard } from '@/components/ui/';

export default function MyShiftPage() {
  const { user } = useAuthStore();
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shiftReport, setShiftReport] = useState<ShiftReport | null>(null);

  useEffect(() => {
    if (user?.role === 'staff') {
      fetchCurrentShift();
      // Auto refresh every 30s
      const interval = setInterval(fetchCurrentShift, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.role]);

  const fetchCurrentShift = async () => {
    try {
      setLoading(true);
      const shift = await shiftService.getCurrentShift();
      setCurrentShift(shift);
    } catch (error) {
      console.error('Failed to fetch current shift:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInSuccess = () => {
    setCheckInOpen(false);
    fetchCurrentShift();
    showToast.success({ message: '✅ Check-in thành công! Chúc bạn làm việc hiệu quả!' });
  };

  if (loading) return <LoadingSpinner />;

  const shiftDuration = currentShift
    ? formatDistanceToNow(new Date(currentShift.checkInTime), { locale: vi })
    : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Ca làm việc của tôi
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Quản lý ca trực và theo dõi hiệu suất làm việc
        </Typography>
      </div>

      {/* Current Shift Status */}
      {!currentShift ? (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Login className="text-blue-600 text-5xl" />
            </div>
            <Typography variant="h5" className="font-bold text-gray-800 mb-2">
              Chưa bắt đầu ca làm việc
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6">
              Click nút bên dưới để check-in và bắt đầu ca làm việc của bạn
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Login />}
              onClick={() => setCheckInOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Check-in vào ca
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Shift Card */}
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                    <AccessTime className="text-white text-2xl" />
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold">
                      Đang trong ca
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Bắt đầu {shiftDuration}
                    </Typography>
                  </div>
                </div>

                <Chip label="ACTIVE" color="success" className="animate-pulse" />
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" className="text-gray-600 block mb-1">
                      Bắt đầu lúc
                    </Typography>
                    <Typography variant="body1" className="font-semibold">
                      {format(new Date(currentShift.checkInTime), 'HH:mm', { locale: vi })}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" className="text-gray-600 block mb-1">
                      Thời gian làm
                    </Typography>
                    <Typography variant="body1" className="font-semibold text-blue-600">
                      {shiftDuration}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" className="text-gray-600 block mb-1">
                      Đơn tiếp nhận
                    </Typography>
                    <Typography variant="body1" className="font-semibold text-purple-600">
                      {currentShift.ordersProcessed}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" className="text-gray-600 block mb-1">
                      Doanh thu
                    </Typography>
                    <Typography variant="body1" className="font-semibold text-green-600">
                      {(currentShift.totalRevenue ?? 0).toLocaleString()} ₫
                    </Typography>
                  </Grid>
                </Grid>
              </div>

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Logout />}
                onClick={() => setCheckOutOpen(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Check-out kết thúc ca
              </Button>
            </CardContent>
          </Card>

          {/* Shift Stats */}
          <Grid container spacing={3} className="mb-6">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Đơn tiếp nhận"
                value={currentShift.ordersProcessed}
                icon={<Receipt />}
                color={{
                  bg: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  iconBg: 'rgba(255,255,255,0.2)',
                  iconColor: '#fff',
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Hoàn thành"
                value={currentShift.ordersCompleted ?? 0}
                icon={<CheckCircle />}
                color={{
                  bg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  iconBg: 'rgba(255,255,255,0.2)',
                  iconColor: '#fff',
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Đã huỷ"
                value={currentShift.ordersCancelled ?? 0}
                icon={<Error />}
                color={{
                  bg: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  iconBg: 'rgba(255,255,255,0.2)',
                  iconColor: '#fff',
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Trung bình 1 đơn"
                value={
                  currentShift.averageOrderValue
                    ? (currentShift.averageOrderValue / 1000).toFixed(0) + 'K'
                    : '0K'
                }
                icon={<TrendingUp />}
                color={{
                  bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  iconBg: 'rgba(255,255,255,0.2)',
                  iconColor: '#fff',
                }}
              />
            </Grid>
          </Grid>

          {/* Alerts */}
          {(currentShift.ordersCancelled ?? 0) > 0 && (
            <Alert severity="warning" className="mb-6" icon={<Warning />}>
              <strong>Lưu ý:</strong> Có {currentShift.ordersCancelled ?? 0} đơn đã bị hủy trong ca
              này
            </Alert>
          )}
        </>
      )}

      {/* Check-in Dialog */}
      <CheckInDialog
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onSuccess={handleCheckInSuccess}
      />

      {/* Check-out Dialog */}
      {currentShift && (
        <CheckOutDialog
          open={checkOutOpen}
          shift={currentShift}
          onClose={() => setCheckOutOpen(false)}
          onSuccess={(completedShift) => {
            setShiftReport(completedShift);
            setReportOpen(true);
            setCheckOutOpen(false); // đóng dialog checkout
          }}
        />
      )}
      {/* Shift Report Dialog */}
      {shiftReport && (
        <ShiftReportDialog
          open={reportOpen}
          shift={shiftReport}
          onClose={() => {
            setReportOpen(false);
            setShiftReport(null);
          }}
        />
      )}
    </div>
  );
}

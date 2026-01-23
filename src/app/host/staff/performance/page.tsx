'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Box,
  TextField,
  Button,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Person,
  AttachMoney,
  Receipt,
  AccessTime,
  SyncAlt,
  CheckCircle,
  Cancel,
  Star,
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import SummaryCard from '@/components/ui/SummaryCard';

import { vi } from 'date-fns/locale';

import { useAuthStore } from '@/lib/stores/authStore';
import { staffService } from '@/lib/services/staffService';
import { StaffPerformance } from '@/types';

export default function StaffPerformancePage() {
  const { user } = useAuthStore();

  const [data, setData] = useState<StaffPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (user?.storeId) fetchData();
  }, [user?.storeId, startDate, endDate]);

  const fetchData = async () => {
    if (!user?.storeId) return;
    try {
      setLoading(true);
      const res = await staffService.getPerformance(user.storeId, { startDate, endDate });
      setData(res);
    } catch (e) {
      console.error('Fetch staff performance failed', e);
    } finally {
      setLoading(false);
    }
  };

  /** =====================
   * Derived Metrics
   ===================== */
  const summary = useMemo(() => {
    const totalRevenue = data.reduce((s, i) => s + i.totalRevenue, 0);
    const totalProcessed = data.reduce((s, i) => s + i.ordersProcessed, 0);
    const totalCompleted = data.reduce((s, i) => s + i.ordersCompleted, 0);
    const totalCancelled = data.reduce((s, i) => s + i.ordersCancelled, 0);
    const totalHours = data.reduce((s, i) => s + (i.hoursWorked ?? 0), 0);

    return {
      staffCount: data.length,
      totalRevenue,
      totalProcessed,
      totalCompleted,
      totalCancelled,
      avgOrdersPerHour: totalHours ? totalCompleted / totalHours : 0,
    };
  }, [data]);

  const ranked = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          b.ordersCompleted - b.ordersCancelled * 2 - (a.ordersCompleted - a.ordersCancelled * 2),
      ),
    [data],
  );
  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Typography variant="h4" className="font-bold mb-1 text-gray-800">
          Hiệu suất nhân viên
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Đánh giá hiệu quả làm việc của từng nhân viên trong cửa hàng
        </Typography>
      </div>

      {/* Filter */}
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Từ ngày"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Đến ngày"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button variant="contained" onClick={fetchData} fullWidth>
                Xem báo cáo
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Nhân viên"
            value={summary.staffCount}
            icon={<Person />}
            color={{
              bg: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              iconBg: 'rgba(255,255,255,0.2)',
              iconColor: '#fff',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Đơn hoàn thành"
            value={summary.totalCompleted}
            icon={<Receipt />}
            color={{
              bg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              iconBg: 'rgba(255,255,255,0.2)',
              iconColor: '#fff',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Tổng doanh thu"
            value={(summary.totalRevenue / 1_000_000).toFixed(1) + 'M'}
            icon={<AttachMoney />}
            color={{
              bg: 'linear-gradient(135deg, #22c55e, #16a34a)',
              iconBg: 'rgba(255,255,255,0.2)',
              iconColor: '#fff',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Đơn / giờ (TB)"
            value={summary.avgOrdersPerHour.toFixed(2)}
            icon={<TrendingUp />}
            color={{
              bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
              iconBg: 'rgba(255,255,255,0.2)',
              iconColor: '#fff',
            }}
          />
        </Grid>
      </Grid>

      {/* Ranking */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardContent>
          <Typography variant="h6" className="font-bold mb-4">
            🏆 Bảng xếp hạng nhân viên
          </Typography>

          {ranked.length === 0 ? (
            <Typography className="text-gray-500">Chưa có dữ liệu</Typography>
          ) : (
            <div className="space-y-2">
              {ranked.map((s, index) => {
                const isTop = index < 3;

                return (
                  <div
                    key={s.staffId}
                    className={`flex items-center justify-between rounded-xl px-3 py-3 transition
                ${isTop ? 'bg-gradient-to-r from-green-50 to-teal-50' : 'hover:bg-gray-50'}
              `}
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: 14,
                          fontWeight: 700,
                          bgcolor:
                            index === 0
                              ? '#facc15' // yellow-400
                              : index === 1
                                ? '#9ca3af' // gray-400
                                : index === 2
                                  ? '#fb923c' // orange-400
                                  : '#e5e7eb', // gray-200
                          color: index < 3 ? '#fff' : '#374151', // gray-700
                        }}
                      >
                        {index + 1}
                      </Avatar>

                      <Typography className="font-semibold leading-tight">{s.staffName}</Typography>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip
                        size="small"
                        color="primary"
                        icon={<SyncAlt fontSize="small" />}
                        label={`Đã tiếp nhận: ${s.ordersProcessed}`}
                      />

                      <Chip
                        size="small"
                        color="success"
                        icon={<CheckCircle fontSize="small" />}
                        label={`Hoàn thành: ${s.ordersCompleted}`}
                      />

                      <Chip
                        size="small"
                        color="error"
                        icon={<Cancel fontSize="small" />}
                        label={`Đã huỷ: ${s.ordersCancelled}`}
                      />

                      <Chip
                        size="small"
                        color="secondary"
                        icon={<AttachMoney fontSize="small" />}
                        label={`Doanh thu: ${(s.totalRevenue / 1_000_000).toFixed(1)}M`}
                      />

                      <Chip
                        size="small"
                        color="info"
                        icon={<AccessTime fontSize="small" />}
                        label={`${s.ordersPerHour?.toFixed(1) ?? 0} đơn/giờ`}
                      />

                      <Chip
                        size="small"
                        color="warning"
                        icon={<Star fontSize="small" />}
                        label={`TB ${(s.avgOrderValue / 1000).toFixed(0)}K / đơn`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

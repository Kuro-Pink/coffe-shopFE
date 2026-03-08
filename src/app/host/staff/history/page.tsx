'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import { AccessTime, Receipt, CheckCircle, Cancel, AttachMoney } from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { shiftService } from '@/lib/services/shiftService';
import { Shift } from '@/types';
import { EmptyState, SummaryCard, InfoRow } from '@/components/ui';

export default function MyShiftHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'revenue' | 'orders'>('latest');

  const filteredShifts = useMemo(() => {
    let result = [...shifts];

    // Filter by date
    if (startDate) {
      const from = new Date(startDate);
      result = result.filter((s) => new Date(s.checkInTime) >= from);
    }

    if (endDate) {
      const to = new Date(endDate);
      result = result.filter((s) => new Date(s.checkInTime) <= to);
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        result.sort(
          (a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime(),
        );
        break;

      case 'revenue':
        result.sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0));
        break;

      case 'orders':
        result.sort((a, b) => b.ordersProcessed - a.ordersProcessed);
        break;

      default: // latest
        result.sort(
          (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime(),
        );
    }

    return result;
  }, [shifts, startDate, endDate, sortBy]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [history, shiftStats] = await Promise.all([
        shiftService.getShiftHistory(),
        shiftService.getShiftStats(),
      ]);

      setShifts(history);
      setStats(shiftStats);
    } catch (e) {
      console.error('Fetch shift history failed', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <EmptyState title="Đang tải dữ liệu ca làm việc..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Typography variant="h3" className="font-bold mb-1 text-gray-700">
          Lịch sử ca làm việc
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Tất cả ca làm việc của bạn
        </Typography>
      </div>
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Từ ngày"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Đến ngày"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Sắp xếp"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                fullWidth
                margin="normal"
              >
                <MenuItem value="latest">Mới nhất</MenuItem>
                <MenuItem value="oldest">Cũ nhất</MenuItem>
                <MenuItem value="revenue">Doanh thu cao</MenuItem>
                <MenuItem value="orders">Nhiều đơn nhất</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              title="Tổng ca"
              value={stats.totalShifts}
              icon={<AccessTime />}
              color={{
                bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              title="Đơn tiếp nhận"
              value={stats.totalOrdersProcessed}
              icon={<Receipt />}
              color={{
                bg: 'linear-gradient(135deg, #f97316, #ea580c)',
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              title="Đơn hoàn thành"
              value={stats.totalOrdersCompleted}
              icon={<CheckCircle />}
              color={{
                bg: 'linear-gradient(135deg, #22c55e, #16a34a)',
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              title="Doanh thu"
              value={(stats.totalRevenue ?? 0).toLocaleString() + ' ₫'}
              icon={<AttachMoney />}
              color={{
                bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* Shift List */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="font-bold mb-4">
            Danh sách ca
          </Typography>

          {shifts.length === 0 ? (
            <Typography className="text-gray-500">Chưa có ca làm việc</Typography>
          ) : (
            <div className="space-y-4">
              {filteredShifts.map((shift) => (
                <div key={shift._id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography className="font-semibold">
                        {format(new Date(shift.checkInTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </Typography>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                      <InfoRow
                        label="Giờ làm"
                        value={shift.hoursWorked ?? 0}
                        icon={<AccessTime className="text-orange-600" />}
                      />

                      <InfoRow
                        label="Tiếp nhận"
                        value={shift.ordersProcessed}
                        icon={<Receipt className="text-blue-600" />}
                      />

                      <InfoRow
                        label="Hoàn thành"
                        value={shift.ordersCompleted ?? 0}
                        icon={<CheckCircle className="text-green-600" />}
                      />

                      <InfoRow
                        label="Hủy"
                        value={shift.ordersCancelled ?? 0}
                        icon={<Cancel className="text-red-600" />}
                      />

                      <InfoRow
                        label="Doanh thu"
                        value={(shift.totalRevenue ?? 0).toLocaleString() + ' ₫'}
                        icon={<AttachMoney className="text-purple-600" />}
                      />
                    </div>
                  </div>

                  <Divider className="mt-3" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

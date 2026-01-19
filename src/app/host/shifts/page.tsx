'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Box,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  AccessTime,
  TrendingUp,
  Receipt,
  AttachMoney,
  CheckCircle,
  Person,
} from '@mui/icons-material';
import { format, subMonths, subWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuthStore } from '@/lib/stores/authStore';
import { shiftService } from '@/lib/services/shiftService';
import { staffService } from '@/lib/services/staffService';
import { Shift, Staff, HostShiftStats } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ShiftReportDialog from '@/components/staff/ShiftManager/ShiftReportDialog';
import SummaryCard from '@/components/ui/SummaryCard';
import StatTab from '@/components/ui/StatTab';

export default function HostAllShiftsPage() {
  const { user } = useAuthStore();
  const [currentTab, setCurrentTab] = useState<'all' | 'active'>('all');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShifts, setActiveShifts] = useState<Shift[]>([]);
  const [stats, setStats] = useState<HostShiftStats | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'custom'>('month');
  const [reportDialog, setReportDialog] = useState<{
    open: boolean;
    shift: Shift | null;
  }>({ open: false, shift: null });

  useEffect(() => {
    if (user?.storeId) {
      fetchStaffList();
    }
  }, [user?.storeId]);

  useEffect(() => {
    if (user?.storeId) {
      fetchData();
    }
  }, [user?.storeId, startDate, endDate, selectedStaff, currentTab]);

  const fetchStaffList = async () => {
    if (!user?.storeId) return;
    try {
      const data = await staffService.getStaff(user.storeId);
      setStaffList(data);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const fetchData = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);

      if (currentTab === 'all') {
        const params = {
          startDate,
          endDate,
          staffId: selectedStaff !== 'all' ? selectedStaff : undefined,
        };

        const [shiftsData, statsData] = await Promise.all([
          shiftService.getAllShifts(user.storeId, params),
          shiftService.getShiftStatsForHost(user.storeId, params),
        ]);

        setShifts(shiftsData);
        setStats(statsData);
      } else {
        const data = await shiftService.getActiveShifts(user.storeId);
        setActiveShifts(data);
      }
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (period: 'week' | 'month') => {
    setFilterPeriod(period);
    const today = new Date();

    if (period === 'week') {
      setStartDate(format(subWeeks(today, 1), 'yyyy-MM-dd'));
    } else if (period === 'month') {
      setStartDate(format(subMonths(today, 1), 'yyyy-MM-dd'));
    }

    setEndDate(format(today, 'yyyy-MM-dd'));
  };

  const formatDuration = (hours: number | null) => {
    if (!hours) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStaffName = (shift: Shift): string => {
    if (typeof shift.staffId === 'object') return shift.staffId.name;
    return '';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Quản lý Ca làm việc
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Theo dõi tất cả ca làm việc và hiệu suất nhân viên
        </Typography>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <StatTab
              label="Tất cả ca"
              icon={<Receipt />}
              active={currentTab === 'all'}
              color="primary"
              onClick={() => setCurrentTab('all')}
            />

            <StatTab
              label="Đang làm việc"
              icon={<CheckCircle />}
              count={activeShifts.length}
              active={currentTab === 'active'}
              color="success"
              onClick={() => setCurrentTab('active')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary (All Shifts Tab) */}
      {currentTab === 'all' && stats && (
        <Grid container spacing={3} className="mb-6">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              title="Tổng ca làm"
              value={stats.totalShifts}
              icon={<Receipt />}
              color={{
                bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', // blue
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              title="Tổng giờ làm"
              value={`${stats.totalHoursWorked.toFixed(1)}h`}
              icon={<AccessTime />}
              color={{
                bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', // purple
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              title="Tổng đơn hàng"
              value={stats.totalOrdersProcessed}
              icon={<TrendingUp />}
              color={{
                bg: 'linear-gradient(135deg, #f97316, #ea580c)', // orange
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              title="Tổng doanh thu"
              value={(stats.totalRevenue / 1_000_000).toFixed(1) + 'M'}
              icon={<AttachMoney />}
              color={{
                bg: 'linear-gradient(135deg, #22c55e, #16a34a)', // green
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* Filters (All Shifts Tab) */}
      {currentTab === 'all' && (
        <Card className="mb-6">
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  select
                  label="Nhân viên"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {staffList.map((staff) => (
                    <MenuItem key={staff._id} value={staff._id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <div className="flex gap-2">
                  <Chip
                    label="7 ngày"
                    onClick={() => handleQuickFilter('week')}
                    color={filterPeriod === 'week' ? 'primary' : 'default'}
                    clickable
                  />
                  <Chip
                    label="30 ngày"
                    onClick={() => handleQuickFilter('month')}
                    color={filterPeriod === 'month' ? 'primary' : 'default'}
                    clickable
                  />
                </div>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setFilterPeriod('custom');
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setFilterPeriod('custom');
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <Button variant="contained" onClick={fetchData} fullWidth>
                  Lọc
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Active Shifts List */}
      {currentTab === 'active' && (
        <>
          {activeShifts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="text-gray-300 text-6xl mb-4" />
                <Typography variant="h6" className="text-gray-600 mb-2">
                  Không có ca đang hoạt động
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Chưa có nhân viên nào đang trong ca làm việc
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeShifts.map((shift) => (
                <Card key={shift._id} className="border-l-4 border-green-500">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, md: 3 }}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Person className="text-green-600" />
                          </div>
                          <div>
                            <Typography variant="h6" className="font-bold">
                              {getStaffName(shift)}
                            </Typography>
                            <Chip
                              label="Đang làm việc"
                              color="success"
                              size="small"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6, md: 4 }}>
                            <Typography variant="body2" className="text-gray-600">
                              Bắt đầu
                            </Typography>
                            <Typography variant="body1" className="font-semibold">
                              {format(new Date(shift.checkInTime), 'HH:mm dd/MM', { locale: vi })}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 4 }}>
                            <Typography variant="body2" className="text-gray-600">
                              Đơn hàng
                            </Typography>
                            <Typography variant="body1" className="font-semibold text-blue-600">
                              {shift.ordersProcessed}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 4 }}>
                            <Typography variant="body2" className="text-gray-600">
                              Doanh thu
                            </Typography>
                            <Typography variant="body1" className="font-semibold text-green-600">
                              {(shift.totalRevenue / 1000).toFixed(0)}K
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid size={{ xs: 12, md: 3 }}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => setReportDialog({ open: true, shift })}
                        >
                          Xem chi tiết
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* All Shifts List */}
      {currentTab === 'all' && (
        <>
          {shifts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AccessTime className="text-gray-300 text-6xl mb-4" />
                <Typography variant="h6" className="text-gray-600 mb-2">
                  Chưa có ca làm việc nào
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Chưa có dữ liệu ca làm việc trong khoảng thời gian này
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift) => (
                <Card
                  key={shift._id}
                  className="hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, md: 3 }}>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Person className="text-blue-600" />
                          </div>
                          <div>
                            <Typography variant="h6" className="font-bold">
                              {getStaffName(shift)}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                              {format(new Date(shift.checkInTime), 'dd/MM/yyyy', { locale: vi })}
                            </Typography>
                            <Chip
                              label={formatDuration(shift.hoursWorked)}
                              size="small"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </Grid>

                      <Grid size={{ xs: 12, md: 7 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6, md: 3 }}>
                            <div className="text-center">
                              <Typography variant="body2" className="text-gray-600 mb-1">
                                Giờ làm
                              </Typography>
                              <Typography variant="h6" className="font-bold text-purple-600">
                                {formatDuration(shift.hoursWorked)}
                              </Typography>
                            </div>
                          </Grid>

                          <Grid size={{ xs: 6, md: 3 }}>
                            <div className="text-center">
                              <Typography variant="body2" className="text-gray-600 mb-1">
                                Đơn hàng
                              </Typography>
                              <Typography variant="h6" className="font-bold text-blue-600">
                                {shift.ordersProcessed}
                              </Typography>
                            </div>
                          </Grid>

                          <Grid size={{ xs: 6, md: 3 }}>
                            <div className="text-center">
                              <Typography variant="body2" className="text-gray-600 mb-1">
                                Doanh thu
                              </Typography>
                              <Typography variant="h6" className="font-bold text-green-600">
                                {(shift.totalRevenue / 1000).toFixed(0)}K
                              </Typography>
                            </div>
                          </Grid>

                          <Grid size={{ xs: 6, md: 3 }}>
                            <div className="text-center">
                              <Typography variant="body2" className="text-gray-600 mb-1">
                                TB/đơn
                              </Typography>
                              <Typography variant="h6" className="font-bold text-orange-600">
                                {shift.averageOrderValue
                                  ? (shift.averageOrderValue / 1000).toFixed(0) + 'K'
                                  : '0K'}
                              </Typography>
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid size={{ xs: 12, md: 2 }}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => setReportDialog({ open: true, shift })}
                        >
                          Chi tiết
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Shift Report Dialog */}
      {reportDialog.shift && (
        <ShiftReportDialog
          open={reportDialog.open}
          shift={reportDialog.shift}
          onClose={() => setReportDialog({ open: false, shift: null })}
        />
      )}
    </div>
  );
}

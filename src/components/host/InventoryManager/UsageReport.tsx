'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Chip,
} from '@mui/material';
import { TrendingUp, Restaurant, AttachMoney, ShoppingCart } from '@mui/icons-material';
import { format, subDays, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { inventoryService } from '@/lib/services/inventoryService';
import { UsageReport as UsageReportType } from '@/types';
import { formatMoneyShort } from '@/utils/number';
import SummaryCard from '@/components/ui/SummaryCard';

interface UsageReportProps {
  storeId: string;
}
export default function UsageReport({ storeId }: UsageReportProps) {
  const [usageData, setUsageData] = useState<UsageReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'custom'>('month');
  useEffect(() => {
    fetchUsageReport();
  }, [storeId, startDate, endDate]);
  const fetchUsageReport = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getUsageReport(storeId, {
        startDate,
        endDate,
      });
      console.log('Usage Report Data:', data);
      setUsageData(data);
    } catch (error) {
      console.error('Failed to fetch usage report:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleQuickFilter = (period: 'week' | 'month') => {
    setFilterPeriod(period);
    const today = new Date();
    if (period === 'week') {
      setStartDate(format(subDays(today, 7), 'yyyy-MM-dd'));
    } else if (period === 'month') {
      setStartDate(format(subMonths(today, 1), 'yyyy-MM-dd'));
    }
    setEndDate(format(today, 'yyyy-MM-dd'));
  }; // Calculate totals
  const getItemTotalCost = (item: any) => item.totalUsed * item.cost;

  const totalUsageCost = usageData.reduce((sum, item) => sum + getItemTotalCost(item), 0);

  const totalOrders = usageData.reduce((sum, item) => sum + item.timesUsed, 0);

  const totalItemsUsed = usageData.length;

  const sortedUsage = [...usageData].sort((a, b) => getItemTotalCost(b) - getItemTotalCost(a));

  if (loading) {
    return (
      <Box className="flex items-center justify-center p-8">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <div>
      {/* Summary Cards */}
      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Tổng chi phí nguyên liệu"
            value={(totalUsageCost / 1_000_000).toFixed(1) + 'M'}
            icon={<AttachMoney />}
            color={{
              bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', // blue
              iconBg: 'rgba(255,255,255,0.2)',
              iconColor: '#fff',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Số món đã dùng"
            value={totalOrders}
            icon={<ShoppingCart />}
            color={{
              bg: 'linear-gradient(135deg, #22c55e, #16a34a)', // green
              iconBg: 'rgba(255,255,255,0.2)',
              iconColor: '#fff',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Số loại liệu dùng"
            value={totalItemsUsed}
            icon={<Restaurant />}
            color={{
              bg: 'linear-gradient(135deg, #f97316, #ea580c)', // orange
              iconBg: 'rgba(255,255,255,0.2)',
              iconColor: '#fff',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Trung bình mỗi đơn"
            value={totalOrders > 0 ? (totalUsageCost / totalOrders / 1000).toFixed(0) + 'K' : '0K'}
            icon={<TrendingUp />}
            color={{
              bg: 'linear-gradient(135deg, #a855f7, #7e22ce)', // purple
              iconBg: 'rgba(255,255,255,0.2)',
              iconColor: '#fff',
            }}
          />
        </Grid>
      </Grid>
      {/* Date Filter */}
      <Card className="mb-6">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
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
                <Chip
                  label="Tùy chọn"
                  onClick={() => setFilterPeriod('custom')}
                  color={filterPeriod === 'custom' ? 'primary' : 'default'}
                  clickable
                />
              </div>
            </Grid>{' '}
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
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>{' '}
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
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>{' '}
            <Grid size={{ xs: 12, md: 3 }}>
              <Button variant="contained" onClick={fetchUsageReport} fullWidth>
                Xem báo cáo
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>{' '}
      {/* Usage Table */}
      {sortedUsage.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Restaurant className="text-gray-300 text-6xl mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              Không có dữ liệu
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Chưa có đơn hàng nào trong khoảng thời gian này
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" className="font-bold mb-4">
              Chi tiết sử dụng nguyên liệu
            </Typography>{' '}
            <div className="space-y-3">
              {sortedUsage.map((item, index) => (
                <Card
                  key={item.ingredientId}
                  variant="outlined"
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Rank */}
                      <Grid size={{ xs: 12, sm: 1 }}>
                        <div className="text-center">
                          {index === 0 && <span className="text-2xl">🥇</span>}
                          {index === 1 && <span className="text-2xl">🥈</span>}
                          {index === 2 && <span className="text-2xl">🥉</span>}
                          {index > 2 && (
                            <Typography variant="body2" className="font-bold text-gray-400">
                              #{index + 1}
                            </Typography>
                          )}
                        </div>
                      </Grid>{' '}
                      {/* Ingredient Name */}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="h6" className="font-semibold">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Đơn vị: {item.unit}
                        </Typography>
                      </Grid>{' '}
                      {/* Stats */}
                      <Grid size={{ xs: 12, sm: 7 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 4 }}>
                            <div className="text-center">
                              <Typography variant="body2" className="text-gray-600 mb-1">
                                Đã dùng
                              </Typography>
                              <Typography variant="h6" className="font-bold text-blue-600">
                                {item.totalUsed.toLocaleString()} {item.unit}
                              </Typography>
                            </div>
                          </Grid>{' '}
                          <Grid size={{ xs: 4 }}>
                            <div className="text-center">
                              <Typography variant="body2" className="text-gray-600 mb-1">
                                Chi phí
                              </Typography>
                              <Typography variant="h6" className="font-bold text-green-600">
                                {formatMoneyShort(item.cost * item.totalUsed)}
                              </Typography>
                            </div>
                          </Grid>{' '}
                          <Grid size={{ xs: 4 }}>
                            <div className="text-center">
                              <Typography variant="body2" className="text-gray-600 mb-1">
                                Lượt dùng
                              </Typography>
                              <Typography variant="h6" className="font-bold text-purple-600">
                                {item.timesUsed}
                              </Typography>
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

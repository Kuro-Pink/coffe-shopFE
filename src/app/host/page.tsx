'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AttachMoney,
  Restaurant,
  People,
  Schedule,
  TableBar,
  Category as CategoryIcon,
  EmojiEvents,
  Phone,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  storeService,
  DashboardStats,
  OrdersTodayStats,
  RevenueTrend,
  PeakHour,
  BestSeller,
  CustomerInsights,
  CategoryPerformance,
  TableAnalytics,
} from '@/lib/services/storeService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  error?: string;
}

interface AllStats {
  dashboard: DashboardStats;
  ordersToday: OrdersTodayStats;
  revenueTrends: RevenueTrend[];
  peakHours: PeakHour[];
  bestSellers: BestSeller[];
  customers: CustomerInsights;
  categories: CategoryPerformance[];
  tables: TableAnalytics[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function StatsPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AllStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.storeId) {
      fetchAllStats();
    }
  }, [user]);

  const fetchAllStats = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      setError('');

      const [
        dashboard,
        ordersToday,
        revenueTrends,
        peakHours,
        bestSellers,
        customers,
        categories,
        tables,
      ] = await Promise.all([
        storeService.getDashboardStats(user.storeId),
        storeService.getOrdersToday(user.storeId),
        storeService.getRevenueTrends(user.storeId),
        storeService.getPeakHours(user.storeId),
        storeService.getBestSellers(user.storeId),
        storeService.getCustomerInsights(user.storeId),
        storeService.getCategoryPerformance(user.storeId),
        storeService.getTableAnalytics(user.storeId),
      ]);

      setStats({
        dashboard,
        ordersToday,
        revenueTrends,
        peakHours,
        bestSellers,
        customers,
        categories,
        tables,
      });
    } catch (err: unknown) {
      let errorMessage = 'Không thể tải thống kê';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.storeId) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12">
          <Typography variant="h6" className="text-gray-800 mb-2">
            Bạn chưa được gán cửa hàng
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <Box>
      {/* Header */}
      <div className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Thống kê & Báo cáo 📊
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Phân tích chi tiết về doanh thu, sản phẩm và khách hàng
        </Typography>
      </div>

      {/* Overview Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        {/* Today Orders */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card className="hover:shadow-xl transition-all border-0">
            <CardContent className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <ShoppingCart className="text-white" />
                  </div>
                  <Chip
                    label={`${stats.dashboard.today.growth >= 0 ? '+' : ''}${Math.trunc(
                      stats.dashboard.today.growth,
                    )}%`}
                    size="small"
                    icon={
                      stats.dashboard.today.growth >= 0 ? (
                        <TrendingUp fontSize="small" />
                      ) : (
                        <TrendingDown fontSize="small" />
                      )
                    }
                    className={
                      stats.dashboard.today.growth >= 0
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }
                  />
                </div>
                <Typography color="textSecondary" className="text-sm mb-1">
                  Đơn hàng hôm nay
                </Typography>
                <Typography variant="h4" className="font-bold text-gray-800">
                  {stats.dashboard.today.orders}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  đơn
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Today Revenue */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card className="hover:shadow-xl transition-all border-0">
            <CardContent className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <AttachMoney className="text-white" />
                  </div>
                  <Chip
                    label={`${stats.dashboard.today.growth >= 0 ? '+' : ''}${Math.round(
                      stats.dashboard.today.growth,
                    )}%`}
                    size="small"
                    className={
                      stats.dashboard.today.growth >= 0
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }
                  />
                </div>
                <Typography color="textSecondary" className="text-sm mb-1">
                  Doanh thu hôm nay
                </Typography>
                <Typography variant="h4" className="font-bold text-gray-800">
                  {formatCurrency(stats.dashboard.today.revenue)} ₫
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  VNĐ
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Month Revenue */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card className="hover:shadow-xl transition-all border-0">
            <CardContent className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="text-white" />
                  </div>
                  <Chip
                    label={`${stats.dashboard.thisMonth.growth >= 0 ? '+' : ''}${Math.round(
                      stats.dashboard.thisMonth.growth,
                    )}%`}
                    size="small"
                    className={
                      stats.dashboard.thisMonth.growth >= 0
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }
                  />
                </div>
                <Typography color="textSecondary" className="text-sm mb-1">
                  Doanh thu tháng này
                </Typography>
                <Typography variant="h4" className="font-bold text-gray-800">
                  {formatCurrency(stats.dashboard.thisMonth.revenue)} ₫
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  {stats.dashboard.thisMonth.orders} đơn
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Customers */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card className="hover:shadow-xl transition-all border-0">
            <CardContent className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <People className="text-white" />
                  </div>
                </div>
                <Typography color="textSecondary" className="text-sm mb-1">
                  Tổng khách hàng
                </Typography>
                <Typography variant="h4" className="font-bold text-gray-800">
                  {stats.customers.totalCustomers}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  Giá trị TB: {formatCurrency(stats.customers.averageOrderValue)} ₫
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Trends & Peak Hours */}
      <Grid container spacing={3} className="mb-6">
        {/* Revenue Trends Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card className="shadow-lg border-0 h-full">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                📈 Xu hướng doanh thu (7 ngày)
              </Typography>
              {stats.revenueTrends.length === 0 ? (
                <Box className="text-center py-12">
                  <Typography variant="body2" className="text-gray-500">
                    Chưa có dữ liệu
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="#888"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={formatCurrency}
                      stroke="#10b981"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#3b82f6"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Doanh thu') {
                          return [value.toLocaleString('vi-VN') + ' ₫', name];
                        }
                        return [value + ' đơn', name];
                      }}
                      labelFormatter={formatDate}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Doanh thu"
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Đơn hàng"
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className="shadow-lg border-0 h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Schedule className="text-orange-600" />
                <Typography variant="h6" className="font-bold">
                  Giờ cao điểm
                </Typography>
              </div>
              {stats.peakHours.length === 0 ? (
                <Box className="text-center py-12">
                  <Typography variant="body2" className="text-gray-500">
                    Chưa có dữ liệu
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hourLabel" style={{ fontSize: '11px' }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#f59e0b" name="Số đơn" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Best Sellers & Category Performance */}
      <Grid container spacing={3} className="mb-6">
        {/* Best Sellers */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card className="shadow-lg border-0 h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <EmojiEvents className="text-yellow-600" />
                <Typography variant="h6" className="font-bold">
                  Top sản phẩm bán chạy
                </Typography>
              </div>
              {stats.bestSellers.length === 0 ? (
                <Box className="text-center py-8">
                  <Typography variant="body2" className="text-gray-500">
                    Chưa có dữ liệu
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-bold">#</TableCell>
                        <TableCell className="font-bold">Món ăn</TableCell>
                        <TableCell align="right" className="font-bold">
                          SL
                        </TableCell>
                        <TableCell align="right" className="font-bold">
                          Doanh thu
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.bestSellers.slice(0, 10).map((product, index) => (
                        <TableRow key={product._id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                              {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" className="font-semibold">
                              {product.name}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {product.ordersCount} đơn
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={product.totalQuantity}
                              size="small"
                              className="bg-blue-50 text-blue-600 font-semibold"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" className="font-bold text-green-600">
                              {product.totalRevenue.toLocaleString('vi-VN')} ₫
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Category Performance */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card className="shadow-lg border-0 h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CategoryIcon className="text-purple-600" />
                <Typography variant="h6" className="font-bold">
                  Hiệu suất theo danh mục
                </Typography>
              </div>
              {stats.categories.length === 0 ? (
                <Box className="text-center py-8">
                  <Typography variant="body2" className="text-gray-500">
                    Chưa có dữ liệu
                  </Typography>
                </Box>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.categories}
                        dataKey="totalRevenue"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name }) => name}
                      >
                        {stats.categories.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString('vi-VN') + ' ₫'}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <TableContainer className="mt-4">
                    <Table size="small">
                      <TableBody>
                        {stats.categories.map((cat, index) => (
                          <TableRow key={cat.categoryId}>
                            <TableCell>
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" className="font-semibold">
                                {cat.categoryName}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{cat.totalQuantity} món</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" className="text-green-600 font-bold">
                                {cat.totalRevenue.toLocaleString('vi-VN')} ₫
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Customers & Table Performance */}
      <Grid container spacing={3}>
        {/* Top Customers */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <People className="text-blue-600" />
                <Typography variant="h6" className="font-bold">
                  Khách hàng thân thiết
                </Typography>
              </div>
              {stats.customers.topCustomers.length === 0 ? (
                <Box className="text-center py-8">
                  <Typography variant="body2" className="text-gray-500">
                    Chưa có dữ liệu
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-bold">SĐT</TableCell>
                        <TableCell align="right" className="font-bold">
                          Đơn
                        </TableCell>
                        <TableCell align="right" className="font-bold">
                          Tổng chi
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.customers.topCustomers.slice(0, 10).map((customer) => (
                        <TableRow key={customer._id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8 bg-blue-100 text-blue-600">
                                <Phone fontSize="small" />
                              </Avatar>
                              <Typography variant="body2">{customer._id}</Typography>
                            </div>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={customer.orderCount}
                              size="small"
                              className="bg-blue-50 text-blue-600"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" className="font-bold text-green-600">
                              {customer.totalSpent.toLocaleString('vi-VN')} ₫
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Table Performance */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TableBar className="text-green-600" />
                <Typography variant="h6" className="font-bold">
                  Hiệu suất theo bàn
                </Typography>
              </div>
              {stats.tables.length === 0 ? (
                <Box className="text-center py-8">
                  <Typography variant="body2" className="text-gray-500">
                    Chưa có dữ liệu
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell className="font-bold">Bàn</TableCell>
                        <TableCell align="right" className="font-bold">
                          Đơn
                        </TableCell>
                        <TableCell align="right" className="font-bold">
                          Doanh thu
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.tables.map((table) => (
                        <TableRow key={table._id} className="hover:bg-gray-50">
                          <TableCell>
                            <Typography variant="body2" className="font-semibold">
                              {table.tableName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={table.orders}
                              size="small"
                              className="bg-green-50 text-green-600"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" className="font-bold text-green-600">
                              {table.revenue.toLocaleString('vi-VN')} ₫
                            </Typography>
                            <Typography variant="caption" className="text-gray-500 block">
                              TB: {table.averageOrderValue.toLocaleString('vi-VN')} ₫
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

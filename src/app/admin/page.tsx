// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent, Typography, Button, Grid, Box, Chip } from '@mui/material';
import { Add, Store, ShoppingCart, TrendingUp, People, ArrowUpward } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '@/lib/services/adminService';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStores: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalHosts: 0,
  });
  const [range, setRange] = useState(7);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const statsData = [
    {
      title: 'Cửa hàng hoạt động',
      value: `${stats.activeStores}/${stats.totalStores}`,
      color: 'from-purple-500 to-blue-600',
      bgColor: 'bg-blue-50',
      icon: <Store />,
      onClick: () => router.push('/admin/stores'),
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-50',

      icon: <ShoppingCart />,
      onClick: () => router.push('/admin/orders'),
    },
    {
      title: 'Doanh thu hệ thống',
      value: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(stats.totalRevenue),
      color: 'from-red-500 to-purple-600',
      bgColor: 'bg-purple-50',

      icon: <TrendingUp />,
      onClick: () => router.push('/admin/revenue'),
    },
    {
      title: 'Host',
      value: stats.totalHosts,
      color: 'from-orange-500 to-yellow-600',
      bgColor: 'bg-orange-50',
      icon: <People />,
      onClick: () => router.push('/admin/hosts'),
    },
  ];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRevenueChart(range);
  }, [range]);

  useEffect(() => {
    fetchStats();
    fetchActivities();
  }, []);

  const fetchRevenueChart = async (days: number) => {
    const res = await adminService.getRevenueChart(days);

    const mapped = res.map((item: any) => ({
      date: item.date ?? item._id,
      revenue: item.revenue,
      orders: item.orders,
    }));

    setChartData(mapped);
  };

  const fetchActivities = async () => {
    const res = await adminService.getRecentActivities();
    console.log('Activities data:', res);

    setActivities(res);
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats({
        totalStores: data.totalStores,
        activeStores: data.activeStores,
        inactiveStores: data.inactiveStores,
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
        totalHosts: data.totalHosts,
        pendingStoreRequests: data.pendingStoreRequests,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    // Initialize auth từ cookie khi app mount
    initAuth();
  }, [initAuth]);

  if (loading) {
    return <Typography>Đang tải dashboard...</Typography>;
  }

  return (
    <Box>
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              Dashboard
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.
            </Typography>
          </div>
        </div>

        {/* Stats Cards */}
        <Grid container spacing={3} className="mb-8">
          {statsData.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <Card
                onClick={stat.onClick}
                className="hover:shadow-xl transition-shadow duration-300 border-0 overflow-hidden"
              >
                <CardContent className="relative">
                  {/* Background Icon */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} rounded-full -mr-16 -mt-16 opacity-20`}
                  />

                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                      >
                        {stat.icon}
                      </div>
                    </div>

                    <Typography color="textSecondary" gutterBottom className="text-sm">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" className="font-bold text-gray-800">
                      {stat.value}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Card className="mb-8">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Doanh thu theo thời gian</Typography>
              <div className="flex gap-2">
                {[
                  { label: '7 ngày', value: 7 },
                  { label: '30 ngày', value: 30 },
                  { label: '90 ngày', value: 90 },
                ].map((item) => (
                  <Button
                    key={item.value}
                    size="small"
                    variant={range === item.value ? 'contained' : 'outlined'}
                    onClick={() => setRange(item.value)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <Box className="h-[320px] flex items-center justify-center text-gray-400">
              {/* Phase sau gắn chart (Recharts / Chart.js) */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(value),
                      'Doanh thu',
                    ]}
                    labelFormatter={(label) => `Ngày ${label}`}
                  />

                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        <Card className="mb-8 border-l-4 border-red-500">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              ⚠️ Cần xử lý
            </Typography>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span>Yêu cầu mở cửa hàng</span>
                <Chip
                  color="warning"
                  label={`${stats.pendingStoreRequests} đang chờ`}
                  onClick={() => router.push('/admin/store-requests')}
                  clickable
                />
              </div>

              <div className="flex justify-between items-center">
                <span>Cửa hàng bị khóa</span>
                <Chip
                  color="error"
                  label={`${stats.inactiveStores} cửa hàng`}
                  onClick={() => router.push('/admin/stores?status=inactive')}
                  clickable
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Hoạt động gần đây
            </Typography>

            {activities.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Chưa có hoạt động nào
              </Typography>
            ) : (
              <ul className="space-y-3 text-sm">
                {activities.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>
                      {item.type === 'store' && '🏪 '}
                      {item.type === 'host' && '👤 '}
                      {item.type === 'order' && '🧾 '}
                      {item.message}
                    </span>

                    <span className="text-gray-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Box>
  );
}

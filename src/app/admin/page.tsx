// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent, Typography, Button, Grid, Box, Chip } from '@mui/material';
import { Add, Store, ShoppingCart, TrendingUp, People, ArrowUpward } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '@/lib/services/adminService';
import SummaryCard from '@/components/ui/SummaryCard';

interface DashboardStats {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  totalOrders: number;
  totalRevenue: number;
  totalHosts: number;
  pendingStoreRequests: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalStores: 0,
    activeStores: 0,
    inactiveStores: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalHosts: 0,
    pendingStoreRequests: 0,
  });

  const [range, setRange] = useState(7);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const statsData = [
    {
      title: 'Cửa hàng hoạt động',
      value: `${stats.activeStores}/${stats.totalStores}`,
      icon: <Store />,
      onClick: () => router.push('/admin/stores'),
      color: {
        bg: 'linear-gradient(135deg, #8b5cf6, #2563eb)', // purple → blue
        iconBg: 'rgba(255,255,255,0.25)',
        iconColor: '#fff',
      },
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders,
      icon: <ShoppingCart />,
      onClick: () => router.push('/admin/orders'),
      color: {
        bg: 'linear-gradient(135deg, #22c55e, #14b8a6)', // green → teal
        iconBg: 'rgba(255,255,255,0.25)',
        iconColor: '#fff',
      },
    },
    {
      title: 'Doanh thu hệ thống',
      value: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(stats.totalRevenue),
      icon: <TrendingUp />,
      onClick: () => router.push('/admin/revenue'),
      color: {
        bg: 'linear-gradient(135deg, #ef4444, #9333ea)', // red → purple
        iconBg: 'rgba(255,255,255,0.25)',
        iconColor: '#fff',
      },
    },
    {
      title: 'Host',
      value: stats.totalHosts,
      icon: <People />,
      onClick: () => router.push('/admin/hosts'),
      color: {
        bg: 'linear-gradient(135deg, #f97316, #eab308)', // orange → yellow
        iconBg: 'rgba(255,255,255,0.25)',
        iconColor: '#fff',
      },
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
        {/* ===== SUMMARY CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <SummaryCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

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

        <Card className="h-full">
          <CardContent className="flex flex-col h-full">
            {/* HEADER */}
            <Typography variant="h6" className="mb-4">
              Hoạt động gần đây
            </Typography>

            {/* BODY */}
            {activities.length === 0 ? (
              <Typography variant="body2" color="text.secondary" className="text-center py-6">
                Chưa có hoạt động nào
              </Typography>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 max-h-[240px]">
                <ul className="space-y-3 text-sm">
                  {activities.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition"
                    >
                      {/* LEFT */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs
                    ${
                      item.type === 'store'
                        ? 'bg-blue-100 text-blue-600'
                        : item.type === 'host'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-green-100 text-green-600'
                    }`}
                        >
                          {item.type === 'store' && '🏪'}
                          {item.type === 'host' && '👤'}
                          {item.type === 'order' && '🧾'}
                        </span>

                        <p className="text-gray-800">{item.message}</p>
                      </div>

                      {/* DATE */}
                      <span className="text-gray-400 text-xs whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Box>
  );
}

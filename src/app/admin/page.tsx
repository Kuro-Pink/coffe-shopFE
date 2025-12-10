'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Grid,
  Box,
  Chip,
} from '@mui/material';
import { 
  Add, 
  Store, 
  ShoppingCart, 
  TrendingUp,
  People,
  ArrowUpward,
} from '@mui/icons-material';

export default function AdminDashboard() {
  const router = useRouter();
   const initAuth = useAuthStore(state => state.initAuth);
  
    useEffect(() => {
      // Initialize auth từ cookie khi app mount
      initAuth();
    }, [initAuth]);

  const stats = [
    {
      title: 'Tổng cửa hàng',
      value: '0',
      change: '+0%',
      icon: <Store className="text-blue-600" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Tổng đơn hàng',
      value: '0',
      change: '+0%',
      icon: <ShoppingCart className="text-green-600" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Doanh thu',
      value: '0 ₫',
      change: '+0%',
      icon: <TrendingUp className="text-purple-600" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tài khoản Host',
      value: '0',
      change: '+0%',
      icon: <People className="text-orange-600" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <Box sx={{ marginLeft: '240px', p: 3, width: 'calc(100% - 240px)' }}>
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

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/admin/hosts/create')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
          >
            Tạo tài khoản Host
          </Button>
        </div>

        {/* Stats Cards */}
        <Grid container spacing={3} className="mb-8">
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <Card className="hover:shadow-xl transition-shadow duration-300 border-0 overflow-hidden">
                <CardContent className="relative">
                  {/* Background Icon */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} rounded-full -mr-16 -mt-16 opacity-20`} />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        {stat.icon}
                      </div>
                      <Chip 
                        label={stat.change} 
                        size="small"
                        icon={<ArrowUpward fontSize="small" />}
                        className="bg-green-50 text-green-600 font-semibold"
                      />
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

        {/* Recent Stores */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Typography variant="h6" className="font-bold text-gray-800 mb-1">
                  Danh sách cửa hàng
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Quản lý tất cả cửa hàng trong hệ thống
                </Typography>
              </div>
              <Button 
                variant="outlined"
                onClick={() => router.push('/admin/stores')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Xem tất cả
              </Button>
            </div>

            {/* Empty State */}
            <Box className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="text-gray-400 text-5xl" />
              </div>
              <Typography variant="h6" className="text-gray-800 mb-2 font-semibold">
                Chưa có cửa hàng nào
              </Typography>
              <Typography variant="body2" className="text-gray-600 mb-6">
                Bắt đầu bằng cách tạo cửa hàng đầu tiên của bạn
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/admin/stores/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Tạo cửa hàng mới
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>
    </Box>
  );
}
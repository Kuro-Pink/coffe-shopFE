'use client';

import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Grid,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import { 
  Restaurant, 
  TableBar, 
  Receipt,
  TrendingUp,
  ArrowUpward,
  Circle,
} from '@mui/icons-material';

export default function HostDashboard() {
  const router = useRouter();

  const stats = [
    {
      title: 'Đơn hàng hôm nay',
      value: '0',
      subtitle: 'đơn',
      change: '+0%',
      icon: <Receipt className="text-green-600" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Doanh thu hôm nay',
      value: '0 ₫',
      subtitle: 'VNĐ',
      change: '+0%',
      icon: <TrendingUp className="text-blue-600" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Số món trong menu',
      value: '0',
      subtitle: 'món',
      change: '+0%',
      icon: <Restaurant className="text-orange-600" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Tổng số bàn',
      value: '0',
      subtitle: 'bàn',
      change: '+0%',
      icon: <TableBar className="text-purple-600" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const recentOrders = [
    // Placeholder data
  ];

  return (
     <Box sx={{ marginLeft: '240px', p: 3, width: 'calc(100% - 240px)' }}>
      <div>
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Chào mừng trở lại! 👋
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Đây là tổng quan hoạt động nhà hàng của bạn hôm nay
          </Typography>
        </div>

        {/* Stats Cards */}
        <Grid container spacing={3} className="mb-8">
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <Card className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
                <CardContent className="relative">
                  {/* Background Decoration */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-110 transition-transform duration-300`} />
                  
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
                    
                    <Typography color="textSecondary" className="text-sm mb-1">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" className="font-bold text-gray-800">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      {stat.subtitle}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} className="mb-8">
          <Grid size={{ xs: 12, md: 4 }}>
            <Card 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-500"
              onClick={() => router.push('/host/menu')}
            >
              <CardContent className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Restaurant className="text-white text-3xl" />
                </div>
                <Typography variant="h6" className="font-bold mb-2">
                  Quản lý Menu
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Thêm, sửa, xóa món ăn
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500"
              onClick={() => router.push('/host/tables')}
            >
              <CardContent className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TableBar className="text-white text-3xl" />
                </div>
                <Typography variant="h6" className="font-bold mb-2">
                  Quản lý Bàn
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Tạo QR code cho bàn
                </Typography>
              </CardContent>
            </Card>
          </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
            <Card 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500"
              onClick={() => router.push('/host/orders')}
            >
              <CardContent className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Receipt className="text-white text-3xl" />
                </div>
                <Typography variant="h6" className="font-bold mb-2">
                  Xem Đơn hàng
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Theo dõi đơn real-time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Orders */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Typography variant="h6" className="font-bold text-gray-800 mb-1">
                  Đơn hàng gần đây
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Theo dõi trạng thái đơn hàng mới nhất
                </Typography>
              </div>
              <Button 
                variant="outlined"
                onClick={() => router.push('/host/orders')}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Xem tất cả
              </Button>
            </div>

            {/* Empty State */}
            {recentOrders.length === 0 && (
              <Box className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="text-gray-400 text-5xl" />
                </div>
                <Typography variant="h6" className="text-gray-800 mb-2 font-semibold">
                  Chưa có đơn hàng nào
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-6">
                  Đơn hàng mới sẽ xuất hiện ở đây khi khách đặt món
                </Typography>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Circle className="text-green-500 text-xs" />
                  <span>Hệ thống đang sẵn sàng nhận đơn</span>
                </div>
              </Box>
            )}
          </CardContent>
        </Card>
      </div>
    </Box>
  );
}
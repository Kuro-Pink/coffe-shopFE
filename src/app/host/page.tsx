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
      icon: <Receipt className="text-gray-200" />,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Doanh thu hôm nay',
      value: '0 ₫',
      subtitle: 'VNĐ',
      change: '+0%',
      icon: <TrendingUp className="text-gray-200" />,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Số món trong menu',
      value: '0',
      subtitle: 'món',
      change: '+0%',
      icon: <Restaurant className="text-gray-200" />,
      color: 'from-red-500 to-purple-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Tổng số bàn',
      value: '0',
      subtitle: 'bàn',
      change: '+0%',
      icon: <TableBar className="text-gray-200" />,
      color: 'from-orange-500 to-yellow-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const recentOrders = [
    // Placeholder data
  ];

  return (
     <Box>
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
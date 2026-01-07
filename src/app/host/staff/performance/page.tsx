'use client';
import { useState, useEffect } from 'react';
import {
Card,
CardContent,
Typography,
Button,
Grid,
TextField,
CircularProgress,
Box,
Chip,
} from '@mui/material';
import {
TrendingUp,
Person,
AttachMoney,
Coffee,
Restaurant,
EmojiEvents,
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuthStore } from '@/lib/stores/authStore';
import { staffService } from '@/lib/services/staffService';
import { StaffPerformance } from '@/types';
export default function StaffPerformancePage() {
const { user } = useAuthStore();
const [performance, setPerformance] = useState<StaffPerformance[]>([]);
const [loading, setLoading] = useState(true);
const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
useEffect(() => {
if (user?.storeId) {
fetchPerformance();
}
}, [user?.storeId, startDate, endDate]);
const fetchPerformance = async () => {
if (!user?.storeId) return;
try {
  setLoading(true);
  const data = await staffService.getPerformance(user.storeId, { startDate, endDate });
  setPerformance(data);
} catch (error) {
  console.error('Failed to fetch performance:', error);
} finally {
  setLoading(false);
}
};
const getStaffTypeIcon = (type: string) => {
switch (type) {
case 'cashier':
return <AttachMoney className="text-orange-600" />;
case 'bar':
return <Coffee className="text-blue-600" />;
case 'kitchen':
return <Restaurant className="text-green-600" />;
default:
return <Person />;
}
};
const getStaffTypeLabel = (type: string) => {
switch (type) {
case 'cashier':
return 'Thu ngân';
case 'bar':
return 'Pha chế';
case 'kitchen':
return 'Bếp';
default:
return type;
}
};
const getRankMedal = (index: number) => {
switch (index) {
case 0:
return <span className="text-3xl">🥇</span>;
case 1:
return <span className="text-3xl">🥈</span>;
case 2:
return <span className="text-3xl">🥉</span>;
default:
return <span className="text-gray-400 font-bold">#{index + 1}</span>;
}
};
if (loading) {
return (
<Box className="flex items-center justify-center min-h-screen">
<CircularProgress />
</Box>
);
}
// Sort by total revenue
const sortedPerformance = [...performance].sort((a, b) => b.totalRevenue - a.totalRevenue);
return (
<div>
{/* Header */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
<div>
<Typography variant="h4" className="font-bold text-gray-800 mb-2">
Hiệu suất Nhân viên
</Typography>
<Typography variant="body2" className="text-gray-600">
Đánh giá và so sánh hiệu quả làm việc của nhân viên
</Typography>
</div>
</div>
  {/* Date Filter */}
  <Card className="mb-6">
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Từ ngày"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Đến ngày"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Button
            variant="contained"
            onClick={fetchPerformance}
            fullWidth
          >
            Xem báo cáo
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>

  {/* Performance Cards */}
  {sortedPerformance.length === 0 ? (
    <Card>
      <CardContent className="text-center py-12">
        <Person className="text-gray-300 text-6xl mb-4" />
        <Typography variant="h6" className="text-gray-600 mb-2">
          Chưa có dữ liệu
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          Chưa có nhân viên nào xử lý đơn hàng trong khoảng thời gian này
        </Typography>
      </CardContent>
    </Card>
  ) : (
    <div className="space-y-4">
      {sortedPerformance.map((staff, index) => (
        <Card
          key={staff.staffId}
          className={`hover:shadow-lg transition-shadow ${
            index < 3 ? 'border-2 border-yellow-400' : ''
          }`}
        >
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              {/* Rank */}
              <Grid size={{ xs: 12, sm: 2 }} className="text-center">
                {getRankMedal(index)}
              </Grid>

              {/* Staff Info */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                    {getStaffTypeIcon(staff.staffType)}
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold">
                      {staff.staffName}
                    </Typography>
                    <Chip
                      label={getStaffTypeLabel(staff.staffType)}
                      size="small"
                      className="mt-1"
                    />
                  </div>
                </div>
              </Grid>

              {/* Stats */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <div className="text-center">
                      <Typography variant="body2" className="text-gray-600 mb-1">
                        Đơn hàng
                      </Typography>
                      <Typography variant="h6" className="font-bold text-blue-600">
                        {staff.ordersProcessed}
                      </Typography>
                    </div>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <div className="text-center">
                      <Typography variant="body2" className="text-gray-600 mb-1">
                        Doanh thu
                      </Typography>
                      <Typography variant="h6" className="font-bold text-green-600">
                        {(staff.totalRevenue / 1000000).toFixed(1)}M
                      </Typography>
                    </div>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <div className="text-center">
                      <Typography variant="body2" className="text-gray-600 mb-1">
                        TB/Đơn
                      </Typography>
                      <Typography variant="h6" className="font-bold text-purple-600">
                        {(staff.avgOrderValue / 1000).toFixed(0)}K
                      </Typography>
                    </div>
                  </Grid>
                  {staff.ordersPerHour && (
                    <Grid size={{ xs: 6, md: 3 }}>
                      <div className="text-center">
                        <Typography variant="body2" className="text-gray-600 mb-1">
                          Đơn/Giờ
                        </Typography>
                        <Typography variant="h6" className="font-bold text-orange-600">
                          {staff.ordersPerHour.toFixed(1)}
                        </Typography>
                      </div>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </div>
  )}
</div>
);
}
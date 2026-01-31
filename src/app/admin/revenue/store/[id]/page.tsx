'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, Typography, Button, Grid, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '@/lib/services/adminService';

export default function RevenueStoreDetailPage() {
  const params = useParams();
  const router = useRouter();

  const storeId = params.id as string;

  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRevenueByStoreDetail(storeId, range);
      console.log('res', res);
      setData(res);
    } catch (err) {
      console.error('Fetch revenue detail failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <Typography>Đang tải dữ liệu...</Typography>;
  }

  return (
    <Box className="space-y-6">
      {/* ===== HEADER ===== */}
      <Box className="flex items-center justify-between">
        <Box>
          <Typography variant="h5" className="font-bold text-gray-600 flex align-center">
            📊 Doanh thu – {data.storeName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan doanh thu theo thời gian
          </Typography>
          <Button
            variant="outlined"
            onClick={() => router.push('/admin/revenue')}
            className="normal-case"
          >
            ← Quay lại
          </Button>
        </Box>
      </Box>

      {/* ===== SUMMARY ===== */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Tổng đơn</Typography>
              <Typography variant="h5">{data.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Tổng doanh thu</Typography>
              <Typography variant="h5">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(data.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Doanh thu TB / ngày</Typography>
              <Typography variant="h5">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(data.avgRevenuePerDay)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== CHART ===== */}
      <Card>
        <CardContent>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6">Doanh thu theo ngày</Typography>
            <Box className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <Button
                  key={d}
                  size="small"
                  variant={range === d ? 'contained' : 'outlined'}
                  onClick={() => setRange(d)}
                >
                  {d} ngày
                </Button>
              ))}
            </Box>
          </Box>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueByDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(value)
                }
                labelFormatter={(label) => `Ngày ${label}`}
              />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===== TOP PRODUCTS ===== */}
      <Card className="rounded-2xl shadow-md">
        <CardContent>
          <Typography
            variant="h6"
            className="mb-4 flex items-center gap-2 font-semibold text-gray-800"
          >
            🏆 Top sản phẩm bán chạy
          </Typography>

          <ul className="space-y-3 text-sm">
            {data.topProducts?.length > 0 ? (
              data.topProducts.map((p: any, index: number) => (
                <li
                  key={p.productId}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100 transition"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white
                  ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                        ? 'bg-gray-400'
                        : index === 2
                          ? 'bg-orange-500'
                          : 'bg-gray-300'
                  }`}
                    >
                      {index + 1}
                    </span>

                    {/* Name + quantity */}
                    <div>
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.totalQuantity} món</p>
                    </div>
                  </div>

                  {/* RIGHT – Revenue */}
                  <div className="text-right font-semibold text-green-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(p.totalRevenue)}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 py-6">Chưa có dữ liệu</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
}

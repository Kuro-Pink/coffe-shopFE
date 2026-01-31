'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import { adminService } from '@/lib/services/adminService';

export default function AdminRevenuePage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const res = await adminService.getRevenueByStore();
      setData(res);
    } catch (err) {
      console.error('Fetch revenue failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Đang tải doanh thu...</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" className="mb-4 font-bold">
          💰 Doanh thu theo cửa hàng
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Cửa hàng</b>
                </TableCell>
                <TableCell align="right">
                  <b>Tổng đơn</b>
                </TableCell>
                <TableCell align="right">
                  <b>Doanh thu</b>
                </TableCell>
                <TableCell align="right">
                  <b>Hôm nay</b>
                </TableCell>
                <TableCell align="center">
                  <b>Trạng thái</b>
                </TableCell>
                <TableCell align="center">
                  <b>Hành động</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row) => (
                <TableRow key={row.storeId} hover>
                  <TableCell>{row.storeName}</TableCell>

                  <TableCell align="right">{row.totalOrders}</TableCell>

                  <TableCell align="right">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(row.totalRevenue)}
                  </TableCell>

                  <TableCell align="right">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(row.todayRevenue)}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={row.isActive ? 'Hoạt động' : 'Đã khóa'}
                      color={row.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push(`/admin/revenue/store/${row.storeId}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

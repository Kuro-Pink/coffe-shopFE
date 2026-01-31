'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Lock, LockOpen } from '@mui/icons-material';
import { adminHostService } from '@/lib/services/adminHostService';

export default function AdminHostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [host, setHost] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchDetail = async () => {
      const data = await adminHostService.getHostDetail(id as string);
      if (isMounted) {
        setHost(data);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleLock = async () => {
    if (!host) return;
    const confirm = window.confirm(`${host.isActive ? 'Khóa' : 'Mở khóa'} host này?`);
    if (!confirm) return;

    if (host.isActive) {
      await adminHostService.lockHost(host._id);
    } else {
      await adminHostService.unlockHost(host._id);
    }

    // reload detail
    const data = await adminHostService.getHostDetail(host._id);
    setHost(data);
  };

  if (!host) return <Typography>Đang tải...</Typography>;

  return (
    <Grid container spacing={3}>
      {/* HOST INFO */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Thông tin Host
            </Typography>

            <Typography>
              <b>Tên:</b> {host.name}
            </Typography>
            <Typography>
              <b>Email:</b> {host.email}
            </Typography>
            <Typography>
              <b>Phone:</b> {host.phone}
            </Typography>

            <Typography component="div" className="mt-2 flex items-center gap-2">
              <b>Trạng thái:</b>
              <Chip
                size="small"
                color={host.isActive ? 'success' : 'error'}
                label={host.isActive ? 'Active' : 'Locked'}
              />
            </Typography>

            <Divider className="my-4" />

            <Button
              fullWidth
              variant="contained"
              color={host.isActive ? 'error' : 'success'}
              startIcon={host.isActive ? <Lock /> : <LockOpen />}
              onClick={toggleLock}
            >
              {host.isActive ? 'Khóa host' : 'Mở khóa host'}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* STATS + STORES */}
      <Grid>
        <Card className="mb-4">
          <CardContent>
            <Typography variant="h6">Thống kê</Typography>

            <Grid container spacing={2} className="mt-2">
              <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                <Typography>
                  <b>Số cửa hàng:</b> {host.totalStores}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography>
                  <b>Tổng doanh thu:</b>{' '}
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(host.totalRevenue)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Danh sách cửa hàng
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên store</TableCell>
                  <TableCell>Địa chỉ</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="right">Doanh thu</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {host.stores.map((store: any) => (
                  <TableRow
                    key={store._id}
                    hover
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/stores/${store._id}`)}
                  >
                    <TableCell>{store.name}</TableCell>
                    <TableCell>{store.address}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={store.isActive ? 'Active' : 'Inactive'}
                        color={store.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(store.totalRevenue || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

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
  Chip,
  Switch,
  IconButton,
  Tooltip,
  MenuItem,
  Pagination,
  Select,
} from '@mui/material';
import { Lock, LockOpen } from '@mui/icons-material';
import { adminHostService } from '@/lib/services/adminHostService';
import { showToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface Host {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  storeCount: number;
  totalRevenue: number;
  createdAt: string;
}

export default function AdminHostsPage() {
  const router = useRouter();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmLock, setConfirmLock] = useState(false);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [lockLoadingId, setLockLoadingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchHosts = async () => {
    try {
      const data = await adminHostService.getHosts();
      setHosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const toggleLock = async (host: Host) => {
    setLockLoadingId(host._id);

    try {
      if (host.isActive) {
        await adminHostService.lockHost(host._id);
        showToast.success({
          message: 'Khóa host thành công!',
        });
      } else {
        await adminHostService.unlockHost(host._id);
        showToast.success({
          message: 'Mở khóa host thành công',
        });
      }

      fetchHosts();
    } finally {
      setLockLoadingId(null);
    }
  };

  const totalPages = Math.ceil(hosts.length / pageSize);

  const paginatedHosts = hosts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" className="mb-4 font-bold">
          Quản lý Host
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Host</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Store</TableCell>
                <TableCell align="right">Doanh thu</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Tạo lúc</TableCell>
                <TableCell align="center">Khoắ/Mở</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedHosts.map((host) => (
                <TableRow
                  key={host._id}
                  hover
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/hosts/${host._id}`)}
                >
                  <TableCell>{host.name}</TableCell>
                  <TableCell>{host.email}</TableCell>
                  <TableCell align="center">{host.storeCount}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(host.totalRevenue)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={host.isActive ? 'Hoạt động' : 'Bị khóa'}
                      color={host.isActive ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {new Date(host.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={host.isActive ? 'Khóa host' : 'Mở khóa'}>
                      <Switch
                        checked={host.isActive}
                        color="primary"
                        onChange={() => {
                          setSelectedHost(host);
                          setConfirmLock(true);
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && hosts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không có host nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <ConfirmDialog
          open={confirmLock}
          title={selectedHost?.isActive ? 'Xác nhận khóa host' : 'Xác nhận mở khóa host'}
          message={`Bạn có chắc chắn muốn ${
            selectedHost?.isActive ? 'khóa' : 'mở khóa'
          } tài khoản host "${selectedHost?.name}" với Email "${selectedHost?.email}"?`}
          variant={selectedHost?.isActive ? 'danger' : 'success'}
          confirmText="Xác nhận"
          cancelText="Hủy"
          loading={lockLoadingId === selectedHost?._id}
          onConfirm={() => {
            if (!selectedHost) return;
            toggleLock(selectedHost);
            setConfirmLock(false);
            setSelectedHost(null);
          }}
          onCancel={() => {
            setConfirmLock(false);
            setSelectedHost(null);
          }}
        />

        {/* ===== PAGINATION ===== */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {/* Page size */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Hiển thị</span>
            <Select
              size="small"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 15, 20].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
            <span>yêu cầu / trang</span>
          </div>

          <Pagination
            page={page}
            count={totalPages}
            color="primary"
            onChange={(_, value) => setPage(value)}
            disabled={totalPages <= 1}
          />
        </div>
      </CardContent>
    </Card>
  );
}

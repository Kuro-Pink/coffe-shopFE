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
  IconButton,
  Tooltip,
} from '@mui/material';
import { Lock, LockOpen } from '@mui/icons-material';
import { adminHostService } from '@/lib/services/adminHostService';

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
    const confirm = window.confirm(`${host.isActive ? 'Khóa' : 'Mở khóa'} host ${host.email}?`);
    if (!confirm) return;

    if (host.isActive) {
      await adminHostService.lockHost(host._id);
    } else {
      await adminHostService.unlockHost(host._id);
    }

    fetchHosts();
  };

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
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {hosts.map((host) => (
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
                      label={host.isActive ? 'Active' : 'Locked'}
                      color={host.isActive ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {new Date(host.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={host.isActive ? 'Khóa host' : 'Mở khóa'}>
                      <IconButton
                        color={host.isActive ? 'error' : 'success'}
                        onClick={() => toggleLock(host)}
                      >
                        {host.isActive ? <Lock /> : <LockOpen />}
                      </IconButton>
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
      </CardContent>
    </Card>
  );
}

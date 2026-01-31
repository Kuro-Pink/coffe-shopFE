'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  MenuItem,
  Pagination,
  Select,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Store as StoreIcon,
  Phone,
  LocationOn,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { adminService } from '@/lib/services/adminService';
import { Store } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { AxiosError } from 'axios';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { showToast } from '@/components/common/Toast';

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function StoresListPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    store: Store | null;
  }>({ open: false, store: null });

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [confirmLock, setConfirmLock] = useState(false);

  const [status, setStatus] = useState<string>(''); // ✅ controlled ngay
  const [host, setHost] = useState<string>(''); // ✅

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // table → 10/20/50 là hợp lý

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    // Filter stores based on search
    if (searchQuery) {
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }

    setPage(1); // 👈 reset page khi filter/search
  }, [searchQuery, stores]);

  const fetchStores = async () => {
    try {
      setLoading(true);

      const res = await adminService.getStores();

      setStores(res);
      setFilteredStores(res);
    } catch (err) {
      let errorMessage = 'Không thể tải danh sách cửa hàng';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog.store) return;

    setDeleteLoading(true);
    try {
      await adminService.deleteStore(confirmDialog.store._id);
      showToast.success({ message: 'Xóa cửa hàng thành công!' });
      setStores(stores.filter((s) => s._id !== confirmDialog.store?._id));
      setConfirmDialog({ open: false, store: null });
    } catch (err: unknown) {
      let errorMessage = 'Không thể xóa cửa hàng';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleStoreStatus = async (store: Store) => {
    setToggleLoadingId(store._id);
    try {
      await adminService.updateStore(store._id, {
        isActive: !store.isActive,
      });

      showToast.success({
        message: `Đã ${!store.isActive ? 'kích hoạt' : 'tạm dừng'} cửa hàng!`,
      });

      setStores(stores.map((s) => (s._id === store._id ? { ...s, isActive: !s.isActive } : s)));
    } catch (err: unknown) {
      let errorMessage = 'Không thể cập nhật trạng thái';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
    } finally {
      setToggleLoadingId(null);
    }
  };

  const totalItems = filteredStores.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedStores = filteredStores.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Quản lý Cửa hàng
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Quản lý tất cả cửa hàng trong hệ thống
          </Typography>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Search Bar */}
      <Card className="mb-4">
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
              <TextField
                fullWidth
                placeholder="Tìm theo tên cửa hàng"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Trạng thái"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Bị khóa</option>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                label="Host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              >
                <option value="">Tất cả host</option>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button fullWidth variant="outlined">
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stores Grid */}
      {filteredStores.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <StoreIcon className="text-gray-400 text-5xl" />
            </div>
            <Typography variant="h6" className="text-gray-800 mb-2 font-semibold">
              {searchQuery ? 'Không tìm thấy cửa hàng' : 'Chưa có cửa hàng nào'}
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-6">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Bắt đầu bằng cách tạo cửa hàng đầu tiên'}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/admin/stores/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Tạo cửa hàng mới
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Store</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedStores.map((store) => (
              <TableRow key={store._id} hover className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar src={store.logo} />
                    <span className="font-medium">{store.name}</span>
                  </div>
                </TableCell>

                <TableCell>
                  {typeof store.ownerId === 'object' ? store.ownerId.email : '—'}
                </TableCell>

                <TableCell>
                  <Chip
                    label={store.isActive ? 'Hoạt động' : 'Bị khóa'}
                    color={store.isActive ? 'success' : 'error'}
                    size="small"
                    variant="filled"
                  />
                </TableCell>

                <TableCell>{new Date(store.createdAt).toLocaleDateString()}</TableCell>

                <TableCell align="right">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStore(store);
                      setConfirmLock(true);
                    }}
                  >
                    {store.isActive ? <Cancel /> : <CheckCircle />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* ===== PAGINATION ===== */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {/* Page size */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Hiển thị</span>
          <Select
            size="small"
            value={[5, 10, 15, 20].includes(pageSize) ? pageSize : 10}
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

      <ConfirmDialog
        open={confirmLock}
        title={selectedStore?.isActive ? 'Xác nhận khóa cửa hàng' : 'Xác nhận mở khóa cửa hàng'}
        message={`Bạn có chắc chắn muốn ${
          selectedStore?.isActive ? 'khóa' : 'mở khóa'
        } cửa hàng "${selectedStore?.name}"?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        loading={toggleLoadingId === selectedStore?._id}
        onConfirm={() => {
          if (!selectedStore) return;

          toggleStoreStatus(selectedStore); // 👈 gọi API TẠI ĐÂY
          setConfirmLock(false);
          setSelectedStore(null);
        }}
        onCancel={() => {
          setConfirmLock(false);
          setSelectedStore(null);
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận xóa cửa hàng"
        message={`Bạn có chắc chắn muốn xóa cửa hàng "${confirmDialog.store?.name}"? Hành động này không thể hoàn tác và sẽ ảnh hưởng đến tất cả dữ liệu liên quan.`}
        variant="danger"
        confirmText="Xóa cửa hàng"
        cancelText="Hủy"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ open: false, store: null })}
      />
    </div>
  );
}

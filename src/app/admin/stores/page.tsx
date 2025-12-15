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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
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
import { CircularProgress } from '@mui/material';

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

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    // Filter stores based on search
    if (searchQuery) {
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
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
        message: `Đã ${!store.isActive ? 'kích hoạt' : 'tạm dừng'} cửa hàng!` 
      });
      
      setStores(
        stores.map((s) =>
          s._id === store._id ? { ...s, isActive: !s.isActive } : s
        )
      );
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

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/admin/stores/create')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
        >
          Tạo cửa hàng mới
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Search Bar */}
      <Card className="mb-6 shadow-md">
        <CardContent>
          <TextField
            fullWidth
            placeholder="Tìm kiếm cửa hàng theo tên hoặc địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />
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
        <Grid container spacing={3}>
          {filteredStores?.map((store) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={store._id}>
              <Card className="hover:shadow-xl transition-all duration-300 border-0 h-full">
                <CardContent>
                  {/* Header with Logo */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar
                      src={store.logo}
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600"
                    >
                      <StoreIcon />
                    </Avatar>
                    <div className="flex-1">
                      <Typography variant="h6" className="font-bold text-gray-800 mb-1">
                        {store.name}
                      </Typography>
                      <Chip
                        label={
                          toggleLoadingId === store._id ? (
                            <span className="flex items-center gap-1">
                              <CircularProgress size={12} color="inherit" />
                              Đang xử lý...
                            </span>
                          ) : store.isActive ? (
                            'Hoạt động'
                          ) : (
                            'Tạm dừng'
                          )
                        }
                        size="small"
                        icon={
                          toggleLoadingId === store._id ? undefined : 
                          store.isActive ? <CheckCircle /> : <Cancel />
                        }
                        className={
                          store.isActive
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }
                        onClick={() => toggleStoreStatus(store)}
                        disabled={toggleLoadingId === store._id}
                      />
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-gray-600">
                      <LocationOn fontSize="small" className="mt-0.5" />
                      <Typography variant="body2" className="flex-1">
                        {store.address}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone fontSize="small" />
                      <Typography variant="body2">{store.phone}</Typography>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => router.push(`/admin/stores/${store._id}/edit`)}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Chỉnh sửa
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => setConfirmDialog({ open: true, store })}
                      className="border border-red-200 hover:bg-red-50"
                    >
                      <Delete />
                    </IconButton>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
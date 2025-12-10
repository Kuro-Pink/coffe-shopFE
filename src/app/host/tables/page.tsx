'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  QrCode,
  TableBar,
  Search,
  Download,
  Print,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/stores/authStore';
import { storeService } from '@/lib/services/storeService';
import { Table } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import QRCodeDisplay from '@/components/host/TableManager/QRCodeDisplay';
import { AxiosError } from 'axios';

const tableSchema = z.object({
  tableNumber: z.string().min(1, 'Số bàn không được để trống'),
  area: z.string().min(1, 'Khu vực không được để trống'),
});

type TableFormData = z.infer<typeof tableSchema>;

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function TablesManagementPage() {
  const { user } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; table: Table | null }>({
    open: false,
    table: null,
  });
  const [qrDialog, setQrDialog] = useState<{ open: boolean; table: Table | null }>({
    open: false,
    table: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
  });

  useEffect(() => {
    if (user?.storeId) {
      fetchTables();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tables.filter(
        (table) =>
          table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          table.area.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTables(filtered);
    } else {
      setFilteredTables(tables);
    }
  }, [searchQuery, tables]);

  const fetchTables = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      const data = await storeService.getTables(user.storeId);
      setTables(data);
      setFilteredTables(data);
    } catch (err: unknown) {
      let errorMessage = 'Không thể tải danh sách bàn';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setValue('tableNumber', table.tableNumber);
      setValue('area', table.area);
    } else {
      setEditingTable(null);
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTable(null);
    reset();
  };

  const onSubmit = async (data: TableFormData) => {
    if (isLoading || !user?.storeId) return;

    try {
      setIsLoading(true);

      if (editingTable) {
        await storeService.updateTable(editingTable._id, data);
      } else {
        await storeService.createTable(user.storeId, data);
      }

      fetchTables();
      handleCloseDialog();
    } catch (err: unknown) {
      let errorMessage = 'Thao tác thất bại';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.table) return;

    try {
      await storeService.deleteTable(deleteDialog.table._id);
      fetchTables();
      setDeleteDialog({ open: false, table: null });
    } catch (err: unknown) {
      let errorMessage = 'Không thể xóa bàn';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      alert(errorMessage);
    }
  };

  if (!user?.storeId) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12">
          <Typography variant="h6" className="text-gray-800 mb-2">
            Bạn chưa được gán cửa hàng
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Vui lòng liên hệ Admin để được gán cửa hàng
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Quản lý Bàn
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Quản lý bàn và tạo QR code cho khách hàng
          </Typography>
        </div>

        <div className="flex gap-2">
          <Chip
            icon={<TableBar />}
            label={`${tables.length} bàn`}
            className="bg-blue-50 text-blue-600"
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            Thêm bàn mới
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Search Bar */}
      <Card className="mb-6 shadow-md">
        <CardContent>
          <TextField
            fullWidth
            placeholder="Tìm kiếm bàn theo số bàn hoặc khu vực..."
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

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TableBar className="text-gray-400 text-5xl" />
            </div>
            <Typography variant="h6" className="text-gray-800 mb-2 font-semibold">
              {searchQuery ? 'Không tìm thấy bàn' : 'Chưa có bàn nào'}
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-6">
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Thêm bàn đầu tiên để bắt đầu'}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                Thêm bàn mới
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredTables.map((table) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={table._id}>
              <Card className="hover:shadow-xl transition-all duration-300 border-0 h-full">
                <CardContent>
                  {/* Table Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <TableBar className="text-white text-4xl" />
                    </div>
                  </div>

                  {/* Table Info */}
                  <div className="text-center mb-4">
                    <Typography variant="h5" className="font-bold text-gray-800 mb-1">
                      {table.tableNumber}
                    </Typography>
                    <Chip
                      label={table.area}
                      size="small"
                      className="bg-blue-50 text-blue-600"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<QrCode />}
                      onClick={() => setQrDialog({ open: true, table })}
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    >
                      Xem QR Code
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleOpenDialog(table)}
                      >
                        Sửa
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, table })}
                        className="border border-red-200 hover:bg-red-50"
                      >
                        <Delete />
                      </IconButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTable ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-4">
            <TextField
              {...register('tableNumber')}
              label="Số bàn"
              fullWidth
              error={!!errors.tableNumber}
              helperText={errors.tableNumber?.message}
              disabled={isLoading}
              placeholder="VD: B01, A12, VIP01..."
            />

            <TextField
              {...register('area')}
              label="Khu vực"
              fullWidth
              error={!!errors.area}
              helperText={errors.area?.message}
              disabled={isLoading}
              placeholder="VD: Tầng 1, Tầng 2, Sân thượng..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              className="bg-blue-600"
            >
              {isLoading ? 'Đang lưu...' : editingTable ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, table: null })}
      >
        <DialogTitle>Xác nhận xóa bàn</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa bàn <strong>{deleteDialog.table?.tableNumber}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, table: null })}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      {qrDialog.table && (
        <QRCodeDisplay
          table={qrDialog.table}
          open={qrDialog.open}
          onClose={() => setQrDialog({ open: false, table: null })}
        />
      )}
    </div>
  );
}
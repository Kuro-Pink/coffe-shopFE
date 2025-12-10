'use client';

import { useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, DragIndicator, Category as CategoryIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { storeService } from '@/lib/services/storeService';
import { Category } from '@/types';
import { AxiosError } from 'axios';

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
  storeId: string;
}

const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  order: z.number().min(0, 'Thứ tự phải >= 0'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function CategoryManager({ categories, onRefresh, storeId }: CategoryManagerProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      order: categories.length,
    },
  });

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setValue('name', category.name);
      setValue('order', category.order);
    } else {
      setEditingCategory(null);
      reset({ name: '', order: categories.length });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (editingCategory) {
        await storeService.updateCategory(editingCategory._id, data);
      } else {
        await storeService.createCategory(storeId, data);
      }

      onRefresh();
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
    if (!deleteDialog.category) return;

    try {
      await storeService.deleteCategory(deleteDialog.category._id);
      onRefresh();
      setDeleteDialog({ open: false, category: null });
    } catch (err: unknown) {
      let errorMessage = 'Không thể xóa danh mục';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      alert(errorMessage);
    }
  };

  return (
    <>
      <Card className="shadow-lg border-0">
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h6" className="font-bold">
              Danh sách danh mục
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Thêm danh mục
            </Button>
          </div>

          {categories.length === 0 ? (
            <Box className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CategoryIcon className="text-gray-400 text-4xl" />
              </div>
              <Typography variant="h6" className="text-gray-800 mb-2">
                Chưa có danh mục nào
              </Typography>
              <Typography variant="body2" className="text-gray-600 mb-6">
                Tạo danh mục đầu tiên để bắt đầu thêm món ăn
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Tạo danh mục
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {categories
                .sort((a, b) => a.order - b.order)
                .map((category) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category._id}>
                    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <DragIndicator className="text-gray-400" />
                            <Typography variant="h6" className="font-semibold">
                              {category.name}
                            </Typography>
                          </div>
                          <Chip
                            label={`#${category.order}`}
                            size="small"
                            className="bg-gray-100"
                          />
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleOpenDialog(category)}
                            className="flex-1"
                          >
                            Sửa
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, category })}
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
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-4">
            <TextField
              {...register('name')}
              label="Tên danh mục"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
              placeholder="VD: Món chính, Tráng miệng..."
            />

            <TextField
              {...register('order', { valueAsNumber: true })}
              label="Thứ tự hiển thị"
              type="number"
              fullWidth
              error={!!errors.order}
              helperText={errors.order?.message || 'Số nhỏ hơn sẽ hiển thị trước'}
              disabled={isLoading}
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
              {isLoading ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null })}
      >
        <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa danh mục{' '}
            <strong>{deleteDialog.category?.name}</strong>? Tất cả món ăn trong danh mục này
            cũng sẽ bị ảnh hưởng.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, category: null })}>
            Hủy
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
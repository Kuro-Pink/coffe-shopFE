'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { storeService } from '@/lib/services/storeService';
import { Category } from '@/types';
import { AxiosError } from 'axios';

const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  order: z.number().min(0, 'Thứ tự phải >= 0'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  category: Category | null;
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function CategoryDialog({
  open,
  category,
  storeId,
  onClose,
  onSuccess,
}: CategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    values: category
      ? { name: category.name, order: category.order }
      : { name: '', order: 0 },
  });

  const onSubmit = async (data: CategoryFormData) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (category) {
        await storeService.updateCategory(category._id, data);
      } else {
        await storeService.createCategory(storeId, data);
      }

      onSuccess();
      onClose();
      reset();
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
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
          <Button onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading} className="bg-blue-600">
            {isLoading ? 'Đang lưu...' : category ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
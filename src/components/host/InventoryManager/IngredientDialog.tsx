'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  inventoryService,
  CreateIngredientData,
  UpdateIngredientData,
} from '@/lib/services/inventoryService';
import { Ingredient } from '@/types';
import { AxiosError } from 'axios';
interface ErrorResponse {
  message?: string;
  error?: string;
}
const ingredientSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  unit: z.string().min(1, 'Vui lòng chọn đơn vị'),
  quantity: z.number().min(0, 'Số lượng không được âm').optional(),
  minQuantity: z.number().min(0, 'Số lượng tối thiểu không được âm'),
  cost: z.number().min(0, 'Đơn giá không được âm'),
});

type IngredientFormData = z.infer<typeof ingredientSchema>;

interface IngredientDialogProps {
  open: boolean;
  ingredient: Ingredient | null;
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}
const UNITS = [
  { value: 'g', label: 'Gram (g)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'ml', label: 'Mililít (ml)' },
  { value: 'l', label: 'Lít (l)' },
  { value: 'cái', label: 'Cái' },
  { value: 'hộp', label: 'Hộp' },
  { value: 'gói', label: 'Gói' },
];
export default function IngredientDialog({
  open,
  ingredient,
  storeId,
  onClose,
  onSuccess,
}: IngredientDialogProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!ingredient;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      unit: 'g',
      quantity: 0,
      minQuantity: 0,
      cost: 0,
    },
  });

  useEffect(() => {
    if (!open) return;

    setError('');

    if (isEdit && ingredient) {
      reset({
        name: ingredient.name,
        unit: ingredient.unit || 'g', // 🔥 fallback
        minQuantity: ingredient.minQuantity,
        cost: ingredient.cost,
      });
    } else {
      reset({
        name: '',
        unit: 'g',
        quantity: 0,
        minQuantity: 0,
        cost: 0,
      });
    }
  }, [open, isEdit, ingredient, reset]);

  const onSubmit = async (data: IngredientFormData) => {
    if (loading) return;
    try {
      setLoading(true);
      setError('');

      if (isEdit && ingredient) {
        await inventoryService.updateIngredient(ingredient._id, data as UpdateIngredientData);
      } else {
        await inventoryService.createIngredient(storeId, data as CreateIngredientData);
      }

      onSuccess();
    } catch (err: unknown) {
      console.error('Ingredient save error:', err);

      let errorMessage = isEdit
        ? 'Cập nhật nguyên liệu thất bại. Vui lòng thử lại.'
        : 'Thêm nguyên liệu thất bại. Vui lòng thử lại.';

      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    } finally {
      if (!error) {
        setLoading(false);
      }
    }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Cập nhật nguyên liệu' : 'Thêm nguyên liệu mới'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <TextField
              {...register('name')}
              label="Tên nguyên liệu"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={loading}
              placeholder="VD: Cà phê hạt, Sữa tươi..."
            />

            <Controller
              name="unit"
              control={control}
              defaultValue="g"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Đơn vị"
                  fullWidth
                  disabled={loading}
                  error={!!errors.unit}
                  helperText={errors.unit?.message}
                  value={field.value ?? 'g'} // 🔥 ÉP KHÔNG BAO GIỜ undefined
                >
                  {UNITS.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {!isEdit && (
              <TextField
                {...register('quantity', { valueAsNumber: true })}
                label="Số lượng ban đầu"
                type="number"
                fullWidth
                error={!!errors.quantity}
                helperText={errors.quantity?.message || 'Số lượng hiện có trong kho'}
                disabled={loading}
                inputProps={{ min: 0, step: 'any' }}
              />
            )}

            <TextField
              {...register('minQuantity', { valueAsNumber: true })}
              label="Số lượng tối thiểu"
              type="number"
              fullWidth
              error={!!errors.minQuantity}
              helperText={errors.minQuantity?.message || 'Cảnh báo khi tồn kho xuống dưới mức này'}
              disabled={loading}
              inputProps={{ min: 0, step: 'any' }}
            />

            <TextField
              {...register('cost', { valueAsNumber: true })}
              label="Đơn giá (₫)"
              type="number"
              fullWidth
              error={!!errors.cost}
              helperText={errors.cost?.message || 'Giá tiền mỗi đơn vị'}
              disabled={loading}
              inputProps={{ min: 0, step: 'any' }}
            />
          </div>
        </DialogContent>

        <DialogActions className="p-4">
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : isEdit ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

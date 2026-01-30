'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { inventoryService, AdjustStockData } from '@/lib/services/inventoryService';
import { Ingredient } from '@/types';
import { AxiosError } from 'axios';
interface ErrorResponse {
  message?: string;
  error?: string;
}
const schema = z.object({
  quantity: z.number().min(0.01, 'Số lượng phải lớn hơn 0'),
  note: z.string().optional(),
});
type FormData = z.infer<typeof schema>;
interface StockAdjustDialogProps {
  open: boolean;
  ingredient: Ingredient;
  onClose: () => void;
  onSuccess: () => void;
}
export default function StockAdjustDialog({
  open,
  ingredient,
  onClose,
  onSuccess,
}: StockAdjustDialogProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'in' | 'out'>('in');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 0,
      note: '',
    },
  });
  const quantity = watch('quantity');
  const newQuantity =
    type === 'in' ? ingredient.quantity + (quantity || 0) : ingredient.quantity - (quantity || 0);
  const onSubmit = async (data: FormData) => {
    if (loading) return;
    // Validate không thể xuất nhiều hơn tồn kho
    if (type === 'out' && data.quantity > ingredient.quantity) {
      setError(
        `Không thể xuất ${data.quantity} ${ingredient.unit}. Chỉ còn ${ingredient.quantity} ${ingredient.unit} trong kho.`,
      );
      return;
    }

    try {
      setLoading(true);
      setError('');

      const adjustData: AdjustStockData = {
        quantity: type === 'in' ? data.quantity : -data.quantity,
        note: data.note,
      };

      await inventoryService.adjustStock(ingredient._id, adjustData);

      reset();
      onSuccess();
    } catch (err: unknown) {
      console.error('Stock adjust error:', err);

      let errorMessage = 'Điều chỉnh kho thất bại. Vui lòng thử lại.';

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
  const handleClose = () => {
    reset();
    setError('');
    setType('in');
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Điều chỉnh kho - {ingredient.name}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Current Stock */}
          <div className="bg-gray-50 rounded p-4 mb-4">
            <Typography variant="body2" className="text-gray-600 mb-1">
              Tồn kho hiện tại:
            </Typography>
            <Typography variant="h5" className="font-bold">
              {ingredient.quantity.toLocaleString()} {ingredient.unit}
            </Typography>
          </div>

          {/* Type Toggle */}
          <div className="mb-4">
            <Typography variant="body2" className="text-gray-700 mb-2">
              Loại giao dịch:
            </Typography>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={(_, newType) => newType && setType(newType)}
              fullWidth
            >
              <ToggleButton value="in" className="flex items-center gap-2">
                <Add />
                Nhập kho
              </ToggleButton>
              <ToggleButton value="out" className="flex items-center gap-2">
                <Remove />
                Xuất kho
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          {/* Quantity Input */}
          <TextField
            {...register('quantity', { valueAsNumber: true })}
            label={`Số lượng ${type === 'in' ? 'nhập' : 'xuất'} (${ingredient.unit})`}
            type="number"
            fullWidth
            margin="normal"
            error={!!errors.quantity}
            helperText={errors.quantity?.message}
            disabled={loading}
            inputProps={{ min: 0, step: 'any' }}
            className="mb-4"
          />

          {/* Note */}
          <TextField
            {...register('note')}
            label="Ghi chú (tùy chọn)"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            disabled={loading}
            placeholder="VD: Nhập kho từ nhà cung cấp..."
            className="mb-4"
          />

          {/* Preview */}
          {quantity > 0 && (
            <Alert
              severity={
                newQuantity < 0
                  ? 'error'
                  : newQuantity <= ingredient.minQuantity
                    ? 'warning'
                    : 'info'
              }
              className="mt-4"
            >
              <strong>Tồn kho sau khi điều chỉnh:</strong> {newQuantity.toLocaleString()}{' '}
              {ingredient.unit}
              {newQuantity < 0 && ' (Không hợp lệ)'}
              {newQuantity >= 0 && newQuantity <= ingredient.minQuantity && ' (Sắp hết)'}
            </Alert>
          )}
        </DialogContent>

        <DialogActions className="p-4">
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || newQuantity < 0}
            color={type === 'in' ? 'primary' : 'warning'}
          >
            {loading ? <CircularProgress size={24} /> : type === 'in' ? 'Nhập kho' : 'Xuất kho'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Create: src/components/staff/ShiftManager/CheckOutDialog.tsx

'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { shiftService } from '@/lib/services/shiftService';
import { Shift } from '@/types';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  error?: string;
}

const checkOutSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

type CheckOutFormData = z.infer<typeof checkOutSchema>;

interface CheckOutDialogProps {
  open: boolean;
  shift: Shift;
  onClose: () => void;
  onSuccess: (shift: Shift) => void;
}

export default function CheckOutDialog({ open, shift, onClose, onSuccess }: CheckOutDialogProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CheckOutFormData>({
    resolver: zodResolver(checkOutSchema),
    defaultValues: {
      latitude: undefined,
      longitude: undefined,
      notes: '',
    },
  });

  // Get current location on mount
  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
        },
        (error) => {
          console.log('Location not available:', error);
        },
      );
    }
  }, [open, setValue]);

  const onSubmit = async (data: CheckOutFormData) => {
    if (loading) return;

    try {
      setLoading(true);
      setError('');

      const checkOutData: any = {
        notes: data.notes,
      };

      // Add location if available
      if (data.latitude && data.longitude) {
        checkOutData.location = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
      }

      const completedShift = await shiftService.checkOut(checkOutData);

      reset();
      onSuccess(completedShift);
    } catch (err: unknown) {
      console.error('Check-out error:', err);

      let errorMessage = 'Check-out thất bại. Vui lòng thử lại.';

      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Check-out kết thúc ca</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Shift Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <Typography variant="body2" className="text-gray-700 font-semibold mb-2">
              Tóm tắt ca làm việc:
            </Typography>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bắt đầu:</span>
                <span className="font-semibold">
                  {format(new Date(shift.checkInTime), 'HH:mm dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đơn xử lý:</span>
                <span className="font-semibold">{shift.ordersProcessed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doanh thu:</span>
                <span className="font-semibold text-green-600">
                  {shift.totalRevenue.toLocaleString()} ₫
                </span>
              </div>
            </div>
          </div>

          <Typography variant="body2" className="text-gray-600 mb-4">
            Kết thúc ca làm việc của bạn. Vị trí sẽ được tự động lấy nếu bạn cho phép.
          </Typography>

          <TextField
            {...register('notes')}
            label="Ghi chú (tùy chọn)"
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            placeholder="VD: Ca tốt! Bán được nhiều đơn..."
          />
        </DialogContent>

        <DialogActions className="p-4">
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? <CircularProgress size={24} /> : 'Kết thúc ca'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Create: src/components/staff/ShiftManager/CheckInDialog.tsx

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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { shiftService } from '@/lib/services/shiftService';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  error?: string;
}

const checkInSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

type CheckInFormData = z.infer<typeof checkInSchema>;

interface CheckInDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckInDialog({ open, onClose, onSuccess }: CheckInDialogProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
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

  const onSubmit = async (data: CheckInFormData) => {
    if (loading) return;

    try {
      setLoading(true);
      setError('');

      const checkInData: any = {
        notes: data.notes,
      };

      // Add location if available
      if (data.latitude && data.longitude) {
        checkInData.location = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
      }

      await shiftService.checkIn(checkInData);

      reset();
      onSuccess();
    } catch (err: unknown) {
      console.error('Check-in error:', err);

      let errorMessage = 'Check-in thất bại. Vui lòng thử lại.';

      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
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
      <DialogTitle>Check-in vào ca làm việc</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <Typography variant="body2" className="text-gray-600 mb-4">
            Bắt đầu ca làm việc của bạn. Vị trí sẽ được tự động lấy nếu bạn cho phép.
          </Typography>

          <TextField
            {...register('notes')}
            label="Ghi chú (tùy chọn)"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            disabled={loading}
            placeholder="VD: Ca sáng - tinh thần tốt..."
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <CircularProgress size={24} /> : 'Bắt đầu ca'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

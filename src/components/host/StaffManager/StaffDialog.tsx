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
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { staffService, CreateStaffData, UpdateStaffData } from '@/lib/services/staffService';
import { Staff, StaffType } from '@/types';
import { AxiosError } from 'axios';
import { showToast } from '@/components/common/Toast';
interface ErrorResponse {
  message?: string;
  error?: string;
}
const staffTypeValues = ['cashier', 'bar', 'kitchen'] as const;
const createSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  staffType: z.enum(staffTypeValues),
});
const updateSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  staffType: z.enum(staffTypeValues),
});
type StaffFormData = {
  name: string;
  email?: string;
  password?: string;
  phone: string;
  staffType: StaffType;
};

interface StaffDialogProps {
  open: boolean;
  staff: Staff | null;
  storeId: string;
  onClose: () => void;
  onSuccess: (staff: Staff) => void;
}
export default function StaffDialog({
  open,
  staff,
  storeId,
  onClose,
  onSuccess,
}: StaffDialogProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!staff;
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StaffFormData>({
    resolver: zodResolver(isEdit ? updateSchema : createSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      staffType: 'cashier',
    },
  });
  useEffect(() => {
    if (open) {
      setError('');
      if (isEdit && staff?._id) {
        reset({
          name: staff.name,
          phone: staff.phone,
          staffType: staff.staffType,
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          phone: '',
          staffType: 'cashier',
        });
      }
    }
  }, [open, staff, isEdit, reset]);
  const onSubmit = async (data: StaffFormData) => {
    if (loading) return;
    try {
      setLoading(true);
      setError('');
      let result: Staff;

      if (isEdit && staff) {
        result = await staffService.updateStaff(staff._id, data as UpdateStaffData);
        showToast.success({ message: 'Cập nhật nhân viên thành công!' });
      } else {
        result = await staffService.createStaff(storeId, data as CreateStaffData);
        showToast.success({ message: 'Thêm nhân viên thành công!' });
      }

      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      console.error('Staff save error:', err);

      let errorMessage = isEdit
        ? 'Cập nhật nhân viên thất bại. Vui lòng thử lại.'
        : 'Thêm nhân viên thất bại. Vui lòng thử lại.';

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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
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
              label="Tên nhân viên"
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={loading}
            />

            {!isEdit && (
              <>
                <TextField
                  {...register('email')}
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading}
                />

                <TextField
                  {...register('password')}
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}

            <TextField
              {...register('phone')}
              label="Số điện thoại"
              fullWidth
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              disabled={loading}
            />

            <Controller
              name="staffType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Loại nhân viên"
                  fullWidth
                  margin="normal"
                  error={!!errors.staffType}
                  helperText={errors.staffType?.message}
                  disabled={loading}
                >
                  <MenuItem value="cashier">Thu ngân</MenuItem>
                  <MenuItem value="bar">Pha chế</MenuItem>
                  <MenuItem value="kitchen">Bếp</MenuItem>
                </TextField>
              )}
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

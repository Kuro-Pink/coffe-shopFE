'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ArrowBack, Save, CloudUpload } from '@mui/icons-material';
import { adminService } from '@/lib/services/adminService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AxiosError } from 'axios';
import { showToast } from '@/components/common/Toast';
import { CircularProgress } from '@mui/material';

const storeSchema = z.object({
  name: z.string().min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  logo: z.string().optional(),
  isActive: z.boolean().optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function EditStorePage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
  });

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const store = await adminService.getStore(storeId);
      console.log('Fetched store:', store);

      // Populate form
      reset({
        name: store.name,
        address: store.address,
        phone: store.phone,
        logo: store.logo,
        isActive: store.isActive,
      });

      setLogoPreview(store.logo || '');
      setIsActive(store.isActive);
    } catch (err: unknown) {
      let errorMessage = 'Không thể tải thông tin cửa hàng';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Upload to Cloudinary
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    setValue('logo', base64);
  };

  const onSubmit = async (data: StoreFormData) => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      await adminService.updateStore(storeId, {
        ...data,
        isActive,
      });

      showToast.success({ message: 'Cập nhật cửa hàng thành công!' });
      router.push('/admin/stores');
    } catch (err: unknown) {
      console.error('Update store error:', err);

      let errorMessage = 'Cập nhật cửa hàng thất bại. Vui lòng thử lại.';

      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showToast.error({ message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/admin/stores')}
          className="mb-4 text-gray-600"
        >
          Quay lại
        </Button>
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Chỉnh sửa cửa hàng
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Cập nhật thông tin cửa hàng
        </Typography>
      </div>

      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          {error && (
            <Alert severity="error" className="mb-6" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col gap-4">
            {/* Logo */}
            <div className="text-center">
              <Avatar
                src={logoPreview}
                className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600"
              >
                <CloudUpload className="text-4xl" />
              </Avatar>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                className="border-gray-300"
              >
                Thay đổi logo
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </Button>
            </div>

            {/* Store Name */}
            <TextField
              {...register('name')}
              label="Tên cửa hàng"
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
            />

            {/* Address */}
            <TextField
              {...register('address')}
              label="Địa chỉ"
              fullWidth
              margin="normal"
              multiline
              rows={2}
              error={!!errors.address}
              helperText={errors.address?.message}
              disabled={isLoading}
            />

            {/* Phone */}
            <TextField
              {...register('phone')}
              label="Số điện thoại"
              fullWidth
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              disabled={isLoading}
            />

            {/* Status Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isLoading}
                />
              }
              label={
                <div>
                  <Typography variant="body1">
                    Trạng thái: {isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {isActive
                      ? 'Cửa hàng đang hoạt động bình thường'
                      : 'Cửa hàng tạm dừng, không nhận đơn mới'}
                  </Typography>
                </div>
              }
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => router.push('/admin/stores')}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

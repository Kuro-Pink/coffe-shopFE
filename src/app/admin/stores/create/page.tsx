'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  MenuItem,
  Avatar,
} from '@mui/material';
import { ArrowBack, Save, CloudUpload } from '@mui/icons-material';
import { adminService } from '@/lib/services/adminService';
import { User } from '@/types';
import { AxiosError } from 'axios';
import { showToast } from '@/components/common/Toast';
import { CircularProgress } from '@mui/material';

const storeSchema = z.object({
  name: z.string().min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  ownerId: z.string().min(1, 'Vui lòng chọn chủ cửa hàng'),
  logo: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function CreateStorePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hosts, setHosts] = useState<User[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
  });

  useEffect(() => {
    // Fetch list of hosts (owners)
    // Note: You'll need to create an API endpoint to get users with role 'host'
    // For now, we'll use a placeholder
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      // TODO: Create API endpoint GET /api/admin/users?role=host
      // For now, just set empty array
      setHosts([]);
    } catch (err) {
      console.error('Failed to fetch hosts:', err);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Upload to Cloudinary
    // For now, just use base64
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
      await adminService.createStore(data);
      showToast.success({ message: 'Tạo cửa hàng thành công!' });
      router.push('/admin/stores');
    } catch (err: unknown) {
      console.error('Create store error:', err);

      let errorMessage = 'Tạo cửa hàng thất bại. Vui lòng thử lại.';

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
          Tạo cửa hàng mới
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Điền thông tin để tạo cửa hàng mới trong hệ thống
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
            {/* Logo Upload */}
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
                Tải lên logo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </Button>
              <Typography variant="caption" className="block mt-2 text-gray-500">
                Định dạng: JPG, PNG. Tối đa 2MB
              </Typography>
            </div>

            {/* Store Name */}
            <TextField
              {...register('name')}
              label="Tên cửa hàng"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
              placeholder="VD: Nhà hàng ABC"
            />

            {/* Address */}
            <TextField
              {...register('address')}
              label="Địa chỉ"
              fullWidth
              multiline
              rows={2}
              error={!!errors.address}
              helperText={errors.address?.message}
              disabled={isLoading}
              placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
            />

            {/* Phone */}
            <TextField
              {...register('phone')}
              label="Số điện thoại"
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message}
              disabled={isLoading}
              placeholder="VD: 0901234567"
            />

            {/* Owner Selection */}
            <TextField
              {...register('ownerId')}
              label="Chủ cửa hàng"
              fullWidth
              select
              error={!!errors.ownerId}
              helperText={
                errors.ownerId?.message ||
                (hosts.length === 0 && 'Chưa có tài khoản Host nào. Hãy tạo Host trước.')
              }
              disabled={isLoading || hosts.length === 0}
              defaultValue=""
            >
              <MenuItem value="" disabled>
                -- Chọn chủ cửa hàng --
              </MenuItem>
              {hosts.map((host) => (
                <MenuItem key={host._id} value={host._id}>
                  {host.name} ({host.email})
                </MenuItem>
              ))}
            </TextField>

            {hosts.length === 0 && (
              <Alert severity="info">
                Bạn cần tạo tài khoản Host trước khi tạo cửa hàng.{' '}
                <Button
                  size="small"
                  onClick={() => router.push('/admin/hosts/create')}
                  className="underline"
                >
                  Tạo Host ngay
                </Button>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={isLoading || hosts.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Đang tạo...' : 'Tạo cửa hàng'}
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
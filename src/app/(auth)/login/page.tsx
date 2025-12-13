'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Card, CardContent, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, RestaurantMenu } from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import { authService } from '@/lib/services/authService';
import { AxiosError } from 'axios';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await authService.login(data);
      
      // Dữ liệu thật từ backend
      const { user, token } = response.data;

      // Lưu vào store và localStorage
      login(user, token);

      // Redirect
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'host') {
        router.push('/host');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      
      reset({ email: data.email, password: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
   <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-teal-600/60 via-blue-600/60 to-purple-500/60 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl relative z-10 backdrop-blur-xl bg-white/85 rounded-2xl">
        <CardContent className="p-10">
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600/80 via-purple-600/80 to-pink-500/80 rounded-2xl mb-5 shadow-lg">
              <RestaurantMenu className="text-white text-4xl" />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Coffee Shop
            </h1>
            <p className="text-gray-700 mt-2">Đăng nhập để quản lý quán</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <TextField
              {...register('email')}
              label="Email"
              fullWidth
              variant="outlined"
              className="bg-gray-50 rounded-lg"
            />

            <TextField
              {...register('password')}
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              className="bg-gray-50 rounded-lg space-x-6"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              className="bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-500/80 text-white py-3 rounded-lg shadow-md hover:shadow-lg"
            >
              ĐĂNG NHẬP
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>


  );
}
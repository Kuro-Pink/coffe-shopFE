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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl relative z-10 backdrop-blur-sm bg-white/95">
        <CardContent className="p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <RestaurantMenu className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QR Menu System
            </h1>
            <p className="text-gray-600">Đăng nhập để quản lý nhà hàng</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              className="mb-6 rounded-lg"
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
              autoComplete="email"
              variant="outlined"
              className="bg-gray-50 rounded-lg"
            />

            <TextField
              {...register('password')}
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
              autoComplete="current-password"
              variant="outlined"
              className="bg-gray-50 rounded-lg"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg 
                    className="animate-spin h-5 w-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-700 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Tài khoản demo để test:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-600">👨‍💼 Admin:</span>
                <code className="text-blue-600 font-mono">admin@coffee.com</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-600">🔑 Password:</span>
                <code className="text-gray-600 font-mono">admin123</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-600">🏪 Host:</span>
                <code className="text-purple-600 font-mono">host1@coffee.com</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-600">🔑 Password:</span>
                <code className="text-gray-600 font-mono">host123</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
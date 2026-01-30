'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person,
  Store as StoreIcon,
  CloudUpload,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { authService } from '@/lib/services/authService';
import { storeRequestService } from '@/lib/services/storeRequestService';
import { AxiosError } from 'axios';
import { showToast } from '@/components/common/Toast';

const registrationSchema = z
  .object({
    // User info
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),

    // Store info
    storeName: z.string().min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự'),
    storeAddress: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
    storePhone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
    businessLicense: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu không khớp',
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

const steps = ['Thông tin cá nhân', 'Thông tin cửa hàng', 'Hoàn tất'];

export default function HostRegistrationPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  useEffect(() => {
    if (password) {
      trigger('confirmPassword');
    }
  }, [password, trigger]);

  const handleNext = async () => {
    let isValid = false;

    if (activeStep === 0) {
      isValid = await trigger(); // 🔥 KHÔNG truyền field
    }

    if (activeStep === 1) {
      isValid = await trigger(['storeName', 'storeAddress', 'storePhone']);
    }

    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // ========== STEP 1: Register user account ==========
      console.log('📝 Step 1: Creating user account...');

      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'host',
      });

      console.log('✅ User account created successfully');

      // ========== STEP 2: Login to get token ==========
      console.log('🔐 Step 2: Logging in...');

      const loginResponse = await authService.login({
        email: data.email,
        password: data.password,
      });

      const { token } = loginResponse.data;

      // Save token to localStorage (or use your auth store)
      localStorage.setItem('token', token);

      console.log('✅ Login successful, token saved');

      // ========== STEP 3: Create store request ==========
      console.log('🏪 Step 3: Creating store request...');

      await storeRequestService.createStoreRequest({
        storeName: data.storeName,
        storeAddress: data.storeAddress,
        storePhone: data.storePhone,
        storeLogo: logoFile || undefined,
        businessLicense: data.businessLicense,
        description: data.description,
      });

      console.log('✅ Store request created successfully');

      // ========== SUCCESS ==========
      showToast.success({
        message: 'Đã gửi yêu cầu đăng ký cửa hàng thành công',
      });

      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      console.error('❌ Registration error:', err);

      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';

      if (err instanceof AxiosError) {
        const responseData = err.response?.data;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      showToast.error({ message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardContent className="text-center py-12 px-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600 text-6xl" />
            </div>

            <Typography variant="h4" className="font-bold text-gray-800 mb-3">
              ✅ Đăng ký thành công!
            </Typography>

            <Typography variant="body1" className="text-gray-600 mb-6">
              Yêu cầu đăng ký cửa hàng của bạn đã được gửi đến Admin.
              <br />
              Chúng tôi sẽ xem xét và phản hồi qua email trong vòng 24-48 giờ.
            </Typography>

            <Divider className="my-6" />

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <Typography variant="body2" className="text-blue-800">
                <strong>📧 Email xác nhận</strong> sẽ được gửi đến:
                <br />
                <span className="font-mono text-blue-600">{registeredEmail}</span>
              </Typography>
            </div>

            <Alert severity="info" className="mb-6 text-left">
              <strong>Bước tiếp theo:</strong>
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>Kiểm tra email để xem trạng thái yêu cầu</li>
                <li>Sau khi được duyệt, bạn có thể đăng nhập và quản lý cửa hàng</li>
              </ul>
            </Alert>

            <div className="flex gap-3">
              <Button fullWidth variant="outlined" onClick={() => router.push('/host/my-requests')}>
                Xem trạng thái yêu cầu
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-green-600 to-teal-600"
              >
                Đăng nhập ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              Đăng ký trở thành đối tác
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Đăng ký cửa hàng và bắt đầu kinh doanh với chúng tôi
            </Typography>
          </div>

          {/* Stepper */}
          <Stepper activeStep={activeStep} className="mb-8">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Info */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Person className="text-green-600" />
                  <Typography variant="h6" className="font-bold">
                    Thông tin cá nhân
                  </Typography>
                </div>

                <TextField
                  {...register('name')}
                  label="Họ và tên *"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isLoading}
                />

                <TextField
                  {...register('email')}
                  label="Email *"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                />

                <TextField
                  {...register('phone')}
                  label="Số điện thoại *"
                  fullWidth
                  margin="normal"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  disabled={isLoading}
                />

                <TextField
                  {...register('password')}
                  label="Mật khẩu *"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  {...register('confirmPassword')}
                  label="Xác nhận mật khẩu *"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Step 2: Store Info */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <StoreIcon className="text-green-600" />
                  <Typography variant="h6" className="font-bold">
                    Thông tin cửa hàng
                  </Typography>
                </div>

                {/* Logo Upload */}
                <div className="text-center">
                  <Avatar
                    src={logoPreview}
                    className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-500 to-teal-600"
                  >
                    <CloudUpload className="text-4xl" />
                  </Avatar>
                  <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
                    Tải logo cửa hàng
                    <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                  </Button>
                  <Typography variant="caption" className="block mt-2 text-gray-500">
                    Tùy chọn. JPG, PNG. Tối đa 2MB
                  </Typography>
                </div>

                <TextField
                  {...register('storeName')}
                  label="Tên cửa hàng *"
                  fullWidth
                  margin="normal"
                  error={!!errors.storeName}
                  helperText={errors.storeName?.message}
                  disabled={isLoading}
                />

                <TextField
                  {...register('storeAddress')}
                  label="Địa chỉ cửa hàng *"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  error={!!errors.storeAddress}
                  helperText={errors.storeAddress?.message}
                  disabled={isLoading}
                />

                <TextField
                  {...register('storePhone')}
                  label="Số điện thoại cửa hàng *"
                  fullWidth
                  margin="normal"
                  error={!!errors.storePhone}
                  helperText={errors.storePhone?.message}
                  disabled={isLoading}
                />

                <TextField
                  {...register('businessLicense')}
                  label="Số giấy phép kinh doanh"
                  fullWidth
                  margin="normal"
                  helperText="Tùy chọn"
                  disabled={isLoading}
                />

                <TextField
                  {...register('description')}
                  label="Mô tả cửa hàng"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  helperText="Tùy chọn. Tối đa 500 ký tự"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Step 3: Review */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <Typography variant="h6" className="font-bold mb-4">
                  Xác nhận thông tin
                </Typography>

                <Alert severity="info" className="mb-4">
                  Vui lòng kiểm tra lại thông tin trước khi gửi đăng ký
                </Alert>

                <Card className="bg-gray-50">
                  <CardContent>
                    <Typography variant="subtitle2" className="font-bold mb-2">
                      Thông tin cá nhân:
                    </Typography>
                    <Typography variant="body2" className="mb-1">
                      Họ tên: <strong>{getValues('name')}</strong>
                    </Typography>
                    <Typography variant="body2" className="mb-1">
                      Email: <strong>{getValues('email')}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Số điện thoại: <strong>{getValues('phone')}</strong>
                    </Typography>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardContent>
                    <Typography variant="subtitle2" className="font-bold mb-2">
                      Thông tin cửa hàng:
                    </Typography>
                    <Typography variant="body2" className="mb-1">
                      Tên: <strong>{getValues('storeName')}</strong>
                    </Typography>
                    <Typography variant="body2" className="mb-1">
                      Địa chỉ: <strong>{getValues('storeAddress')}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Số điện thoại: <strong>{getValues('storePhone')}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || isLoading}
                startIcon={<ArrowBack />}
                className="flex-1"
              >
                Quay lại
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<ArrowForward />}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
                >
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
                >
                  {isLoading ? 'Đang gửi...' : 'Hoàn tất đăng ký'}
                </Button>
              )}
            </div>
          </form>

          <Divider className="my-6" />

          <div className="text-center">
            <Typography variant="body2" className="text-gray-600">
              Đã có tài khoản?{' '}
              <Button
                onClick={() => router.push('/login')}
                className="text-green-600 font-semibold"
              >
                Đăng nhập ngay
              </Button>
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

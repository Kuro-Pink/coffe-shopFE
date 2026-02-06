'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/lib/stores/cartStore';
import { publicService } from '@/lib/services/publicService';
import { AxiosError } from 'axios';
import { showToast } from '../common/Toast';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  customerPhone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  customerNote: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function CheckoutModal({ open, onClose, onSuccess }: CheckoutModalProps) {
  const { getCurrentItems, currentStoreId, currentTableId } = useCartStore();
  const items = getCurrentItems();
  const getOriginal = (item: any) => item.originalPrice ?? item.price;
  const getFinal = (item: any) => item.finalPrice ?? item.price;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [voucherCode, setVoucherCode] = useState('');
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [voucherId, setVoucherId] = useState<string | null>(null);
  const originalTotal = items.reduce((sum, item) => sum + getOriginal(item) * item.quantity, 0);

  const finalTotal = items.reduce((sum, item) => sum + getFinal(item) * item.quantity, 0);
  const savingTotal = originalTotal - finalTotal;

  const payTotal = finalTotal - orderDiscount;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (isLoading || !currentStoreId || !currentTableId) {
      console.error('❌ Missing data:', { currentStoreId, currentTableId, isLoading });
      setError('Thiếu thông tin bàn hoặc cửa hàng');
      return;
    }

    if (items.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('🚀 Creating order with data:', {
        storeId: currentStoreId,
        tableId: currentTableId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        items: items.length,
      });

      const orderData = {
        storeId: currentStoreId,
        tableId: currentTableId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerNote: data.customerNote || '',
        voucherDiscount: orderDiscount,
        voucherId: voucherId || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await publicService.createOrder(orderData);
      setSuccess(true);

      // ✅ Auto close after 3 seconds
      setTimeout(() => {
        reset();
        setSuccess(false);
        setIsLoading(false); // ✅ CRITICAL: Reset loading state
        setVoucherCode('');
        setOrderDiscount(0);
        setVoucherId(null);
        onSuccess();
      }, 3000);
    } catch (err: unknown) {
      console.error('❌ Order creation failed:', err);

      let errorMessage = 'Đặt hàng thất bại. Vui lòng thử lại.';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
        console.error('❌ API Error:', {
          status: err.response?.status,
          data: err.response?.data,
        });
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };
  const handleApplyVoucher = async () => {
    try {
      const res = await publicService.applyVoucher({
        code: voucherCode,
        storeId: currentStoreId,
        total: finalTotal,
      });

      if (!voucherCode.trim()) {
        showToast.warning({ message: 'Vui long nhập mã voucher rồi tiến hành sử dụng' });
        return;
      }

      setOrderDiscount(res.discount);
      setVoucherId(res.voucherId); // 🔥 QUAN TRỌNG
      showToast.success({ message: 'Áp dụng voucher thành công' });
    } catch {
      setOrderDiscount(0);
      setVoucherId(null);
      showToast.error({ message: 'Voucher không hợp lệ' });
    }
  };

  const handleClose = () => {
    if (!isLoading && !success) {
      reset();
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {success ? (
        <>
          <DialogContent className="text-center py-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600 text-6xl" />
            </div>
            <Typography variant="h5" className="font-bold text-gray-800 mb-3">
              ✅ Đặt hàng thành công!
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-2">
              Món ăn sẽ có sau ~10 phút
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Bạn có thể tiếp tục đặt thêm món
            </Typography>
          </DialogContent>
        </>
      ) : (
        <>
          <DialogTitle className="border-b border-gray-200">
            <Typography variant="h6" component="span" className="font-bold">
              Xác nhận đặt hàng
            </Typography>
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              {error && (
                <Alert severity="error" className="mb-4" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Order Summary */}
              <div className="mb-6">
                <Typography variant="subtitle2" className="font-bold mb-3">
                  Chi tiết đơn hàng:
                </Typography>
                <List className="bg-gray-50 rounded-lg p-2">
                  {items.map((item) => (
                    <ListItem key={item.productId} className="px-2">
                      <div className="flex-1">
                        <Typography variant="body2">{item.name}</Typography>

                        {getOriginal(item) > getFinal(item) && (
                          <Typography
                            variant="caption"
                            className="text-gray-400 line-through block"
                          >
                            {getOriginal(item).toLocaleString('vi-VN')} ₫
                          </Typography>
                        )}

                        <Typography variant="caption" className="text-red-600 font-semibold">
                          {getFinal(item).toLocaleString('vi-VN')} ₫ x {item.quantity}
                        </Typography>
                      </div>

                      {/* 👉 THÊM CỤC NÀY */}
                      <Typography variant="body2" className="font-semibold">
                        {(getFinal(item) * item.quantity).toLocaleString('vi-VN')} ₫
                      </Typography>
                    </ListItem>
                  ))}
                </List>
                <Divider className="my-3" />

                {/* Voucher */}
                <div className="mt-2 mb-3">
                  <TextField
                    label="Mã giảm giá"
                    fullWidth
                    size="small"
                    value={voucherCode}
                    disabled={isLoading}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="VD: SALE10"
                  />

                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    className="mt-2"
                    onClick={handleApplyVoucher}
                  >
                    Áp dụng mã
                  </Button>
                </div>

                <div className="space-y-1">
                  {/* Tạm tính */}
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính:</span>
                    <span>{originalTotal.toLocaleString('vi-VN')} ₫</span>
                  </div>

                  {/* Tiết kiệm */}
                  {savingTotal > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Tiết kiệm:</span>
                      <span>-{(originalTotal - finalTotal).toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )}

                  {/* Voucher Discount */}
                  {orderDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Voucher:</span>
                      <span>-{orderDiscount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )}

                  <Divider className="my-2" />

                  {/* Tổng cộng */}
                  <div className="flex justify-between items-center">
                    <Typography variant="h6" className="font-bold">
                      Tổng cộng:
                    </Typography>
                    <Typography variant="h5" className="text-green-600 font-bold">
                      {payTotal.toLocaleString('vi-VN')} ₫
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Customer Info - ✅ UPDATED: Add customerName */}
              <div className="space-y-4">
                <TextField
                  {...register('customerName')}
                  label="Tên khách hàng *"
                  fullWidth
                  margin="normal"
                  error={!!errors.customerName}
                  helperText={errors.customerName?.message || 'Để gọi tên khi mang món'}
                  disabled={isLoading}
                  placeholder="VD: Nguyễn Văn A"
                />

                <TextField
                  {...register('customerPhone')}
                  label="Số điện thoại *"
                  fullWidth
                  margin="normal"
                  error={!!errors.customerPhone}
                  helperText={errors.customerPhone?.message || 'Để liên hệ khi cần thiết'}
                  disabled={isLoading}
                  placeholder="VD: 0901234567"
                />

                <TextField
                  {...register('customerNote')}
                  label="Ghi chú (tùy chọn)"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  disabled={isLoading}
                  placeholder="VD: Ít cay, không hành..."
                />
              </div>

              {/* Info Note */}
              <Alert severity="info" className="mt-4">
                <Typography variant="body2">
                  💡 Đơn hàng sẽ được gửi đến bếp ngay sau khi xác nhận. Món thường có sau 10-15
                  phút.
                </Typography>
              </Alert>
            </DialogContent>

            <DialogActions className="px-6 pb-6">
              <Button onClick={handleClose} disabled={isLoading} className="flex-1">
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                {isLoading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </Button>
            </DialogActions>
          </form>
        </>
      )}
    </Dialog>
  );
}

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

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const checkoutSchema = z.object({
  customerPhone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  customerNote: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function CheckoutModal({ open, onClose, onSuccess }: CheckoutModalProps) {
  const { items, getTotalAmount, storeId, tableId } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (isLoading || !storeId || !tableId) return;

    try {
      setIsLoading(true);
      setError('');

      const orderData = {
        storeId,
        tableId,
        customerPhone: data.customerPhone,
        customerNote: data.customerNote || '',
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await publicService.createOrder(orderData);

      setSuccess(true);

      // Auto close after 3 seconds
      setTimeout(() => {
        reset();
        setSuccess(false);
        onSuccess();
      }, 3000);
    } catch (err: unknown) {
      let errorMessage = 'Đặt hàng thất bại. Vui lòng thử lại.';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
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
              Cảm ơn quý khách!
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
                      <div className="flex justify-between w-full">
                        <div className="flex-1">
                          <Typography variant="body2">{item.name}</Typography>
                          <Typography variant="caption" className="text-gray-600">
                            {item.price.toLocaleString('vi-VN')} ₫ x {item.quantity}
                          </Typography>
                        </div>
                        <Typography variant="body2" className="font-semibold">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                        </Typography>
                      </div>
                    </ListItem>
                  ))}
                </List>

                <Divider className="my-3" />

                <div className="flex justify-between items-center">
                  <Typography variant="h6" className="font-bold">
                    Tổng cộng:
                  </Typography>
                  <Typography variant="h5" className="text-green-600 font-bold">
                    {getTotalAmount().toLocaleString('vi-VN')} ₫
                  </Typography>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <TextField
                  {...register('customerPhone')}
                  label="Số điện thoại *"
                  fullWidth
                  error={!!errors.customerPhone}
                  helperText={errors.customerPhone?.message || 'Để liên hệ khi cần thiết'}
                  disabled={isLoading}
                  placeholder="VD: 0901234567"
                />

                <TextField
                  {...register('customerNote')}
                  label="Ghi chú (tùy chọn)"
                  fullWidth
                  multiline
                  rows={3}
                  disabled={isLoading}
                  placeholder="VD: Ít cay, không hành..."
                />
              </div>

              {/* Info Note */}
              <Alert severity="info" className="mt-4">
                <Typography variant="body2">
                  💡 Đơn hàng sẽ được gửi đến bếp ngay sau khi xác nhận. Món thường có
                  sau 10-15 phút.
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
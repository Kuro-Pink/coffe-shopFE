'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { Notifications, Visibility, Close } from '@mui/icons-material';
import { Order } from '@/types';
import {
  playNotificationSound,
  stopNotificationSound,
} from '@/utils/notificationSound';

interface OrderNotificationProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onView: (order: Order) => void;
}

export default function OrderNotification({
  open,
  order,
  onClose,
  onView,
}: OrderNotificationProps) {

  useEffect(() => {
    if (open) {
      playNotificationSound();
    } else {
      stopNotificationSound();
    }

    return () => stopNotificationSound();
  }, [open]);


  if (!order) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300',
      }}
    >
      <DialogContent className="text-center py-8">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Notifications className="text-white text-5xl" />
        </div>

        {/* Title */}
        <Typography variant="h5" className="font-bold text-gray-800 mb-2">
          🔔 Đơn hàng mới!
        </Typography>

        <Typography variant="body1" className="text-gray-700 mb-4">
          Bàn <strong>{order.tableName}</strong> vừa đặt món
        </Typography>

        <Divider className="my-4" />

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 mb-4 text-left">
          <Typography variant="subtitle2" className="font-semibold mb-2">
            Chi tiết đơn hàng:
          </Typography>
          <div className="space-y-1">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span className="font-semibold">
                  {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            ))}
          </div>
          <Divider className="my-2" />
          <div className="flex justify-between font-bold text-green-600">
            <span>Tổng cộng:</span>
            <span>{order.totalAmount.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-blue-50 rounded-lg p-3 mb-6 text-left">
          <Typography variant="caption" className="font-semibold text-blue-800">
            📞 Liên hệ:
          </Typography>
          <Typography variant="body2" className="text-blue-700">
            {order.customerPhone}
          </Typography>
          {order.customerNote && (
            <>
              <Typography variant="caption" className="font-semibold text-blue-800 mt-2 block">
                📝 Ghi chú:
              </Typography>
              <Typography variant="body2" className="text-blue-700">
                {order.customerNote}
              </Typography>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Visibility />}
            onClick={() => onView(order)}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            Xem đơn hàng
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Close />}
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
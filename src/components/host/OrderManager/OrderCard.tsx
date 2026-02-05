'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Divider,
  Button,
} from '@mui/material';
import { ExpandMore, ExpandLess, CheckCircle, Cancel, Schedule } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Order } from '@/types';
import { InfoRow } from '@/components/ui';

interface Props {
  order: Order;
  onUpdateStatus: (orderId: string, status: 'completed' | 'cancelled') => void;
}

export default function OrderCard({ order, onUpdateStatus }: Props) {
  const getOriginal = (item: any) => item.originalPrice ?? item.price ?? 0;
  const getFinal = (item: any) => item.finalPrice ?? item.price ?? 0;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };
  const timeAgo = formatDistanceToNow(new Date(order.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  const statusColor =
    order.status === 'pending' ? 'warning' : order.status === 'completed' ? 'success' : 'error';

  return (
    <Card
      className={`shadow-lg border-2 flex flex-colmin-h-[340px]
    ${order.status === 'pending' ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}
    `}
    >
      <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="flex items-start justify-between gap-2">
          <Typography
            className={`w-16 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xl ${
              order.status === 'pending'
                ? 'bg-gradient-to-br from-orange-500 to-red-600'
                : order.status === 'completed'
                  ? 'bg-gradient-to-br from-green-500 to-teal-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
            }`}
          >
            #{order.orderNumber.slice(-4)}
          </Typography>
          <Chip
            size="small"
            color={statusColor}
            label={getStatusText(order.status)}
            className="mt-1"
          />
        </div>

        {/* ===== INFO ===== */}
        <div className="text-xs text-gray-600">
          <InfoRow label="Bàn" value={order.tableName} />
          <InfoRow
            label="Thời gian"
            value={
              <span className="flex items-center gap-1">
                <Schedule fontSize="inherit" />
                {timeAgo}
              </span>
            }
          />
        </div>

        {/* ===== ITEMS PREVIEW ===== */}
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <Typography className="font-semibold text-orange-800">🍽️ Món đã gọi</Typography>
            <Chip
              size="small"
              label={`${order.items.length} món`}
              className="bg-orange-100 text-orange-700"
            />
          </div>

          <div className="space-y-2 max-h-[110px] h-[110px] overflow-auto pr-1">
            {order.items.map((item, index) => (
              <div key={index}>
                <Typography className="text-xs font-medium">
                  - {item.name} × {item.quantity}
                </Typography>
                <div className="flex items-center gap-2 text-left">
                  {getOriginal(item) > getFinal(item) && (
                    <Typography className="text-[10px] text-gray-400 line-through">
                      {(getOriginal(item) * item.quantity).toLocaleString('vi-VN')} ₫
                    </Typography>
                  )}

                  <Typography className="text-xs font-bold text-orange-700">
                    {(getFinal(item) * item.quantity).toLocaleString('vi-VN')} ₫
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ===== TOTAL ===== */}
        <div className="flex justify-between items-center">
          <Typography className="text-sm font-semibold">Tổng</Typography>
          <Typography className="font-bold text-green-600">
            {order.totalAmount.toLocaleString('vi-VN')} ₫
          </Typography>
        </div>

        {/* ===== ACTIONS (FIXED) ===== */}
        {order.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              fullWidth
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => onUpdateStatus(order._id, 'completed')}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              Hoàn thành
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => onUpdateStatus(order._id, 'cancelled')}
            >
              Hủy đơn
            </Button>
          </div>
        )}

        {order.status === 'completed' && order.completedAt && (
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Typography variant="body2" className="text-green-700">
              ✅ Hoàn thành lúc {new Date(order.completedAt).toLocaleString('vi-VN')}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

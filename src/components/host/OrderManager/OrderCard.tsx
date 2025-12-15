'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Cancel,
  Phone,
  Schedule,
  Restaurant,
  TableBar,
} from '@mui/icons-material';
import { Order } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: 'completed' | 'cancelled') => void;
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const [expanded, setExpanded] = useState(order.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

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

  return (
    <Card
      id={`order-${order._id}`}
      className={`shadow-lg border-2 transition-all ${
        order.status === 'pending'
          ? 'border-orange-300 bg-orange-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl ${
                order.status === 'pending'
                  ? 'bg-gradient-to-br from-orange-500 to-red-600'
                  : order.status === 'completed'
                  ? 'bg-gradient-to-br from-green-500 to-teal-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}
            >
              #{order.orderNumber.slice(-3)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Typography variant="h6" className="font-bold">
                  {order.orderNumber}
                </Typography>
                <Chip
                  label={getStatusText(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
                <Chip
                  icon={<Schedule fontSize="small" />}
                  label={timeAgo}
                  size="small"
                  variant="outlined"
                />
              </div>

              <div className="flex items-center gap-4 flex-wrap text-gray-600">
                <div className="flex items-center gap-1">
                  <TableBar fontSize="small" />
                  <Typography variant="body2">{order.tableName}</Typography>
                </div>
                <div className="flex items-center gap-1">
                  <Phone fontSize="small" />
                  <Typography variant="body2">{order.customerPhone}</Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Expand Button */}
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>

        {/* Expandable Content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider className="mb-4" />

          {/* Items */}
          <div className="mb-4">
            <Typography variant="subtitle2" className="font-semibold mb-3">
              Chi tiết đơn hàng:
            </Typography>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Restaurant className="text-green-600" />
                    </div>
                    <div>
                      <Typography variant="body2" className="font-semibold">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {item.price.toLocaleString('vi-VN')} ₫ x {item.quantity}
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="body2" className="font-bold">
                    {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                  </Typography>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Note */}
          {order.customerNote && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Typography variant="caption" className="font-semibold text-blue-800">
                📝 Ghi chú:
              </Typography>
              <Typography variant="body2" className="text-blue-700 mt-1">
                {order.customerNote}
              </Typography>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
            <Typography variant="h6" className="font-bold text-green-800">
              Tổng cộng:
            </Typography>
            <Typography variant="h5" className="font-bold text-green-600">
              {order.totalAmount.toLocaleString('vi-VN')} ₫
            </Typography>
          </div>

          {/* Actions */}
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
                ✅ Hoàn thành lúc{' '}
                {new Date(order.completedAt).toLocaleString('vi-VN')}
              </Typography>
            </div>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
}
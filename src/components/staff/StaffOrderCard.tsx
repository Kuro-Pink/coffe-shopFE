'use client';
import { useState } from 'react';
import {
Card,
CardContent,
Typography,
Chip,
Button,
Collapse,
IconButton,
Divider,
Alert,
} from '@mui/material';
import {
ExpandMore,
ExpandLess,
CheckCircle,
Cancel,
Print,
Phone,
TableBar,
AccessTime,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Order } from '@/types';
interface StaffOrderCardProps {
order: Order;
onStatusUpdate: (orderId: string, status: 'confirmed' | 'completed' | 'cancelled') => void;
}
export default function StaffOrderCard({ order, onStatusUpdate }: StaffOrderCardProps) {
const [expanded, setExpanded] = useState(false);
const [actionLoading, setActionLoading] = useState(false);
const handleStatusUpdate = async (status: 'confirmed' | 'completed' | 'cancelled') => {
setActionLoading(true);
try {
await onStatusUpdate(order._id, status);
} finally {
setActionLoading(false);
}
};
const getStatusColor = () => {
switch (order.status) {
case 'pending':
return 'warning';
case 'confirmed':
return 'info';
case 'completed':
return 'success';
case 'cancelled':
return 'error';
default:
return 'default';
}
};
const getStatusLabel = () => {
switch (order.status) {
case 'pending':
return 'Chờ xác nhận';
case 'confirmed':
return 'Đang làm';
case 'completed':
return 'Hoàn thành';
case 'cancelled':
return 'Đã hủy';
default:
return order.status;
}
};
return (
<Card className="border-l-4" style={{
borderLeftColor:
order.status === 'pending' ? '#f59e0b' :
order.status === 'confirmed' ? '#3b82f6' :
order.status === 'completed' ? '#10b981' : '#ef4444'
}}>
<CardContent>
{/* Header */}
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<Typography variant="h6" className="font-bold">
{order.orderNumber}
</Typography>
<Chip
           label={getStatusLabel()}
           color={getStatusColor()}
           size="small"
         />
</div>
      <div className="flex items-center gap-2">
        <Chip
          icon={<AccessTime />}
          label={format(new Date(order.createdAt), 'HH:mm', { locale: vi })}
          size="small"
          variant="outlined"
        />
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </div>
    </div>

    {/* Basic Info */}
    <div className="space-y-2 mb-3">
      <div className="flex items-center gap-2 text-gray-600">
        <TableBar fontSize="small" />
        <Typography variant="body2">{order.tableName}</Typography>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Phone fontSize="small" />
        <Typography variant="body2">{order.customerPhone}</Typography>
      </div>
      {order.customerNote && (
        <Alert severity="info" className="mt-2">
          <strong>Ghi chú:</strong> {order.customerNote}
        </Alert>
      )}
    </div>

    {/* Items Summary */}
    <div className="bg-gray-50 rounded p-3 mb-3">
      <Typography variant="body2" className="text-gray-600 mb-2">
        <strong>Món:</strong> {order.items.length} món
      </Typography>
      <Typography variant="h6" className="font-bold text-green-600">
        {order.totalAmount.toLocaleString('vi-VN')} ₫
      </Typography>
    </div>

    {/* Expanded Details */}
    <Collapse in={expanded}>
      <Divider className="mb-3" />
      <div className="space-y-2 mb-3">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <Typography variant="body2">
              {item.name} x{item.quantity}
            </Typography>
            <Typography variant="body2" className="font-semibold">
              {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
            </Typography>
          </div>
        ))}
      </div>
      <Divider className="mb-3" />
    </Collapse>

    {/* Actions */}
    <div className="flex gap-2 flex-wrap">
      {order.status === 'pending' && (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircle />}
            onClick={() => handleStatusUpdate('confirmed')}
            disabled={actionLoading}
            size="small"
          >
            Xác nhận
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={actionLoading}
            size="small"
          >
            Hủy
          </Button>
        </>
      )}

      {order.status === 'confirmed' && (
        <>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => handleStatusUpdate('completed')}
            disabled={actionLoading}
            size="small"
          >
            Hoàn thành
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={actionLoading}
            size="small"
          >
            Hủy
          </Button>
        </>
      )}

      <Button
        variant="outlined"
        startIcon={<Print />}
        size="small"
      >
        In
      </Button>
    </div>
  </CardContent>
</Card>
);
}

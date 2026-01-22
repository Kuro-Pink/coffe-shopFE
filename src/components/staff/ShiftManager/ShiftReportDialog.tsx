// Create: src/components/staff/ShiftManager/ShiftReportDialog.tsx

'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Print,
  AccessTime,
  AttachMoney,
  Receipt,
  TrendingUp,
  MoneyOff,
} from '@mui/icons-material';
import { format, differenceInMinutes } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ShiftReport } from '@/types';

interface ShiftReportDialogProps {
  open: boolean;
  shift: ShiftReport;
  onClose: () => void;
}

export default function ShiftReportDialog({ open, shift, onClose }: ShiftReportDialogProps) {
  console.log('Shift Report:', shift);
  const handlePrint = () => {
    window.print();
  };
  const safeDate = (value?: string | Date) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const safeFormat = (value?: string | Date) => {
    const d = safeDate(value);
    return d ? format(d, 'HH:mm dd/MM/yyyy', { locale: vi }) : '--';
  };

  const checkIn = safeDate(shift.checkInTime);
  const checkOut = safeDate(shift.checkOutTime);

  const shiftDuration = checkIn && checkOut ? differenceInMinutes(checkOut, checkIn) : 0;

  const hours = Math.floor(shiftDuration / 60);
  const minutes = shiftDuration % 60;

  const staffName = shift.staffId.name ?? 0;
  const ordersCompleted = shift.ordersCompleted ?? 0;
  const totalRevenue = shift.totalRevenue ?? 0;
  const discrepancy = shift.discrepancy ?? 0;
  const unpaidOrders = shift.unpaidOrders ?? 0;

  const avgOrderValue = ordersCompleted > 0 ? totalRevenue / ordersCompleted : 0;
  const hasDiscrepancy = discrepancy !== 0;
  const isLargeDiscrepancy = Math.abs(discrepancy) > 50000;

  const money = (value?: number) => (value ?? 0).toLocaleString();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <div className="flex items-center gap-2">
          <CheckCircle />
          <span>Báo cáo ca làm việc</span>
        </div>
      </DialogTitle>

      <DialogContent className="mt-4">
        {/* Success Message */}
        <Alert severity="success" className="mb-4">
          <strong>Check-out thành công!</strong> Ca làm việc đã kết thúc. Cảm ơn bạn đã làm việc
          chăm chỉ!
        </Alert>

        {/* Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" className="text-gray-600 block mb-1">
                Nhân viên
              </Typography>
              <Typography variant="h6" className="font-bold">
                {staffName}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" className="text-gray-600 block mb-1">
                Thời gian làm việc
              </Typography>
              <Typography variant="h6" className="font-bold text-blue-600">
                {hours}h {minutes}m
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" className="text-gray-600 block mb-1">
                Bắt đầu
              </Typography>
              <Typography variant="body1">{safeFormat(shift.checkInTime)}</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" className="text-gray-600 block mb-1">
                Kết thúc
              </Typography>
              <Typography variant="body1">{safeFormat(shift.checkOutTime)}</Typography>
            </Grid>
          </Grid>
        </div>

        {/* Performance Stats */}
        <Typography variant="h6" className="font-bold mb-3">
          📊 Hiệu suất làm việc
        </Typography>

        <Grid container spacing={2} className="mb-4">
          <Grid size={{ xs: 6, md: 3 }}>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Receipt className="text-blue-600 mb-1" />
              <Typography variant="h5" className="font-bold text-blue-600">
                {shift.ordersProcessed ?? 0}
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Tổng đơn
              </Typography>
            </div>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <CheckCircle className="text-green-600 mb-1" />
              <Typography variant="h5" className="font-bold text-green-600">
                {shift.ordersCompleted ?? 0}
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Hoàn thành
              </Typography>
            </div>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <Warning className="text-red-600 mb-1" />
              <Typography variant="h5" className="font-bold text-red-600">
                {shift.ordersCancelled ?? 0}
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Đã hủy
              </Typography>
            </div>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <TrendingUp className="text-purple-600 mb-1" />
              <Typography variant="h6" className="font-bold text-purple-600">
                {money(avgOrderValue)}
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                TB/đơn (₫)
              </Typography>
            </div>
          </Grid>
        </Grid>

        <Divider className="my-4" />

        {/* Revenue Details */}
        <Typography variant="h6" className="font-bold mb-3">
          💰 Doanh thu
        </Typography>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 mb-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AttachMoney className="text-orange-600" fontSize="small" />
                <Typography variant="body2" className="text-gray-700">
                  Tiền mặt:
                </Typography>
              </div>
              <Typography variant="body1" className="font-semibold text-orange-600">
                {money(shift.cashCollected)} ₫
              </Typography>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AttachMoney className="text-blue-600" fontSize="small" />
                <Typography variant="body2" className="text-gray-700">
                  Chuyển khoản:
                </Typography>
              </div>
              <Typography variant="body1" className="font-semibold text-blue-600">
                {money(shift.transferCollected)} ₫
              </Typography>
            </div>

            <Divider />

            <div className="flex justify-between items-center">
              <Typography variant="body1" className="font-bold text-gray-800">
                Tổng thu thực tế:
              </Typography>
              <Typography variant="h6" className="font-bold text-green-600">
                {money(shift.totalRevenue)} ₫
              </Typography>
            </div>
          </div>
        </div>

        {/* System Comparison */}
        <div
          className={`rounded-lg p-4 mb-4 ${
            hasDiscrepancy
              ? isLargeDiscrepancy
                ? 'bg-red-50 border-2 border-red-200'
                : 'bg-orange-50 border-2 border-orange-200'
              : 'bg-green-50 border-2 border-green-200'
          }`}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Typography variant="body2" className="text-gray-700">
                Doanh thu hệ thống:
              </Typography>
              <Typography variant="body1" className="font-semibold text-blue-600">
                {money(shift.systemRevenue)} ₫
              </Typography>
            </div>

            <div className="flex justify-between items-center">
              <Typography variant="body2" className="text-gray-700">
                Doanh thu thực tế:
              </Typography>
              <Typography variant="body1" className="font-semibold text-green-600">
                {money(shift.totalRevenue)} ₫
              </Typography>
            </div>

            <Divider />

            <div className="flex justify-between items-center">
              <Typography variant="body1" className="font-bold">
                Chênh lệch:
              </Typography>
              <div className="flex items-center gap-2">
                {hasDiscrepancy && (
                  <Chip
                    size="small"
                    label={discrepancy > 0 ? 'Thừa' : 'Thiếu'}
                    color={discrepancy > 0 ? 'warning' : 'error'}
                  />
                )}
                <Typography
                  variant="h6"
                  className={`font-bold ${
                    shift.discrepancy === 0
                      ? 'text-green-600'
                      : discrepancy > 0
                        ? 'text-orange-600'
                        : 'text-red-600'
                  }`}
                >
                  {discrepancy > 0 && '+'}
                  {money(discrepancy)} ₫
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Discrepancy Alert */}
        {hasDiscrepancy && (
          <Alert
            severity={isLargeDiscrepancy ? 'error' : 'warning'}
            className="mb-4"
            icon={<Warning />}
          >
            <strong>
              {discrepancy > 0
                ? `Thừa ${discrepancy.toLocaleString()} ₫`
                : `Thiếu ${Math.abs(discrepancy ?? 0).toLocaleString()} ₫`}
            </strong>
            <br />
            {isLargeDiscrepancy
              ? 'Chênh lệch lớn! Vui lòng kiểm tra lại và báo cáo với quản lý.'
              : 'Có chênh lệch nhỏ. Kiểm tra xem có sai sót gì không.'}
          </Alert>
        )}

        {!hasDiscrepancy && (
          <Alert severity="success" className="mb-4" icon={<CheckCircle />}>
            <strong>Khớp chính xác!</strong> Doanh thu thực tế khớp hoàn toàn với hệ thống.
          </Alert>
        )}

        {/* Unpaid Orders */}
        {unpaidOrders > 0 && (
          <Alert severity="warning" className="mb-4" icon={<MoneyOff />}>
            <strong>Công nợ:</strong> Có {shift.unpaidOrders} đơn chưa thanh toán hết (tổng nợ:{' '}
            {money(shift.unpaidAmount)} ₫)
          </Alert>
        )}

        {/* Notes */}
        {shift.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <Typography variant="body2" className="font-semibold mb-2">
              📝 Ghi chú:
            </Typography>
            <Typography variant="body2" className="text-gray-700">
              {shift.notes}
            </Typography>
          </div>
        )}
      </DialogContent>

      <DialogActions className="p-4 bg-gray-50">
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
          In báo cáo
        </Button>
        <Button variant="contained" onClick={onClose} className="bg-green-600 hover:bg-green-700">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

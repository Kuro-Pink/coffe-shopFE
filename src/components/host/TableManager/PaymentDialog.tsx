import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Alert,
  List,
  ListItem,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Table, Order } from '@/types';
import { storeService } from '@/lib/services/storeService';
import { showToast } from '@/components/common/Toast';
import BillDisplay from '@/components/host/BillDisplay';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AxiosError } from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Bill } from '@/types';

type Html2CanvasOptions = Parameters<typeof html2canvas>[1];

interface PaymentDialogProps {
  open: boolean;
  table: Table | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function PaymentDialog({ open, table, onClose, onSuccess }: PaymentDialogProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [bill, setBill] = useState<Bill | null>(null);
  const [step, setStep] = useState<'loading' | 'payment' | 'bill'>('loading');
  const getOriginal = (item: any) => item.originalPrice ?? item.price ?? 0;
  const getFinal = (item: any) => item.finalPrice ?? item.price ?? 0;
  const getItemTotal = (item: any) => getFinal(item) * (item.quantity || 1);

  useEffect(() => {
    if (open && table) {
      fetchOrders();
    } else {
      // Reset state when closed
      setOrders([]);
      setBill(null);
      setStep('loading');
      setPaymentMethod('cash');
      setAmountReceived('');
    }
  }, [open, table]);

  const fetchOrders = async () => {
    if (!table) return;

    setLoading(true);
    try {
      // Get unpaid orders for this table (backend auto-filters by session)
      const data = await storeService.getUnpaidOrdersByTable(table._id);

      if (data.length === 0) {
        showToast.warning({ message: 'Không có đơn hàng nào cần thanh toán' });
        onClose();
        return;
      }

      setOrders(data);
      setStep('payment');
    } catch (err: unknown) {
      let errorMessage = 'Không thể tải danh sách đơn hàng';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getChangeAmount = () => {
    if (paymentMethod !== 'cash') return 0;
    const received = parseFloat(amountReceived) || 0;
    return Math.max(0, received - getTotalAmount());
  };

  const handlePayment = async () => {
    if (!table) return;

    const totalAmount = getTotalAmount();

    if (paymentMethod === 'cash') {
      const received = parseFloat(amountReceived);

      if (!amountReceived || isNaN(received)) {
        showToast.error({ message: 'Vui lòng nhập số tiền khách đưa' });
        return;
      }

      if (received < totalAmount) {
        showToast.error({
          message: `Số tiền nhận (${received.toLocaleString('vi-VN')} ₫) nhỏ hơn tổng tiền cần thanh toán`,
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      // Create bill (backend auto-combines orders)
      const billData = await storeService.createBill(table.storeId.toString(), {
        tableId: table._id,
        orderIds: orders.map((o) => o._id),
        paymentMethod,
        amountReceived: paymentMethod === 'cash' ? parseFloat(amountReceived) : undefined,
      });
      console.log('BILL:', billData);

      setBill(billData);
      setStep('bill');
      showToast.success({ message: 'Thanh toán thành công!' });
    } catch (err: unknown) {
      let errorMessage = 'Thanh toán thất bại';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      showToast.error({ message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (!bill) return;

    // Get the bill content
    const billElement = document.getElementById('bill-content');
    if (!billElement) {
      showToast.error({ message: 'Không tìm thấy nội dung hóa đơn' });
      return;
    }

    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast.error({ message: 'Vui lòng cho phép popup để in' });
      return;
    }

    // Generate print HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hóa đơn ${bill.billNumber}</title>
        <style>
          @media print {
            @page { margin: 10mm; }
            body { margin: 0; }
          }
          body {
            font-family: Arial, sans-serif;
            max-width: 80mm;
            margin: 0 auto;
            padding: 5mm;
          }
          * {
            box-sizing: border-box;
          }
        </style>
        ${document.head.innerHTML}
      </head>
      <body>
        ${billElement.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 100);
          }
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownloadPDF = async () => {
    if (!bill) return;

    try {
      showToast.info({ message: 'Đang tạo PDF...' });

      // Get the bill content element
      const billElement = document.getElementById('bill-content');
      if (!billElement) {
        throw new Error('Bill content not found');
      }

      // Convert to canvas
      const canvas = await html2canvas(billElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      } as Html2CanvasOptions);

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`HoaDon_${bill.billNumber}.pdf`);

      showToast.success({ message: 'Tải hóa đơn thành công!' });
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast.error({ message: 'Không thể tải PDF' });
    }
  };

  const handleClose = () => {
    if (step === 'bill') {
      // Already paid - trigger refresh
      onSuccess();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === 'loading' && 'Đang tải...'}
        {step === 'payment' && 'Thanh toán'}
        {step === 'bill' && 'Hóa đơn'}
      </DialogTitle>

      <DialogContent>
        {/* Loading State */}
        {step === 'loading' && (
          <div className="text-center py-8">
            <CircularProgress />
          </div>
        )}

        {/* Payment Form */}
        {step === 'payment' && (
          <div className="space-y-4">
            {/* Table & Customer Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <Typography variant="body2" className="text-gray-600 mb-1">
                <strong>Bàn :</strong> {table?.tableNumber} - {table?.area}
              </Typography>
              {table?.currentSession && (
                <>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    <strong>Khách hàng:</strong> {table.currentSession.customerName || 'Khách'}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    <strong>SĐT khách hàng:</strong> {table.currentSession.customerPhone}
                  </Typography>
                </>
              )}
            </div>

            {/* Orders List */}
            <div>
              <Typography variant="subtitle2" className="font-bold mb-2">
                Đơn hàng ({orders.length}):
              </Typography>

              <div className="bg-gray-50 rounded-lg">
                {orders.map((order) => (
                  <Accordion
                    key={order._id}
                    disableGutters
                    elevation={0}
                    sx={{
                      borderBottom: '1px solid #e5e7eb', // tailwind gray-200
                      '&:before': {
                        display: 'none', // bỏ line mặc định của MUI
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon className="transition-transform" />}
                      aria-controls="order-content"
                      id={`order-${order._id}`}
                      sx={{
                        borderRadius: 1,
                        backgroundColor: '#f9fafb', // gray-50
                        cursor: 'pointer',

                        '&:hover': {
                          backgroundColor: '#f3f4f6', // gray-100
                        },

                        '&.Mui-expanded': {
                          backgroundColor: '#ecfdf5', // green-50
                        },
                      }}
                    >
                      <div className="flex justify-between w-full items-center">
                        <div>
                          <Typography variant="body2" className="font-semibold">
                            {order.orderNumber}
                          </Typography>

                          <Typography variant="caption" className="text-gray-600 block">
                            {format(new Date(order.createdAt), 'HH:mm - dd/MM/yyyy', {
                              locale: vi,
                            })}
                          </Typography>

                          <div className="flex items-center gap-2 mt-1">
                            <Typography variant="caption" className="text-gray-600">
                              {order.items.length} món
                            </Typography>

                            {order.voucherDiscount > 0 && (
                              <Chip
                                size="small"
                                color="info"
                                icon={<LocalOfferIcon fontSize="small" />}
                                label={`-${order.voucherDiscount.toLocaleString('vi-VN')} ₫`}
                              />
                            )}
                          </div>
                        </div>
                        <Typography variant="body2" className="font-bold text-green-600">
                          {order.totalAmount.toLocaleString('vi-VN')} ₫
                        </Typography>
                      </div>
                    </AccordionSummary>

                    <AccordionDetails className="pt-0">
                      <List dense>
                        {order.items.map((item, index) => (
                          <ListItem
                            key={index}
                            className="flex justify-between border-b border-gray-200 py-1"
                          >
                            <div>
                              <Typography variant="body2">{item.name}</Typography>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  {getOriginal(item) > getFinal(item) && (
                                    <Typography
                                      variant="caption"
                                      className="text-gray-400 line-through"
                                    >
                                      {(getOriginal(item) * item.quantity).toLocaleString('vi-VN')}{' '}
                                      ₫
                                    </Typography>
                                  )}

                                  <Typography
                                    variant="caption"
                                    className="font-bold text-orange-700"
                                  >
                                    {(getFinal(item) * item.quantity).toLocaleString('vi-VN')} ₫
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>
            </div>

            <Divider />

            {/* Payment Method */}
            <FormControl fullWidth>
              <InputLabel>Phương thức thanh toán</InputLabel>
              <Select
                value={paymentMethod}
                label="Phương thức thanh toán"
                onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'transfer')}
              >
                <MenuItem value="cash">💵 Tiền mặt</MenuItem>
                <MenuItem value="transfer">🏦 Chuyển khoản</MenuItem>
              </Select>
            </FormControl>

            {/* Cash Payment */}
            {paymentMethod === 'cash' && (
              <TextField
                fullWidth
                margin="normal"
                label="Tiền nhận"
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder={getTotalAmount().toString()}
                helperText="Nhập số tiền khách đưa"
              />
            )}

            {/* Summary */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <Typography variant="body2">Tổng tiền:</Typography>
                <Typography variant="body2" className="font-bold">
                  {getTotalAmount().toLocaleString('vi-VN')} ₫
                </Typography>
              </div>

              {paymentMethod === 'cash' && amountReceived && (
                <>
                  <div className="flex justify-between mb-2">
                    <Typography variant="body2">Tiền nhận:</Typography>
                    <Typography variant="body2" className="font-bold">
                      {parseFloat(amountReceived).toLocaleString('vi-VN')} ₫
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="body2">Tiền thừa:</Typography>
                    <Typography variant="body2" className="font-bold text-green-600">
                      {getChangeAmount().toLocaleString('vi-VN')} ₫
                    </Typography>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bill Display */}
        {step === 'bill' && bill && (
          <div>
            <Alert severity="success" className="mb-4">
              ✅ Thanh toán thành công! Hóa đơn đã được tạo.
            </Alert>

            {/* Use BillDisplay component */}
            <div id="bill-content">
              <BillDisplay bill={bill} />
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className="px-6 pb-6">
        {step === 'payment' && (
          <>
            <Button onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={
                submitting ||
                (paymentMethod === 'cash' &&
                  (!amountReceived || parseFloat(amountReceived) < getTotalAmount()))
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Đang xử lý...' : 'Thanh toán'}
            </Button>
          </>
        )}

        {step === 'bill' && (
          <>
            <Button onClick={handlePrint} variant="outlined">
              In hóa đơn
            </Button>
            <Button onClick={handleDownloadPDF} variant="outlined">
              Tải PDF
            </Button>
            <Button onClick={handleClose} variant="contained" className="bg-green-600">
              Đóng
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

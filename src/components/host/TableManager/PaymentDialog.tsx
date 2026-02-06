'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';

import { Table, Order } from '@/types';
import { storeService } from '@/lib/services/storeService';
import { showToast } from '@/components/common/Toast';
import { AxiosError } from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Bill } from '@/types';
import PaymentSection from '@/components/host/BillManager/PaymentSection';
import BillDisplay from '@/components/host/BillManager/BillDisplay';

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

  // ===== PRICE HELPERS =====
  const getOriginal = (item: any) => item.originalPrice ?? item.price ?? 0;
  const getFinal = (item: any) => item.finalPrice ?? item.price ?? 0;

  // ===== EFFECT =====
  useEffect(() => {
    if (open && table) {
      fetchOrders();
    } else {
      resetState();
    }
  }, [open, table]);

  const resetState = () => {
    setOrders([]);
    setBill(null);
    setStep('loading');
    setPaymentMethod('cash');
    setAmountReceived('');
  };

  // ===== FETCH ORDERS =====
  const fetchOrders = async () => {
    if (!table) return;

    setLoading(true);
    try {
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

  // ===== TOTAL =====
  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getChangeAmount = () => {
    if (paymentMethod !== 'cash') return 0;
    const received = parseFloat(amountReceived) || 0;
    return Math.max(0, received - getTotalAmount());
  };

  // ===== PAYMENT =====
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
          message: `Số tiền nhận nhỏ hơn tổng tiền cần thanh toán`,
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const billData = await storeService.createBill(table.storeId.toString(), {
        tableId: table._id,
        orderIds: orders.map((o) => o._id),
        paymentMethod,
        amountReceived: paymentMethod === 'cash' ? parseFloat(amountReceived) : undefined,
      });

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

  // ===== PRINT =====
  const handlePrint = () => {
    if (!bill) return;

    const billElement = document.getElementById('bill-content');
    if (!billElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <body>${billElement.innerHTML}</body>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 100);
        }
      </script>
      </html>
    `);

    printWindow.document.close();
  };

  // ===== PDF =====
  const handleDownloadPDF = async () => {
    if (!bill) return;

    try {
      const billElement = document.getElementById('bill-content');
      if (!billElement) return;

      const canvas = await html2canvas(billElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      } as Html2CanvasOptions);

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 0);
      pdf.save(`HoaDon_${bill.billNumber}.pdf`);
    } catch {
      showToast.error({ message: 'Không thể tải PDF' });
    }
  };

  const handleClose = () => {
    if (step === 'bill') onSuccess();
    onClose();
  };

  // ===== RENDER =====
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === 'loading' && 'Đang tải...'}
        {step === 'payment' && 'Thanh toán'}
        {step === 'bill' && 'Hóa đơn'}
      </DialogTitle>

      <DialogContent>
        {step === 'loading' && (
          <div className="text-center py-8">
            <CircularProgress />
          </div>
        )}

        {step === 'payment' && (
          <PaymentSection
            table={table}
            orders={orders}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            amountReceived={amountReceived}
            setAmountReceived={setAmountReceived}
            getTotalAmount={getTotalAmount}
            getChangeAmount={getChangeAmount}
            getOriginal={getOriginal}
            getFinal={getFinal}
          />
        )}

        {step === 'bill' && bill && <BillDisplay bill={bill} />}
      </DialogContent>

      <DialogActions>
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
            <Button onClick={handlePrint}>In hóa đơn</Button>
            <Button onClick={handleDownloadPDF}>Tải PDF</Button>
            <Button onClick={handleClose} variant="contained" className="bg-green-600">
              Đóng
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

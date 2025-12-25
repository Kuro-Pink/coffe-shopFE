import { Bill, Store } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import jsPDF from 'jspdf';

interface BillPrintProps {
  bill: Bill;
  store: Store;
}

// ✅ Generate PDF Bill
export const generateBillPDF = (bill: Bill, store: Store) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 20;
  const leftMargin = 20;
  const rightMargin = 190;

  // ========== HEADER ==========
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(store.name, 105, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(store.address, 105, y, { align: 'center' });
  y += 5;
  doc.text(`SĐT: ${store.phone} | Email: ${store.email || ''}`, 105, y, { align: 'center' });
  y += 10;

  // Divider
  doc.setLineWidth(0.5);
  doc.line(leftMargin, y, rightMargin, y);
  y += 8;

  // ========== TITLE ==========
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HÓA ĐƠN THANH TOÁN', 105, y, { align: 'center' });
  y += 8;

  // Bill Number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Số hóa đơn: ${bill.billNumber}`, leftMargin, y);
  y += 5;
  doc.text(`Ngày: ${format(new Date(bill.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}`, leftMargin, y);
  y += 10;

  // ========== TABLE & CUSTOMER INFO ==========
  doc.setFont('helvetica', 'bold');
  doc.text('THÔNG TIN:', leftMargin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text(`Bàn: ${bill.tableName} (${bill.tableArea})`, leftMargin + 5, y);
  y += 5;
  doc.text(`Khách hàng: ${bill.customerName}`, leftMargin + 5, y);
  y += 5;
  doc.text(`SĐT: ${bill.customerPhone}`, leftMargin + 5, y);
  y += 5;

  const sessionDuration = Math.round(
    (new Date(bill.sessionEndTime).getTime() - new Date(bill.sessionStartTime).getTime()) / 60000
  );
  doc.text(`Thời gian: ${sessionDuration} phút`, leftMargin + 5, y);
  y += 10;

  // ========== ITEMS TABLE ==========
  doc.setFont('helvetica', 'bold');
  doc.text('CHI TIẾT MÓN ĂN:', leftMargin, y);
  y += 6;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(leftMargin, y - 4, 170, 7, 'F');
  doc.text('STT', leftMargin + 2, y);
  doc.text('Tên món', leftMargin + 15, y);
  doc.text('SL', leftMargin + 110, y);
  doc.text('Đơn giá', leftMargin + 125, y);
  doc.text('Thành tiền', leftMargin + 155, y);
  y += 8;

  // Items
  doc.setFont('helvetica', 'normal');
  bill.items.forEach((item, index) => {
    doc.text((index + 1).toString(), leftMargin + 2, y);
    doc.text(item.name, leftMargin + 15, y);
    doc.text(item.quantity.toString(), leftMargin + 110, y);
    doc.text(item.price.toLocaleString('vi-VN'), leftMargin + 125, y);
    doc.text((item.price * item.quantity).toLocaleString('vi-VN'), leftMargin + 155, y);
    y += 6;
  });

  y += 5;
  doc.setLineWidth(0.3);
  doc.line(leftMargin, y, rightMargin, y);
  y += 8;

  // ========== TOTALS ==========
  doc.setFont('helvetica', 'normal');
  doc.text('Tạm tính:', leftMargin + 120, y);
  doc.text(`${bill.subtotal.toLocaleString('vi-VN')} ₫`, leftMargin + 155, y);
  y += 6;

  if (bill.discount) {
    doc.text('Giảm giá:', leftMargin + 120, y);
    doc.text(`-${bill.discount.toLocaleString('vi-VN')} ₫`, leftMargin + 155, y);
    y += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TỔNG CỘNG:', leftMargin + 120, y);
  doc.text(`${bill.totalAmount.toLocaleString('vi-VN')} ₫`, leftMargin + 155, y);
  y += 10;

  // ========== PAYMENT INFO ==========
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Phương thức: ${bill.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}`,
    leftMargin,
    y
  );
  y += 6;

  if (bill.paymentMethod === 'cash' && bill.amountReceived) {
    doc.text(`Tiền nhận: ${bill.amountReceived.toLocaleString('vi-VN')} ₫`, leftMargin, y);
    y += 5;
    doc.text(`Tiền thừa: ${bill.changeAmount?.toLocaleString('vi-VN')} ₫`, leftMargin, y);
    y += 5;
  }

  // ========== QR PAYMENT (if transfer) ==========
  if (bill.paymentMethod === 'transfer' && bill.qrPaymentUrl) {
    y += 10;
    doc.text('QR Thanh toán:', leftMargin, y);
    y += 5;
    // Add QR code image here if you have it
    // doc.addImage(qrImage, 'PNG', leftMargin, y, 50, 50);
  }

  y += 10;

  // ========== FOOTER ==========
  doc.setLineWidth(0.3);
  doc.line(leftMargin, y, rightMargin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Cảm ơn quý khách!', 105, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Hẹn gặp lại!', 105, y, { align: 'center' });

  // Save PDF
  doc.save(`HoaDon_${bill.billNumber}.pdf`);
};

// ✅ Print Bill (Browser print)
export const printBill = (bill: Bill, store: Store) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Vui lòng cho phép popup để in hóa đơn');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hóa đơn ${bill.billNumber}</title>
      <style>
        @media print {
          @page { margin: 15mm; }
          body { margin: 0; }
        }
        body {
          font-family: Arial, sans-serif;
          max-width: 80mm;
          margin: 0 auto;
          padding: 10mm;
        }
        h1 { text-align: center; font-size: 20px; margin: 10px 0; }
        h2 { text-align: center; font-size: 16px; margin: 5px 0; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
        .info { margin: 10px 0; font-size: 12px; }
        .info div { margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
        th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; }
        td { padding: 5px 0; }
        .total { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; font-size: 14px; }
        .footer { text-align: center; border-top: 2px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${store.name}</h1>
        <div>${store.address}</div>
        <div>SĐT: ${store.phone}</div>
        ${store.email ? `<div>Email: ${store.email}</div>` : ''}
      </div>

      <h2>HÓA ĐƠN THANH TOÁN</h2>

      <div class="info">
        <div><strong>Số HĐ:</strong> ${bill.billNumber}</div>
        <div><strong>Ngày:</strong> ${format(new Date(bill.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
        <div><strong>Bàn:</strong> ${bill.tableName} (${bill.tableArea})</div>
        <div><strong>Khách:</strong> ${bill.customerName}</div>
        <div><strong>SĐT:</strong> ${bill.customerPhone}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Món</th>
            <th style="text-align: right;">SL</th>
            <th style="text-align: right;">Giá</th>
            <th style="text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${bill.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td style="text-align: right;">${item.quantity}</td>
              <td style="text-align: right;">${item.price.toLocaleString('vi-VN')}</td>
              <td style="text-align: right;">${(item.price * item.quantity).toLocaleString('vi-VN')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total">
        <div style="display: flex; justify-content: space-between;">
          <span>TỔNG CỘNG:</span>
          <span>${bill.totalAmount.toLocaleString('vi-VN')} ₫</span>
        </div>
        ${bill.paymentMethod === 'cash' && bill.amountReceived ? `
          <div style="display: flex; justify-content: space-between; font-weight: normal; font-size: 12px; margin-top: 5px;">
            <span>Tiền nhận:</span>
            <span>${bill.amountReceived.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: normal; font-size: 12px;">
            <span>Tiền thừa:</span>
            <span>${(bill.changeAmount || 0).toLocaleString('vi-VN')} ₫</span>
          </div>
        ` : ''}
      </div>

      <div style="text-align: center; margin-top: 10px; font-size: 12px;">
        <div>Phương thức: ${bill.paymentMethod === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}</div>
      </div>

      <div class="footer">
        <div><strong>Cảm ơn quý khách!</strong></div>
        <div>Hẹn gặp lại!</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 100);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
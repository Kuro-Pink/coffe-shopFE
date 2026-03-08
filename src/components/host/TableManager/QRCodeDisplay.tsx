'use client';

import { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { QrCode as QrCodeIcon, Download, Print, ContentCopy } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { Table } from '@/types';
import { showToast } from '@/components/common/Toast';

interface QRCodeDisplayProps {
  table: Table;
  open: boolean;
  onClose: () => void;
}

export default function QRCodeDisplay({ table, open, onClose }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate menu URL
  const menuUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/menu/${table.storeId}?table=${table._id}`
      : '';
  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Convert SVG to PNG
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1200;

    img.onload = () => {
      if (!ctx) return;

      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Quét mã để đặt món', canvas.width / 2, 80);

      // Table info
      ctx.font = 'bold 64px Arial';
      ctx.fillText(`Bàn ${table.tableNumber}`, canvas.width / 2, 160);

      ctx.font = '32px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(table.area, canvas.width / 2, 210);

      // QR Code (centered)
      const qrSize = 600;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 250;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Footer
      ctx.font = '28px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Scan để xem menu và đặt món', canvas.width / 2, qrY + qrSize + 60);

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QR-Ban-${table.tableNumber}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - Bàn ${table.tableNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 40px;
            }
            h1 { font-size: 48px; margin: 20px 0; }
            h2 { font-size: 64px; margin: 10px 0; color: #1f2937; }
            p { font-size: 24px; color: #6b7280; margin: 10px 0; }
            .qr-container { margin: 30px 0; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Quét mã để đặt món</h1>
          <h2>Bàn ${table.tableNumber}</h2>
          <p>${table.area}</p>
          <div class="qr-container">${svgData}</div>
          <p>Scan để xem menu và đặt món</p>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="text-center">
        <div className="flex items-center justify-center gap-2">
          <QrCodeIcon className="text-blue-600" />
          <span>QR Code - Bàn {table.tableNumber}</span>
        </div>
      </DialogTitle>

      <DialogContent>
        <Box className="text-center">
          {/* Table Info */}
          <div className="mb-6">
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              Bàn {table.tableNumber}
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              {table.area}
            </Typography>
          </div>

          {/* QR Code */}
          <div
            ref={qrRef}
            className="flex justify-center p-8 bg-white rounded-xl border-2 border-gray-200 mb-6"
          >
            <QRCodeSVG
              value={menuUrl}
              size={300}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '',
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <Typography variant="body2" className="text-blue-800 font-semibold mb-2">
              📱 Hướng dẫn sử dụng:
            </Typography>
            <Typography variant="body2" className="text-blue-700 text-left">
              1. In QR code và đặt tại bàn
              <br />
              2. Khách quét mã để xem menu
              <br />
              3. Khách chọn món và đặt hàng
              <br />
              4. Đơn hàng sẽ hiện ngay trên hệ thống
            </Typography>
          </div>

          <Divider className="my-4" />

          {/* Menu URL */}
          <div className="text-left">
            <Typography variant="body2" className="text-gray-600 mb-2 font-semibold">
              Link menu:
            </Typography>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Typography variant="body2" className="flex-1 text-gray-700 break-all text-xs">
                {menuUrl}
              </Typography>
            </div>
          </div>
        </Box>
      </DialogContent>

      <DialogActions className="justify-center gap-2 pb-4">
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Tải xuống
        </Button>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
          In QR Code
        </Button>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

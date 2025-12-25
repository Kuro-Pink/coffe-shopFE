import { Typography, Divider } from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Bill } from '@/types';

interface BillDisplayProps {
  bill: Bill | null;
}


export default function BillDisplay({ bill }: BillDisplayProps) {
  if (!bill) return null;

  const sessionDuration = Math.round(
    (new Date(bill.sessionEndTime).getTime() - new Date(bill.sessionStartTime).getTime()) / 60000
  );

  return (
    <div className="bg-white rounded-lg p-6 max-w-md mx-auto" style={{ fontFamily: 'monospace' }}>
      {/* Header */}
      {/* <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
        <Typography variant="h5" className="font-bold mb-2">
          {bill.store?.name || 'NHÀ HÀNG'}
        </Typography>
        {bill.store?.address && (
          <Typography variant="body2" className="text-gray-700 mb-1">
            📍 {bill.store.address}
          </Typography>
        )}
        <Typography variant="body2" className="text-gray-700 mb-1">
          📞 {bill.store?.phone || 'N/A'}
        </Typography>
        {bill.store?.email && (
          <Typography variant="body2" className="text-gray-700">
            📧 {bill.store.email}
          </Typography>
        )}
      </div> */}

      {/* Title */}
      <Typography variant="h6" className="font-bold text-center mb-4">
        HÓA ĐƠN THANH TOÁN
      </Typography>

      {/* Bill Info */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Số hóa đơn:</span>
          <span className="font-bold">{bill.billNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Ngày giờ:</span>
          <span className="font-semibold">
            {format(new Date(bill.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}
          </span>
        </div>
      </div>

      <Divider className="my-3" />

      {/* Table & Customer Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <Typography variant="subtitle2" className="font-bold mb-2">
          THÔNG TIN BÀN:
        </Typography>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Bàn:</span>
            <span className="font-semibold">
              {bill.tableName} - {bill.tableArea}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Khách hàng:</span>
            <span className="font-semibold">{bill.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SĐT:</span>
            <span className="font-semibold">{bill.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Giờ vào:</span>
            <span className="font-semibold">
              {format(new Date(bill.sessionStartTime), 'HH:mm', { locale: vi })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Giờ ra:</span>
            <span className="font-semibold">
              {format(new Date(bill.sessionEndTime), 'HH:mm', { locale: vi })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Thời gian:</span>
            <span className="font-semibold">{sessionDuration} phút</span>
          </div>
        </div>
      </div>

      <Divider className="my-3" />

      {/* Items */}
      <Typography variant="subtitle2" className="font-bold mb-2">
        CHI TIẾT ĐƠN HÀNG:
      </Typography>

      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-2 px-1">STT</th>
            <th className="text-left py-2 px-1">Món</th>
            <th className="text-center py-2 px-1">SL</th>
            <th className="text-right py-2 px-1">Giá</th>
            <th className="text-right py-2 px-1">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          {bill.items?.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-2 px-1">{index + 1}</td>
              <td className="py-2 px-1">{item.name}</td>
              <td className="text-center py-2 px-1">{item.quantity}</td>
              <td className="text-right py-2 px-1">
                {item.price.toLocaleString('vi-VN')}
              </td>
              <td className="text-right py-2 px-1 font-semibold">
                {(item.price * item.quantity).toLocaleString('vi-VN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Divider className="my-3" />

      {/* Summary */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="font-semibold">
            {(bill.subtotal || bill.totalAmount).toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {/* {bill.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Giảm giá:</span>
            <span className="font-semibold text-red-600">
              -{bill.discount.toLocaleString('vi-VN')} ₫
            </span>
          </div>
        )} */}

        <Divider />

        <div className="flex justify-between">
          <span className="font-bold text-base">TỔNG CỘNG:</span>
          <span className="font-bold text-lg text-green-600">
            {bill.totalAmount.toLocaleString('vi-VN')} ₫
          </span>
        </div>
      </div>

      <Divider className="my-3" />

      {/* Payment Info (NO QR) */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <Typography variant="subtitle2" className="font-bold mb-2">
          THÔNG TIN THANH TOÁN:
        </Typography>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Phương thức:</span>
            <span className="font-bold">
              {bill.paymentMethod === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
            </span>
          </div>

          {bill.paymentMethod === 'cash' && (
            <>
              {bill.amountReceived && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiền nhận:</span>
                  <span className="font-semibold">
                    {bill.amountReceived.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              )}
              {(bill.changeAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiền thừa:</span>
                  <span className="font-semibold text-orange-600">
                    {bill.changeAmount?.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t-2 border-dashed border-gray-300">
        <Typography variant="h6" className="font-bold text-green-600 mb-2">
          ★ CẢM ƠN QUÝ KHÁCH! ★
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Hẹn gặp lại quý khách!
        </Typography>
      </div>
    </div>
  );
}

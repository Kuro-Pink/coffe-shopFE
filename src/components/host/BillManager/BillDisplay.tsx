import { Typography, Divider } from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Bill } from '@/types';
import { useStoreStore } from '@/lib/stores/storeStore';
import { useAuthStore } from '@/lib/stores/authStore';

interface BillDisplayProps {
  bill: Bill | null;
}

export default function BillDisplay({ bill }: BillDisplayProps) {
  const { store } = useStoreStore();
  const { user } = useAuthStore();

  if (!bill) return null;

  const sessionDuration = Math.max(
    0,
    Math.round(
      (new Date(bill.sessionEndTime).getTime() - new Date(bill.sessionStartTime).getTime()) / 60000,
    ),
  );

  const maskPhone = (phone?: string) => {
    if (!phone) return 'N/A';
    if (phone.length < 7) return phone;
    return `${phone.slice(0, 2)}****${phone.slice(-3)}`;
  };

  const changeAmount = bill.changeAmount ?? 0;

  return (
    <div className="bg-white rounded-lg p-6 max-w-md mx-auto" style={{ fontFamily: 'monospace' }}>
      {/* HEADER STORE */}
      <div className="text-center mb-4 pb-3 border-b border-dashed border-gray-300">
        <Typography variant="h6" className="font-bold">
          {store?.name || 'QUÁN CÀ PHÊ'}
        </Typography>

        {store?.address && (
          <Typography variant="body2" className="text-gray-600">
            {store.address}
          </Typography>
        )}

        <Typography variant="body2" className="text-gray-600">
          ĐT: {store?.phone}
        </Typography>
      </div>

      {/* TITLE */}
      <Typography variant="h6" className="font-bold text-center mb-3">
        HÓA ĐƠN THANH TOÁN
      </Typography>

      {/* BILL INFO */}
      <div className="space-y-1 mb-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Số hóa đơn:</span>
          <span className="font-bold">{bill.billNumber}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Ngày giờ:</span>
          <span className="font-semibold">
            {format(new Date(bill.createdAt), 'HH:mm - dd/MM/yyyy', {
              locale: vi,
            })}
          </span>
        </div>

        {user?.name && (
          <div className="flex justify-between">
            <span className="text-gray-600">Nhân viên:</span>
            <span className="font-semibold">{user?.name}</span>
          </div>
        )}
      </div>

      <Divider className="my-2" />

      {/* TABLE + CUSTOMER */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <Typography variant="subtitle2" className="font-bold mb-2">
          THÔNG TIN BÀN
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
            <span className="font-semibold">{bill.customerName || 'Khách lẻ'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">SĐT:</span>
            <span className="font-semibold">{maskPhone(bill.customerPhone)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Giờ vào:</span>
            <span className="font-semibold">
              {format(new Date(bill.sessionStartTime), 'HH:mm')}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Giờ ra:</span>
            <span className="font-semibold">{format(new Date(bill.sessionEndTime), 'HH:mm')}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Thời gian:</span>
            <span className="font-semibold">{sessionDuration} phút</span>
          </div>
        </div>
      </div>

      <Divider className="my-2" />

      {/* ITEMS */}
      <Typography variant="subtitle2" className="font-bold mb-2">
        CHI TIẾT ĐƠN HÀNG
      </Typography>

      <table className="w-full text-xs mb-3">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-1">STT</th>
            <th className="text-left py-1">Món</th>
            <th className="text-center py-1">SL</th>
            <th className="text-right py-1">Giá</th>
            <th className="text-right py-1">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          {bill.items?.map((item, index) => {
            const price = Number(item.price || 0);
            const total = price * item.quantity;

            return (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-1">{index + 1}</td>
                <td className="py-1">{item.name}</td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">{price.toLocaleString('vi-VN')}</td>
                <td className="text-right py-1 font-semibold">{total.toLocaleString('vi-VN')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Divider className="my-2" />

      {/* SUMMARY */}
      <div className="space-y-1 mb-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="font-semibold">
            {Number(bill.subtotal || 0).toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {(bill.changeAmount ?? 0) > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Mã giảm giá:</span>
            <span>-{Number(bill.changeAmount ?? 0).toLocaleString('vi-VN')} ₫</span>
          </div>
        )}

        <Divider />

        <div className="flex justify-between font-bold text-green-600">
          <span>TỔNG CỘNG:</span>
          <span>{Number(bill.totalAmount || 0).toLocaleString('vi-VN')} ₫</span>
        </div>
      </div>

      <Divider className="my-2" />

      {/* PAYMENT */}
      <div className="bg-blue-50 rounded-lg p-3 mb-3 text-sm">
        <Typography variant="subtitle2" className="font-bold mb-1">
          THANH TOÁN
        </Typography>

        <div className="flex justify-between">
          <span>Phương thức:</span>
          <span className="font-bold">
            {bill.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
          </span>
        </div>

        {bill.paymentMethod === 'cash' && (
          <>
            {bill.amountReceived && (
              <div className="flex justify-between">
                <span>Tiền nhận:</span>
                <span>{Number(bill.amountReceived).toLocaleString('vi-VN')} ₫</span>
              </div>
            )}

            {changeAmount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Tiền thừa:</span>
                <span>{changeAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="text-center pt-3 border-t border-dashed border-gray-300">
        <Typography className="font-bold text-green-600">★ CẢM ƠN QUÝ KHÁCH ★</Typography>
        <Typography variant="body2" className="text-gray-600">
          Hẹn gặp lại!
        </Typography>
      </div>
    </div>
  );
}

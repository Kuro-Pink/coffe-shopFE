'use client';

import {
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import OrderAccordion from '@/components/host/BillManager/OrderAccordion';

export default function PaymentSection(props: any) {
  const {
    table,
    orders,
    paymentMethod,
    setPaymentMethod,
    amountReceived,
    setAmountReceived,
    getTotalAmount,
    getChangeAmount,
    getOriginal,
    getFinal,
  } = props;

  return (
    <div className="space-y-4">
      {/* Table Info */}
      <div className="bg-gray-50 rounded-lg p-3">
        <Typography variant="body2" className="text-gray-600 mb-1">
          <strong>Bàn :</strong> {table?.tableNumber} - {table?.area}
        </Typography>
      </div>

      {/* Orders */}
      <div>
        <Typography variant="subtitle2" className="font-bold mb-2">
          Đơn hàng ({orders.length}):
        </Typography>

        <div className="bg-gray-50 rounded-lg">
          {orders.map((order: any) => (
            <OrderAccordion
              key={order._id}
              order={order}
              getOriginal={getOriginal}
              getFinal={getFinal}
            />
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
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <MenuItem value="cash">💵 Tiền mặt</MenuItem>
          <MenuItem value="transfer">🏦 Chuyển khoản</MenuItem>
        </Select>
      </FormControl>

      {paymentMethod === 'cash' && (
        <TextField
          fullWidth
          label="Tiền nhận"
          type="number"
          value={amountReceived}
          onChange={(e) => setAmountReceived(e.target.value)}
        />
      )}

      {/* Summary */}
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <Typography>Tổng tiền:</Typography>
          <Typography className="font-bold">
            {getTotalAmount().toLocaleString('vi-VN')} ₫
          </Typography>
        </div>

        {paymentMethod === 'cash' && amountReceived && (
          <div className="flex justify-between">
            <Typography>Tiền thừa:</Typography>
            <Typography className="font-bold text-green-600">
              {getChangeAmount().toLocaleString('vi-VN')} ₫
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}

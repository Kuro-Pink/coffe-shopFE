'use client';
import { Typography, Box } from '@mui/material';
import { useAuthStore } from '@/lib/stores/authStore';
import TransactionHistory from '@/components/host/InventoryManager/TransactionHistory';

export default function TransactionsPage() {
  const { user } = useAuthStore();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Lịch sử xuất nhập kho
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Theo dõi chi tiết các giao dịch nhập/xuất nguyên liệu
        </Typography>
      </div>

      {/* Transaction History Component */}
      <TransactionHistory storeId={user?.storeId || ''} />
    </div>
  );
}

'use client';
import { Typography } from '@mui/material';
import { useAuthStore } from '@/lib/stores/authStore';
import UsageReport from '@/components/host/InventoryManager/UsageReport';

export default function UsageReportPage() {
  const { user } = useAuthStore();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Báo cáo sử dụng nguyên liệu
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Phân tích chi tiết việc sử dụng nguyên liệu theo thời gian
        </Typography>
      </div>

      {/* Usage Report Component */}
      <UsageReport storeId={user?.storeId || ''} />
    </div>
  );
}

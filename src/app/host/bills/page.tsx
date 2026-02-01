'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from '@mui/material';
import {
  Receipt,
  Search,
  Download,
  Print,
  Close,
  Visibility,
  CalendarToday,
  TableBar,
  Payment,
  AttachMoney,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import { storeService } from '@/lib/services/storeService';
import { Bill } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  format,
  isValid,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import SummaryCard from '@/components/ui/SummaryCard';
// import * as XLSX from 'xlsx';

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export default function BillsManagementPage() {
  const { user } = useAuthStore();
  const storeId = user?.storeId;

  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'cash' | 'transfer'>(
    'all',
  );

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    if (storeId) {
      fetchBills();
    }
  }, [storeId]);

  useEffect(() => {
    applyFilters();
  }, [bills, searchQuery, dateFilter, customStartDate, customEndDate, paymentMethodFilter]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await storeService.getBills(storeId!);
      setBills(data);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();

    switch (dateFilter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'custom':
        return {
          start: customStartDate ? startOfDay(new Date(customStartDate)) : startOfDay(now),
          end: customEndDate ? endOfDay(new Date(customEndDate)) : endOfDay(now),
        };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  };

  const applyFilters = () => {
    let filtered = [...bills];

    // Date filter
    const { start, end } = getDateRange();
    filtered = filtered.filter((bill) => {
      const billDate = new Date(bill.createdAt);
      return billDate >= start && billDate <= end;
    });

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bill) =>
          bill.billNumber.toLowerCase().includes(query) ||
          bill.customerName?.toLowerCase().includes(query) ||
          bill.customerPhone.includes(query) ||
          bill.tableName.toLowerCase().includes(query),
      );
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter((bill) => bill.paymentMethod === paymentMethodFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredBills(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const handleViewDetail = async (bill: Bill) => {
    setSelectedBill(bill);
    setDetailOpen(true);
  };

  const handlePrintBill = (bill: Bill) => {
    // Create print content
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 15px; }
            .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>HÓA ĐƠN THANH TOÁN</h2>
            <h3>${bill.billNumber}</h3>
          </div>
          
          <div class="info">
            <div class="info-row"><strong>Thời gian:</strong> ${format(new Date(bill.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}</div>
            <div class="info-row"><strong>Bàn:</strong> ${bill.tableName}</div>
            <div class="info-row"><strong>Khách hàng:</strong> ${bill.customerName}</div>
            <div class="info-row"><strong>SĐT:</strong> ${bill.customerPhone}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Món</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${
                bill.items
                  ?.map(
                    (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align:center;">${item.quantity}</td>
                  <td style="text-align:right;">
                    ${item.price.toLocaleString('vi-VN')} ₫
                  </td>
                  <td style="text-align:right;">
                    ${(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                  </td>
                </tr>
              `,
                  )
                  .join('') ||
                `
                <tr>
                  <td colspan="4" style="text-align:center;">
                    Không có thông tin món
                  </td>
                </tr>
              `
              }
            </tbody>
          </table>
          
          <div class="info">
            <div class="info-row"><strong>Phương thức:</strong> ${bill.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</div>
            ${
              bill.paymentMethod === 'cash' && bill.amountReceived
                ? `
              <div class="info-row"><strong>Tiền nhận:</strong> ${bill.amountReceived.toLocaleString('vi-VN')} ₫</div>
              <div class="info-row"><strong>Tiền thừa:</strong> ${(bill.changeAmount || 0).toLocaleString('vi-VN')} ₫</div>
            `
                : ''
            }
          </div>

          <div class="total">
            Tổng cộng: ${bill.totalAmount.toLocaleString('vi-VN')} ₫
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <p>Cảm ơn quý khách!</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  // const handleExportExcel = () => {
  //   // Prepare data for Excel
  //   const exportData = filteredBills.map((bill) => ({
  //     'Mã HĐ': bill.billNumber,
  //     'Thời gian': format(new Date(bill.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }),
  //     Bàn: bill.tableName,
  //     'Khách hàng': bill.customerName,
  //     SĐT: bill.customerPhone,
  //     'Tổng tiền': bill.totalAmount,
  //     'Phương thức': bill.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
  //   }));

  //   // Create workbook
  //   const ws = XLSX.utils.json_to_sheet(exportData);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Hóa đơn');

  //   // Add summary row
  //   const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  //   XLSX.utils.sheet_add_aoa(ws, [[], ['TỔNG CỘNG', '', '', '', '', totalAmount, '', '']], {
  //     origin: -1,
  //   });

  //   // Export
  //   const dateStr = format(new Date(), 'ddMMyyyy', { locale: vi });
  //   XLSX.writeFile(wb, `BaoCao_HoaDon_${dateStr}.xlsx`);
  // };

  const getTotalRevenue = () => {
    return bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  };

  const getCashCount = () => {
    return bills.filter((b) => b.paymentMethod === 'cash').length;
  };

  const getTransferCount = () => {
    return bills.filter((b) => b.paymentMethod === 'transfer').length;
  };

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const paginatedBills = filteredBills.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Quản lý Hóa đơn
          </Typography>
          <Chip
            icon={<Receipt />}
            label={`Tổng: ${bills.length} hóa đơn`}
            size="small"
            color="info"
          />
        </div>

        {/* <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExportExcel}
          className="bg-gradient-to-r from-green-600 to-teal-600"
          disabled={bills.length === 0}
        >
          Xuất Excel
        </Button> */}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Tổng doanh thu"
          value={getTotalRevenue().toLocaleString('vi-VN') + ' ₫'}
          icon={<AttachMoney />}
          color={{
            bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', // blue
            iconBg: 'rgba(255,255,255,0.2)',
            iconColor: '#fff',
          }}
        />

        <SummaryCard
          title="Tiền mặt"
          value={`${getCashCount()} hóa đơn`}
          icon={<Payment />}
          color={{
            bg: 'linear-gradient(135deg, #22c55e, #16a34a)', // green
            iconBg: 'rgba(255,255,255,0.2)',
            iconColor: '#fff',
          }}
        />

        <SummaryCard
          title="Chuyển khoản"
          value={`${getTransferCount()} hóa đơn`}
          icon={<Receipt />}
          color={{
            bg: 'linear-gradient(135deg, #a855f7, #7e22ce)', // purple
            iconBg: 'rgba(255,255,255,0.2)',
            iconColor: '#fff',
          }}
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <Stack spacing={3}>
            {/* Search */}
            <TextField
              margin="normal"
              fullWidth
              placeholder="Tìm theo mã HĐ, tên, SĐT, số bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search className="mr-2 text-gray-400" />,
              }}
            />

            {/* Other Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Filter */}
              <FormControl fullWidth>
                <InputLabel>Thời gian</InputLabel>
                <Select
                  value={dateFilter}
                  label="Thời gian"
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  startAdornment={<CalendarToday className="mr-2 text-gray-400" />}
                >
                  <MenuItem value="today">Hôm nay</MenuItem>
                  <MenuItem value="yesterday">Hôm qua</MenuItem>
                  <MenuItem value="week">Tuần này</MenuItem>
                  <MenuItem value="month">Tháng này</MenuItem>
                  <MenuItem value="custom">Tùy chỉnh</MenuItem>
                </Select>
              </FormControl>

              {dateFilter === 'custom' && (
                <>
                  <TextField
                    margin="normal"
                    fullWidth
                    type="date"
                    label="Từ ngày"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    type="date"
                    label="Đến ngày"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}

              <FormControl fullWidth>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={paymentMethodFilter}
                  label="Phương thức thanh toán"
                  onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
                  startAdornment={<Payment className="mr-2 text-gray-400" />}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="cash">💵 Tiền mặt</MenuItem>
                  <MenuItem value="transfer">🏦 Chuyển khoản</MenuItem>
                </Select>
              </FormControl>
            </div>
          </Stack>
        </CardContent>
      </Card>

      {/* Bills Table */}
      {paginatedBills.length === 0 ? (
        <Box className="text-center py-12">
          <Receipt className="text-gray-400 text-6xl mb-4" />
          <Typography variant="h6" className="text-gray-800 mb-2">
            Không tìm thấy hóa đơn
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Thử thay đổi bộ lọc để xem kết quả khác
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} className="shadow-lg">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-bold">Mã HĐ</TableCell>
                  <TableCell className="font-bold">Thời gian</TableCell>
                  <TableCell className="font-bold">Bàn</TableCell>
                  <TableCell className="font-bold">Khách hàng</TableCell>
                  <TableCell className="font-bold">Tổng tiền</TableCell>
                  <TableCell className="font-bold">PT Thanh toán</TableCell>
                  <TableCell className="font-bold" align="center">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBills.map((bill) => (
                  <TableRow key={bill._id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <Chip
                        label={bill.billNumber}
                        color="primary"
                        size="small"
                        icon={<Receipt />}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(bill.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TableBar fontSize="small" className="text-gray-600" />
                        {bill.tableName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="body2" className="font-semibold">
                          {bill.customerName}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          {bill.customerPhone}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-bold text-green-600">
                        {bill.totalAmount.toLocaleString('vi-VN')} ₫
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bill.paymentMethod === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                        size="small"
                        color={bill.paymentMethod === 'cash' ? 'success' : 'info'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(bill)}
                        className="text-blue-600"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handlePrintBill(bill)}
                        className="text-gray-600"
                      >
                        <Print />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {/* ===== PAGINATION ===== */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
            {/* Page size */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Hiển thị</span>
              <Select
                size="small"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 15, 25, 50].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
              <span>hóa đơn / trang</span>
            </div>

            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              disabled={totalPages <= 1}
            />
          </div>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        {selectedBill && (
          <>
            <DialogTitle>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" className="font-bold">
                    Chi tiết hóa đơn
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {selectedBill.billNumber}
                  </Typography>
                </div>
                <IconButton onClick={() => setDetailOpen(false)}>
                  <Close />
                </IconButton>
              </div>
            </DialogTitle>

            <DialogContent dividers>
              {/* Bill Info */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="caption" className="text-gray-600">
                      Thời gian
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {format(new Date(selectedBill.createdAt), 'HH:mm - dd/MM/yyyy', {
                        locale: vi,
                      })}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="caption" className="text-gray-600">
                      Bàn
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {selectedBill.tableName}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="caption" className="text-gray-600">
                      Khách hàng
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {selectedBill.customerName}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="caption" className="text-gray-600">
                      Số điện thoại
                    </Typography>
                    <Typography variant="body2" className="font-semibold">
                      {selectedBill.customerPhone}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="caption" className="text-gray-600 pr-2">
                      Phương thức thanh toán
                    </Typography>
                    <Chip
                      label={
                        selectedBill.paymentMethod === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'
                      }
                      size="small"
                      color={selectedBill.paymentMethod === 'cash' ? 'success' : 'info'}
                      className="pr-2"
                    />
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Items */}
              <Typography variant="subtitle2" className="font-bold mb-3">
                Chi tiết món ({selectedBill.items?.length || 0} món)
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Món</TableCell>
                      <TableCell align="center">SL</TableCell>
                      <TableCell align="right">Đơn giá</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBill.items?.map((item, idx) => (
                      <TableRow key={item._id || idx}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{item.price.toLocaleString('vi-VN')} ₫</TableCell>
                        <TableCell align="right" className="font-semibold">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider className="my-4" />

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body2">Tổng tiền:</Typography>
                  <Typography variant="body2" className="font-bold">
                    {selectedBill.totalAmount.toLocaleString('vi-VN')} ₫
                  </Typography>
                </div>

                {selectedBill.paymentMethod === 'cash' && selectedBill.amountReceived && (
                  <>
                    <div className="flex justify-between">
                      <Typography variant="body2">Tiền nhận:</Typography>
                      <Typography variant="body2" className="font-bold">
                        {selectedBill.amountReceived.toLocaleString('vi-VN')} ₫
                      </Typography>
                    </div>
                    <div className="flex justify-between">
                      <Typography variant="body2">Tiền thừa:</Typography>
                      <Typography variant="body2" className="font-bold text-green-600">
                        {(selectedBill.changeAmount || 0).toLocaleString('vi-VN')} ₫
                      </Typography>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>

            <DialogActions className="px-6 pb-6">
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => handlePrintBill(selectedBill)}
              >
                In hóa đơn
              </Button>
              <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}

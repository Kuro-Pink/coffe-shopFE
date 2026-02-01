import { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  TextField,
  CircularProgress,
  Box,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { TrendingUp, TrendingDown, Receipt } from '@mui/icons-material';
import { format, subDays, isAfter, isBefore, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { inventoryService } from '@/lib/services/inventoryService';
import { InventoryTransaction } from '@/types';
import { StatTab } from '@/components/ui';

interface TransactionHistoryProps {
  storeId: string;
  ingredientId?: string;
}

type TabType = 'manual' | 'order';
type SortType = 'date_desc' | 'date_asc' | 'qty_desc' | 'qty_asc';

export default function TransactionHistory({ storeId, ingredientId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [tab, setTab] = useState<TabType>('manual');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
  const [sort, setSort] = useState<SortType>('date_desc');
  const [search, setSearch] = useState('');

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 7),
    new Date(),
  ]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setPage(1);
  }, [tab, typeFilter, sort, dateRange, search]);

  useEffect(() => {
    fetchTransactions();
  }, [storeId, ingredientId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getTransactions(storeId);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTER + SORT LOGIC (FIX BUG DATE)
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Tab filter
    result = result.filter((t) => {
      const isOrder = !!t.orderId || t.note?.startsWith('ORD');
      return tab === 'order' ? isOrder : !isOrder;
    });

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    const [from, to] = dateRange;

    if (from && to) {
      const end = endOfDay(to);
      result = result.filter(
        (t) => isAfter(new Date(t.createdAt), from) && isBefore(new Date(t.createdAt), end),
      );
    }

    // Search
    if (search.trim()) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.ingredientId.name.toLowerCase().includes(keyword) ||
          t.note?.toLowerCase().includes(keyword) ||
          t.orderId?.orderNumber?.toLowerCase().includes(keyword),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'date_asc':
          return +new Date(a.createdAt) - +new Date(b.createdAt);
        case 'date_desc':
          return +new Date(b.createdAt) - +new Date(a.createdAt);
        case 'qty_asc':
          return Math.abs(a.quantity) - Math.abs(b.quantity);
        case 'qty_desc':
          return Math.abs(b.quantity) - Math.abs(a.quantity);
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, tab, typeFilter, sort]);

  const handleReset = () => {
    setTab('manual');
    setTypeFilter('all');
    setSearch('');
    setSort('date_desc');
  };

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  const paginatedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <Box className="flex items-center justify-center p-8">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}

      <div className="flex gap-2 mb-4">
        <StatTab active={tab === 'manual'} label="Xuất nhập kho" onClick={() => setTab('manual')} />

        <StatTab active={tab === 'order'} label="Khấu trừ đơn" onClick={() => setTab('order')} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          {/* 🔍 Search + Reset */}
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" mb={2}>
            <TextField
              size="small"
              placeholder="Tìm nguyên liệu / ghi chú / mã order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 240 }}
            />

            <Button
              size="small"
              variant="outlined"
              onClick={handleReset}
              sx={{
                whiteSpace: 'nowrap',
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Reset
            </Button>
          </Box>

          {/* 🎛 Filters row */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
          >
            {/* 🔘 Type filter */}
            <ToggleButtonGroup
              value={typeFilter}
              exclusive
              onChange={(_, value) => value && setTypeFilter(value)}
              size="small"
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 999,
                p: 0.5,

                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 999,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#555',
                },

                /* ALL */
                '& .MuiToggleButton-root[value="all"].Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: '#fff',
                },

                /* IN */
                '& .MuiToggleButton-root[value="in"].Mui-selected': {
                  backgroundColor: 'success.main',
                  color: '#fff',
                },

                /* OUT */
                '& .MuiToggleButton-root[value="out"].Mui-selected': {
                  backgroundColor: 'error.main',
                  color: '#fff',
                },
              }}
            >
              <ToggleButton value="all">Tất cả</ToggleButton>

              <ToggleButton value="in">
                Nhập <TrendingUp fontSize="small" />
              </ToggleButton>

              <ToggleButton value="out">
                Xuất <TrendingDown fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* 📅 Date range */}
            <Box sx={{ minWidth: 260 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateRangePicker
                  value={dateRange}
                  onChange={(newValue) => setDateRange(newValue)}
                  localeText={{ start: 'Từ ngày', end: 'Đến ngày' }}
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ sm: 2 }}>
              <Typography fontWeight={600}>Trạng thái</Typography>
            </Grid>
            <Grid size={{ sm: 4 }}>
              <Typography fontWeight={600}>Nguyên liệu</Typography>
            </Grid>

            <Grid size={{ sm: 3 }}>
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ cursor: 'pointer' }}
                onClick={() => setSort(sort === 'qty_desc' ? 'qty_asc' : 'qty_desc')}
              >
                <Typography fontWeight={600}>Số lượng</Typography>
                <span>{sort.startsWith('qty') ? (sort === 'qty_desc' ? '↓' : '↑') : '↕'}</span>
              </Box>
            </Grid>

            <Grid size={{ sm: 3 }}>
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ cursor: 'pointer' }}
                onClick={() => setSort(sort === 'date_desc' ? 'date_asc' : 'date_desc')}
              >
                <Typography fontWeight={600}>Thời gian</Typography>
                <span>{sort.startsWith('date') ? (sort === 'date_desc' ? '↓' : '↑') : '↕'}</span>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* List */}
      {filteredTransactions.length === 0 ? (
        <Typography className="text-center text-gray-500 py-8">
          Không có giao dịch phù hợp
        </Typography>
      ) : (
        paginatedTransactions.map((transaction) => (
          <Card key={transaction._id}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                {/* Icon & Type */}
                <Grid size={{ xs: 12, sm: 2 }}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'in'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type === 'in' ? <TrendingUp /> : <TrendingDown />}
                    </div>
                    <Chip
                      label={transaction.type === 'in' ? 'Nhập' : 'Xuất'}
                      color={transaction.type === 'in' ? 'success' : 'error'}
                      size="small"
                    />
                  </div>
                </Grid>

                {/* Ingredient & Quantity */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="h6" className="font-semibold">
                    {transaction.ingredientId.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {transaction.type === 'in' ? '+' : '-'}
                    {Math.abs(transaction.quantity).toLocaleString()}{' '}
                    {transaction.ingredientId.unit}
                  </Typography>
                </Grid>

                {/* Before & After */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" className="text-gray-600">
                    {transaction.quantityBefore.toLocaleString()} →{' '}
                    <strong>{transaction.quantityAfter.toLocaleString()}</strong>{' '}
                    {transaction.ingredientId.unit}
                  </Typography>
                </Grid>

                {/* Order & Note */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  {transaction.orderId ? (
                    <Chip
                      label={transaction.orderId.orderNumber}
                      size="small"
                      variant="outlined"
                      icon={<Receipt />}
                    />
                  ) : transaction.note ? (
                    <Typography variant="body2" className="text-gray-600 italic">
                      {transaction.note}
                    </Typography>
                  ) : (
                    <Typography variant="body2" className="text-gray-400">
                      Không có ghi chú
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-gray-500 block mt-1">
                    {format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      )}

      {/* ===== PAGINATION ===== */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {/* Page size */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Hiển thị</span>
          <TextField
            select
            size="small"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            sx={{ width: 90 }}
          >
            {[6, 12, 24].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </TextField>
          <span>giao dịch / trang</span>
        </div>

        <Box>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            disabled={totalPages <= 1}
          />
        </Box>
      </div>
    </div>
  );
}

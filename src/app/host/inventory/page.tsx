'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Warning,
  Inventory,
  TrendingDown,
  AttachMoney,
  Search,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import { inventoryService } from '@/lib/services/inventoryService';
import { Ingredient, InventorySummary } from '@/types';
import IngredientDialog from '@/components/host/InventoryManager/IngredientDialog';
import StockAdjustDialog from '@/components/host/InventoryManager/StockAdjustDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SummaryCard from '@/components/ui/SummaryCard';
import { StatTab } from '@/components/ui';

export default function InventoryManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>(
    'all',
  );

  // Dialog states
  const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);

  useEffect(() => {
    if (user?.storeId) {
      fetchData();
    }
  }, [user?.storeId]);

  useEffect(() => {
    filterIngredients();
  }, [ingredients, searchTerm, stockFilter]);

  const fetchData = async () => {
    if (!user?.storeId) return;
    try {
      setLoading(true);
      const [ingredientsData, summaryData] = await Promise.all([
        inventoryService.getIngredients(user.storeId),
        inventoryService.getInventorySummary(user.storeId),
      ]);
      setIngredients(ingredientsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIngredients = () => {
    let filtered = ingredients;

    if (searchTerm) {
      filtered = filtered.filter((ing) =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by stock status
    if (stockFilter === 'inStock') {
      filtered = filtered.filter((ing) => ing.quantity > ing.minQuantity);
    } else if (stockFilter === 'lowStock') {
      filtered = filtered.filter((ing) => ing.quantity > 0 && ing.quantity <= ing.minQuantity);
    } else if (stockFilter === 'outOfStock') {
      filtered = filtered.filter((ing) => ing.quantity === 0);
    }

    setFilteredIngredients(filtered);
  };

  // Calculate counts for badges
  const inStockCount = ingredients.filter((ing) => ing.quantity > ing.minQuantity).length;
  const lowStockCountActual = ingredients.filter(
    (ing) => ing.quantity > 0 && ing.quantity <= ing.minQuantity,
  ).length;

  const handleDelete = async () => {
    if (!deletingIngredient) return;
    try {
      await inventoryService.deleteIngredient(deletingIngredient._id);
      setDeleteDialogOpen(false);
      setDeletingIngredient(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete ingredient:', error);
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.quantity === 0) {
      return { label: 'Hết hàng', color: 'error' as const };
    }
    if (ingredient.quantity <= ingredient.minQuantity) {
      return { label: 'Sắp hết', color: 'warning' as const };
    }
    return { label: 'Còn hàng', color: 'success' as const };
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Quản lý Kho
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Quản lý nguyên liệu và theo dõi tồn kho
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingIngredient(null);
            setIngredientDialogOpen(true);
          }}
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
        >
          Thêm nguyên liệu
        </Button>
      </div>

      {/* Stats Summary */}
      {summary && (
        <Grid container spacing={3} className="mb-8">
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Tổng nguyên liệu"
              value={summary.totalIngredients}
              icon={<Inventory />}
              color={{
                bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', // blue
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Sắp hết"
              value={summary.lowStockCount}
              icon={<Warning />}
              color={{
                bg: 'linear-gradient(135deg, #f97316, #ea580c)', // orange
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Hết hàng"
              value={summary.outOfStockCount}
              icon={<TrendingDown />}
              color={{
                bg: 'linear-gradient(135deg, #ef4444, #dc2626)', // red
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <SummaryCard
              title="Giá trị kho"
              value={(summary.totalInventoryValue / 1_000_000).toFixed(1) + 'M'}
              icon={<AttachMoney />}
              color={{
                bg: 'linear-gradient(135deg, #22c55e, #16a34a)', // green
                iconBg: 'rgba(255,255,255,0.2)',
                iconColor: '#fff',
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* Stock Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <StatTab
          active={stockFilter === 'all'}
          label={`Tất cả`}
          count={ingredients.length}
          color="primary"
          onClick={() => setStockFilter('all')}
        />

        <StatTab
          active={stockFilter === 'inStock'}
          label={`Còn hàng`}
          count={inStockCount}
          color="success"
          onClick={() => setStockFilter('inStock')}
        />

        <StatTab
          active={stockFilter === 'lowStock'}
          label={'Sắp hết'}
          count={lowStockCountActual}
          color="warning"
          onClick={() => setStockFilter('lowStock')}
        />

        <StatTab
          active={stockFilter === 'outOfStock'}
          label={'Hết hàng'}
          count={summary ? summary.outOfStockCount : 0}
          color="error"
          onClick={() => setStockFilter('outOfStock')}
        />
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent>
          <TextField
            fullWidth
            placeholder="Tìm nguyên liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search className="text-gray-400 mr-2" />,
            }}
          />
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {stockFilter === 'all' && lowStockCountActual > 0 && (
        <Alert severity="warning" className="mb-6">
          <strong>Cảnh báo:</strong> Có {lowStockCountActual} nguyên liệu sắp hết. Hãy nhập kho kịp
          thời!
        </Alert>
      )}

      {/* Out of Stock Alert */}
      {stockFilter === 'all' && summary && summary.outOfStockCount > 0 && (
        <Alert severity="error" className="mb-6">
          <strong>Cảnh báo:</strong> Có {summary.outOfStockCount} nguyên liệu đã hết hàng!
        </Alert>
      )}

      {/* Ingredients List */}
      {filteredIngredients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Inventory className="text-gray-300 text-6xl mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              {searchTerm
                ? 'Không tìm thấy nguyên liệu'
                : stockFilter === 'lowStock'
                  ? 'Không có nguyên liệu sắp hết'
                  : stockFilter === 'outOfStock'
                    ? 'Không có nguyên liệu hết hàng'
                    : stockFilter === 'inStock'
                      ? 'Không có nguyên liệu còn hàng'
                      : 'Chưa có nguyên liệu nào'}
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              {searchTerm
                ? 'Thử tìm kiếm với từ khóa khác'
                : stockFilter === 'lowStock'
                  ? 'Tất cả nguyên liệu đều còn đủ'
                  : stockFilter === 'outOfStock'
                    ? 'Tất cả nguyên liệu đều còn trong kho'
                    : stockFilter === 'inStock'
                      ? 'Không có nguyên liệu nào trong trạng thái này'
                      : 'Bắt đầu bằng cách thêm nguyên liệu đầu tiên'}
            </Typography>
            {!searchTerm && stockFilter === 'all' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingIngredient(null);
                  setIngredientDialogOpen(true);
                }}
              >
                Thêm nguyên liệu
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredIngredients.map((ingredient) => {
            const status = getStockStatus(ingredient);
            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={ingredient._id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <Typography variant="h6" className="font-semibold">
                        {ingredient.name}
                      </Typography>
                      <Chip label={status.label} color={status.color} size="small" />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <Typography variant="body2" className="text-gray-600">
                          Tồn kho:
                        </Typography>
                        <Typography variant="h6" className="font-bold">
                          {ingredient.quantity.toLocaleString()} {ingredient.unit}
                        </Typography>
                      </div>

                      <div className="flex justify-between items-center">
                        <Typography variant="body2" className="text-gray-600">
                          Tối thiểu:
                        </Typography>
                        <Typography variant="body2">
                          {ingredient.minQuantity.toLocaleString()} {ingredient.unit}
                        </Typography>
                      </div>

                      <div className="flex justify-between items-center">
                        <Typography variant="body2" className="text-gray-600">
                          Đơn giá:
                        </Typography>
                        <Typography variant="body2">
                          {ingredient.cost.toLocaleString()} ₫/{ingredient.unit}
                        </Typography>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <Typography variant="body2" className="text-gray-600 font-semibold">
                          Giá trị:
                        </Typography>
                        <Typography variant="body1" className="font-bold text-green-600">
                          {(ingredient.quantity * ingredient.cost).toLocaleString()} ₫
                        </Typography>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setAdjustingIngredient(ingredient);
                          setAdjustDialogOpen(true);
                        }}
                        fullWidth
                      >
                        Điều chỉnh
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingIngredient(ingredient);
                          setIngredientDialogOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setDeletingIngredient(ingredient);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Ingredient Dialog */}
      <IngredientDialog
        open={ingredientDialogOpen}
        ingredient={editingIngredient}
        storeId={user?.storeId || ''}
        onClose={() => {
          setIngredientDialogOpen(false);
          setEditingIngredient(null);
        }}
        onSuccess={() => {
          setIngredientDialogOpen(false);
          setEditingIngredient(null);
          fetchData();
        }}
      />

      {/* Stock Adjust Dialog */}
      {adjustingIngredient && (
        <StockAdjustDialog
          open={adjustDialogOpen}
          ingredient={adjustingIngredient}
          onClose={() => {
            setAdjustDialogOpen(false);
            setAdjustingIngredient(null);
          }}
          onSuccess={() => {
            setAdjustDialogOpen(false);
            setAdjustingIngredient(null);
            fetchData();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xóa nguyên liệu"
        message={`Bạn có chắc muốn xóa nguyên liệu "${deletingIngredient?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingIngredient(null);
        }}
      />
    </div>
  );
}

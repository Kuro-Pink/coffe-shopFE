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
  History,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import { inventoryService } from '@/lib/services/inventoryService';
import { Ingredient, InventorySummary } from '@/types';
import IngredientDialog from '@/components/host/InventoryManager/IngredientDialog';
import StockAdjustDialog from '@/components/host/InventoryManager/StockAdjustDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TransactionHistory from '@/components/host/InventoryManager/TransactionHistory';
export default function InventoryManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState<'all' | 'lowStock' | 'transactions'>('all');
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
  }, [ingredients, searchTerm, currentTab]);
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
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((ing) =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Tab filter
    if (currentTab === 'lowStock') {
      filtered = filtered.filter((ing) => ing.quantity <= ing.minQuantity);
    }

    setFilteredIngredients(filtered);
  };
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

      {/* Stats Cards */}
      {summary && (
        <Grid container spacing={3} className="mb-8">
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body2" className="opacity-90 mb-1">
                      Tổng nguyên liệu
                    </Typography>
                    <Typography variant="h3" className="font-bold">
                      {summary.totalIngredients}
                    </Typography>
                  </div>
                  <Inventory className="text-6xl opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body2" className="opacity-90 mb-1">
                      Sắp hết
                    </Typography>
                    <Typography variant="h3" className="font-bold">
                      {summary.lowStockCount}
                    </Typography>
                  </div>
                  <Warning className="text-6xl opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body2" className="opacity-90 mb-1">
                      Hết hàng
                    </Typography>
                    <Typography variant="h3" className="font-bold">
                      {summary.outOfStockCount}
                    </Typography>
                  </div>
                  <TrendingDown className="text-6xl opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body2" className="opacity-90 mb-1">
                      Giá trị kho
                    </Typography>
                    <Typography variant="h3" className="font-bold">
                      {(summary.totalInventoryValue / 1000000).toFixed(1)}M
                    </Typography>
                  </div>
                  <AttachMoney className="text-6xl opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Card className="mb-6">
        <Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)} variant="fullWidth">
          <Tab
            label={
              <div className="flex items-center gap-2">
                <span>Tất cả</span>
                {summary && <Chip label={summary.totalIngredients} size="small" className="h-6" />}
              </div>
            }
            value="all"
          />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <span>Sắp hết</span>
                {summary && summary.lowStockCount > 0 && (
                  <Chip
                    label={summary.lowStockCount}
                    size="small"
                    color="warning"
                    className="h-6"
                  />
                )}
              </div>
            }
            value="lowStock"
          />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <History />
                <span>Lịch sử</span>
              </div>
            }
            value="transactions"
          />
        </Tabs>
      </Card>

      {/* Content */}
      {currentTab === 'transactions' ? (
        <TransactionHistory storeId={user?.storeId || ''} />
      ) : (
        <>
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
          {currentTab === 'all' && summary && summary.lowStockCount > 0 && (
            <Alert severity="warning" className="mb-6">
              <strong>Cảnh báo:</strong> Có {summary.lowStockCount} nguyên liệu sắp hết. Hãy nhập
              kho kịp thời!
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
                    : currentTab === 'lowStock'
                    ? 'Không có nguyên liệu sắp hết'
                    : 'Chưa có nguyên liệu nào'}
                </Typography>
                <Typography variant="body2" className="text-gray-500 mb-4">
                  {searchTerm
                    ? 'Thử tìm kiếm với từ khóa khác'
                    : currentTab === 'lowStock'
                    ? 'Tất cả nguyên liệu đều còn đủ'
                    : 'Bắt đầu bằng cách thêm nguyên liệu đầu tiên'}
                </Typography>
                {!searchTerm && currentTab === 'all' && (
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
        </>
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

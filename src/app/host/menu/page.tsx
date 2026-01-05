'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, Typography, Button, Chip, Box } from '@mui/material';
import { Add, Restaurant, Category as CategoryIcon } from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import { storeService } from '@/lib/services/storeService';
import { Category, Product } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import MenuFilter from '@/components/host/MenuManager/MenuFilter';
import CategoryCard from '@/components/host/MenuManager/CategoryCard';
import { AxiosError } from 'axios';
import CategoryDialog from '@/components/host/MenuManager/CategoryDialog';
import ProductDialog from '@/components/host/MenuManager/ProductDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { showToast } from '@/components/common/Toast';

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function MenuManagementPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = useState(true);

  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    category: Category | null;
  }>({ open: false, category: null });

  const [productDialog, setProductDialog] = useState<{
    open: boolean;
    product: Product | null;
    categoryId?: string;
  }>({ open: false, product: null });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'category' | 'product';
    id: string;
    name: string;
  }>({ open: false, type: 'category', id: '', name: '' });

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user?.storeId) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.storeId) return;
    try {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        storeService.getCategories(user.storeId),
        storeService.getProducts(user.storeId),
      ]);
      
      const sortedCats = cats.sort((a, b) => a.order - b.order);
      setCategories(sortedCats);
      setProducts(prods);

      // Initialize open map
      const mapInit: Record<string, boolean> = {};
      sortedCats.forEach((c) => (mapInit[c._id] = true));
      setOpenMap(mapInit);
      setExpandAll(true);
    } catch (err: unknown) {
      let message = 'Không thể tải dữ liệu menu';
      if (err instanceof AxiosError) {
        const r = err.response?.data as ErrorResponse;
        message = r?.message || r?.error || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by search and status
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const byQuery = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const byStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'available'
          ? p.isAvailable
          : !p.isAvailable;
      return byQuery && byStatus;
    });
  }, [products, searchQuery, statusFilter]);

  // Filter categories by selected category tab
  const displayedCategories = useMemo(() => {
    if (selectedCategory === 'all') {
      return categories;
    }
    return categories.filter((cat) => cat._id === selectedCategory);
  }, [categories, selectedCategory]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    return displayedCategories.reduce<Record<string, Product[]>>((acc, cat) => {
      acc[cat._id] = filteredProducts.filter((p) => {
        // Handle both string and populated object categoryId
        const productCategoryId = typeof p.categoryId === 'object' 
          ? (p.categoryId as { _id: string })._id 
          : p.categoryId;
        return productCategoryId === cat._id;
      });
      return acc;
    }, {});
  }, [displayedCategories, filteredProducts]);

  // Handlers
  const handleToggleExpandAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    const map: Record<string, boolean> = {};
    displayedCategories.forEach((c) => (map[c._id] = next));
    setOpenMap(map);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Auto expand when switching category
    if (categoryId !== 'all') {
      setOpenMap((prev) => ({ ...prev, [categoryId]: true }));
    }
  };

  const handleDeleteCategory = async () => {
    setDeleteLoading(true);
    try {
      await storeService.deleteCategory(confirmDialog.id);
      showToast.success({ message: 'Xóa danh mục thành công!' });
      await fetchData();
      setConfirmDialog({ open: false, type: 'category', id: '', name: '' });
    } catch (err: unknown) {
      let message = 'Xóa danh mục thất bại';
      if (err instanceof AxiosError) {
        const r = err.response?.data as ErrorResponse;
        message = r?.message || r?.error || message;
      }
      showToast.error({ message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    setDeleteLoading(true);
    try {
      await storeService.deleteProduct(confirmDialog.id);
      showToast.success({ message: 'Xóa sản phẩm thành công!' });
      await fetchData();
      setConfirmDialog({ open: false, type: 'product', id: '', name: '' });
    } catch (err: unknown) {
      let message = 'Xóa sản phẩm thất bại';
      if (err instanceof AxiosError) {
        const r = err.response?.data as ErrorResponse;
        message = r?.message || r?.error || message;
      }
      showToast.error({ message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleAvailability = async (productId: string) => {
    setToggleLoading(productId);
    try {
      await storeService.toggleProductAvailability(productId);
      showToast.success({ message: 'Cập nhật trạng thái thành công!' });
      await fetchData();
    } catch (err: unknown) {
      let message = 'Cập nhật trạng thái thất bại';
      if (err instanceof AxiosError) {
        const r = err.response?.data as ErrorResponse;
        message = r?.message || r?.error || message;
      }
      showToast.error({ message });
    } finally {
      setToggleLoading(null);
    }
  };

  const handleOpenDeleteConfirm = (type: 'category' | 'product', id: string, name: string) => {
    setConfirmDialog({ open: true, type, id, name });
  };

  if (!user?.storeId) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-12">
          <Typography variant="h6" className="text-gray-800 mb-2">
            Bạn chưa được gán cửa hàng
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Vui lòng liên hệ Admin để được gán cửa hàng
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-1">
            Quản lý Menu
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Quản lý danh mục và sản phẩm theo dạng accordion
          </Typography>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Chip
            icon={<CategoryIcon />}
            label={`${categories.length} danh mục`}
            className="bg-blue-50 text-blue-600"
          />
          <Chip
            icon={<Restaurant />}
            label={`${products.length} sản phẩm`}
            className="bg-green-50 text-green-600"
          />
        </div>
      </div>

      {/* Filter Bar with Category Tabs */}
      <Card className="p-4 mb-6 shadow-sm">
        <MenuFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          expandAll={expandAll}
          onToggleExpandAll={handleToggleExpandAll}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCategoryDialog({ open: true, category: null })}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Thêm danh mục
        </Button>
      </div>

      {/* Categories Accordion List */}
      {categories.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <Typography variant="h6" className="text-gray-800 mb-2">
              Chưa có danh mục nào
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              Tạo danh mục đầu tiên để bắt đầu thêm món ăn
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCategoryDialog({ open: true, category: null })}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Tạo danh mục
            </Button>
          </CardContent>
        </Card>
      ) : displayedCategories.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <Typography variant="h6" className="text-gray-800 mb-2">
              Không tìm thấy danh mục
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Thử thay đổi bộ lọc hoặc tìm kiếm khác
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedCategories.map((cat) => (
            <CategoryCard
              key={cat._id}
              category={cat}
              products={productsByCategory[cat._id] || []}
              isOpen={!!openMap[cat._id]}
              onToggle={() => setOpenMap((m) => ({ ...m, [cat._id]: !m[cat._id] }))}
              onEditCategory={(category) => setCategoryDialog({ open: true, category })}
              onDeleteCategory={(categoryId, categoryName) => 
                handleOpenDeleteConfirm('category', categoryId, categoryName)
              }
              onAddProduct={(categoryId) =>
                setProductDialog({ open: true, product: null, categoryId })
              }
              onEditProduct={(product) => setProductDialog({ open: true, product })}
              onDeleteProduct={(productId, productName) => 
                handleOpenDeleteConfirm('product', productId, productName)
              }
              onToggleProductAvailability={handleToggleAvailability}
              toggleLoadingProductId={toggleLoading}
            />
          ))}
        </div>
      )}

      {/* ===== CATEGORY ADD / EDIT DIALOG ===== */}
      <CategoryDialog
        open={categoryDialog.open}
        category={categoryDialog.category}
        storeId={user.storeId}
        onClose={() => setCategoryDialog({ open: false, category: null })}
        onSuccess={async () => {
          await fetchData();
          setCategoryDialog({ open: false, category: null });
        }}
      />

      {/* ===== PRODUCT ADD / EDIT DIALOG ===== */}
      <ProductDialog
        open={productDialog.open}
        product={productDialog.product}
        categories={categories}
        storeId={user.storeId}
        defaultCategoryId={productDialog.categoryId}
        onClose={() => setProductDialog({ open: false, product: null })}
        onSuccess={async () => {
          await fetchData();
          setProductDialog({ open: false, product: null });
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={`Xác nhận xóa ${confirmDialog.type === 'category' ? 'danh mục' : 'sản phẩm'}`}
        message={
          confirmDialog.type === 'category'
            ? `Bạn có chắc muốn xóa danh mục "${confirmDialog.name}"? Tất cả sản phẩm trong danh mục có thể bị ảnh hưởng.`
            : `Bạn có chắc muốn xóa sản phẩm "${confirmDialog.name}"?`
        }
        variant="danger"
        confirmText="Xóa"
        cancelText="Hủy"
        loading={deleteLoading}
        onConfirm={
          confirmDialog.type === 'category' 
            ? handleDeleteCategory 
            : handleDeleteProduct
        }
        onCancel={() => setConfirmDialog({ open: false, type: 'category', id: '', name: '' })}
      />
    </Box>
  );
}
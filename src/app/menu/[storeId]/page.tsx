'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  Fab,
  Badge,
  Chip,
} from '@mui/material';
import { ShoppingCart, LocalFireDepartment, TrendingUp } from '@mui/icons-material';
import { publicService } from '@/lib/services/publicService';
import { useCartStore } from '@/lib/stores/cartStore';
import { Category, Product } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ProductCard from '@/components/customer/ProductCard';
import Cart from '@/components/customer/Cart';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  error?: string;
}

interface MenuCategory extends Category {
  products: Product[];
}

interface MenuResponse {
  categories: MenuCategory[];
  store: {
    name: string;
  };
}


export default function CustomerMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.storeId as string;
  const tableId = searchParams.get('table');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [tableInfo, setTableInfo] = useState<{ tableNumber: string; area: string } | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartOpen, setCartOpen] = useState(false);

  const { items, getTotalItems, setTable } = useCartStore();

  useEffect(() => {
    fetchData();
  }, [storeId, tableId]);

  const fetchData = async () => {
  try {
    setLoading(true);

    const menuData: MenuResponse = await publicService.getMenu(storeId);

    const categories = menuData.categories.sort(
      (a, b) => a.order - b.order
    );

    const products = categories.flatMap(category =>
      category.products.map(product => ({
        ...product,
        categoryId: category._id,
      }))
    );

    setCategories(categories);
    setProducts(products.filter(p => p.isAvailable));
    setBestSellers(products.filter(p => p.isAvailable).slice(0, 6));
    setStoreName(menuData.store?.name || 'Menu');

  } catch (err) {
    setError('Không thể tải menu');
  } finally {
    setLoading(false);
  }
};


  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Simple Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-6 px-4 shadow-lg sticky top-0 z-20">
        <Container maxWidth="lg">
          <Typography variant="h5" className="font-bold text-center mb-1">
            {storeName}
          </Typography>
          {tableInfo && (
            <Typography variant="body2" className="text-center text-green-100">
              Bàn {tableInfo.tableNumber} • {tableInfo.area}
            </Typography>
          )}
        </Container>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <Box className="bg-white border-b border-gray-200 sticky top-20 z-10 shadow-sm z-9999">
          <Container maxWidth="lg">
            <Tabs
              value={selectedCategory}
              onChange={(_, value) => setSelectedCategory(value)}
              variant="scrollable"
              scrollButtons="auto"
              className="py-2"
            >
              <Tab label="Tất cả" value="all" />
              {categories.map((category) => (
                <Tab key={category._id} label={category.name} value={category._id} />
              ))}
            </Tabs>
          </Container>
        </Box>
      )}

      <Container maxWidth="lg" className="py-6">
        {/* ✅ Best Sellers Section */}
        {bestSellers.length > 0 && selectedCategory === 'all' && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <LocalFireDepartment className="text-white" />
              </div>
              <div className="flex-1">
                <Typography variant="h6" className="font-bold text-gray-800">
                  🔥 Món bán chạy
                </Typography>
                <Typography variant="caption" className="text-gray-600">
                  Những món được yêu thích nhất
                </Typography>
              </div>
              <Chip
                icon={<TrendingUp fontSize="small" />}
                label="Hot"
                size="small"
                className="bg-orange-50 text-orange-600 font-semibold animate-pulse"
              />
            </div>

            {/* Best Sellers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} isBestSeller />
              ))}
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 px-4 text-sm text-gray-500 font-semibold">
                  Tất cả món ăn
                </span>
              </div>
            </div>
          </div>
        )}

        {/* All Products Grid */}
        {filteredProducts.length === 0 ? (
          <Box className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Typography variant="h1">🍽️</Typography>
            </div>
            <Typography variant="h6" className="text-gray-800 mb-2">
              Chưa có món ăn nào
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Menu đang được cập nhật
            </Typography>
          </Box>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </Container>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <Fab
          color="primary"
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-2xl"
          onClick={() => setCartOpen(true)}
          sx={{ width: 64, height: 64 }}
        >
          <Badge badgeContent={getTotalItems()} color="error">
            <ShoppingCart sx={{ fontSize: 32 }} />
          </Badge>
        </Fab>
      )}

      {/* Cart Drawer */}
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
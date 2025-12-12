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
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
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

export default function CustomerMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.storeId as string;
  const tableId = searchParams.get('table');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tableInfo, setTableInfo] = useState<{ tableNumber: string; area: string } | null>(null);
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

      // Fetch menu
      const menuData = await publicService.getMenu(storeId);
      
      // 🔍 DEBUG: In ra structure của menuData
      console.log('📦 menuData:', menuData);
      console.log('📂 menuData.categories:', menuData.categories);
      console.log('📦 menuData.products:', menuData.products);

      // Check if menuData has the expected structure
      if (!menuData) {
        throw new Error('Menu data is empty');
      }

      // Handle different API response structures
      if (Array.isArray(menuData.categories)) {
        setCategories(menuData.categories);
        
        // Check if products are nested in categories or separate
        if (menuData.categories[0]?.products) {
          // Structure 1: Products nested in categories
          console.log('✅ Structure 1: Products nested in categories');
          setProducts(
            menuData.categories.flatMap(c =>
              c.products.map(p => ({ 
                ...p, 
                categoryId: c._id
              }))
            )
          );
        } else if (Array.isArray(menuData.products)) {
          // Structure 2: Products separate array
          console.log('✅ Structure 2: Products in separate array');
          setProducts(menuData.products);
        } else {
          console.warn('⚠️ Unknown structure, no products found');
          setProducts([]);
        }
      } else {
        console.error('❌ Invalid menuData structure');
        throw new Error('Invalid menu data structure');
      }

      // Fetch table info if tableId exists
      if (tableId) {
        const table = await publicService.getTableInfo(tableId);
        setTableInfo({
          tableNumber: table.tableNumber,
          area: table.area,
        });
        setTable(tableId, storeId);
      }
    } catch (err: unknown) {
      console.error('❌ Error fetching data:', err);
      let errorMessage = 'Không thể tải menu';
      if (err instanceof AxiosError) {
        console.error('Axios Error Response:', err.response?.data);
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? products.filter((p) => p.isAvailable)
      : products.filter((p) => {
          // Handle both string and object categoryId
          const productCategoryId = typeof p.categoryId === 'object'
            ? (p.categoryId as { _id: string })._id
            : p.categoryId;
          return productCategoryId === selectedCategory && p.isAvailable;
        });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container className="py-8">
        <ErrorMessage message={error} />
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 z-20">
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'transparent !important',
            boxShadow: 'none',
          }}
          className="!bg-gradient-to-r !from-teal-600 !to-green-600"
        >
          <Toolbar className="flex flex-col py-3">
            <Typography variant="h6" className="font-bold text-white">
              Menu
            </Typography>

            {tableInfo && (
              <Typography variant="caption" className="text-green-100">
                Bàn {tableInfo.tableNumber} - {tableInfo.area}
              </Typography>
            )}
          </Toolbar>
        </AppBar>

        {/* CATEGORY TABS */}
        {categories.length > 0 && (
          <Box className="bg-white border-b border-gray-200">
            <Container disableGutters={false}>
              <Tabs
                value={selectedCategory}
                onChange={(_, value) => setSelectedCategory(value)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Tất cả" value="all" />
                {categories
                  .sort((a, b) => a.order - b.order)
                  .map((category) => (
                    <Tab key={category._id} label={category.name} value={category._id} />
                  ))}
              </Tabs>
            </Container>
          </Box>
        )}
      </div>

      {/* Products Grid */}
      <Container className="py-6">
        {filteredProducts.length === 0 ? (
          <Box className="text-center py-12">
            <Typography variant="h6" className="text-gray-800 mb-2">
              Chưa có sản phẩm nào
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Menu đang được cập nhật
            </Typography>
          </Box>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          onClick={() => setCartOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 36,
            zIndex: 9999,
            background: 'linear-gradient(to right, #16a34a, #14b8a6)',
          }}
        >
          <Badge badgeContent={getTotalItems()} color="error">
            <ShoppingCart />
          </Badge>
        </Fab>
      )}

      {/* Cart Drawer */}
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
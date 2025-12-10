'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Chip,
} from '@mui/material';
import { Add, Restaurant, Category as CategoryIcon } from '@mui/icons-material';
import { useAuthStore } from '@/lib/stores/authStore';
import { storeService } from '@/lib/services/storeService';
import { Category, Product } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import CategoryManager from '@/components/host/MenuManager/CategoryManager';
import ProductManager from '@/components/host/MenuManager/ProductManager';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function MenuManagementPage() {
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (user?.storeId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        storeService.getCategories(user.storeId),
        storeService.getProducts(user.storeId),
      ]);
    
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (err: unknown) {
      let errorMessage = 'Không thể tải dữ liệu menu';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Quản lý Menu
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Quản lý danh mục và sản phẩm của cửa hàng
          </Typography>
        </div>

        <div className="flex gap-2">
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

      {error && <ErrorMessage message={error} />}

      {/* Tabs */}
      <Card className="shadow-lg border-0 mb-6">
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          className="border-b border-gray-200"
        >
          <Tab label="Danh mục" icon={<CategoryIcon />} iconPosition="start" />
          <Tab label="Sản phẩm" icon={<Restaurant />} iconPosition="start" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && (
          <CategoryManager
            categories={categories}
            onRefresh={fetchData}
            storeId={user.storeId}
          />
        )}
        {tabValue === 1 && (
          <ProductManager
            products={products}
            categories={categories}
            onRefresh={fetchData}
            storeId={user.storeId}
          />
        )}
      </Box>
    </div>
  );
}
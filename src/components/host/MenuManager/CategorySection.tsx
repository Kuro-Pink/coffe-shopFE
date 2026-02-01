'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Collapse,
  Divider,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Edit,
  Delete,
  Add,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Cancel,
  Restaurant,
} from '@mui/icons-material';
import { Category, Product } from '@/types';
import ProductRow from '@/components/host/MenuManager/ProductRow';

// THAY THẾ interface CategoryCardProps:
interface CategoryCardProps {
  category: Category;
  products: Product[];
  isOpen: boolean;
  onToggle: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string, categoryName: string) => void;
  onAddProduct: (categoryId: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string, productName: string) => void;
  onToggleProductAvailability: (productId: string) => void;
  toggleLoadingProductId?: string | null;
}

export default function CategoryCard({
  category,
  products,
  isOpen,
  onToggle,
  onEditCategory,
  onDeleteCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductAvailability,
  toggleLoadingProductId,
}: CategoryCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
        <div className="flex items-center gap-3">
          <CategoryIcon className="text-blue-600" />
          <Typography className="font-semibold">{category.name}</Typography>
          <Chip size="small" label={`${products.length} món`} />
        </div>

        <div className="flex items-center gap-2">
          <IconButton onClick={onToggle}>{isOpen ? <ExpandLess /> : <ExpandMore />}</IconButton>

          <IconButton color="primary" onClick={() => onAddProduct(category._id)}>
            <Add />
          </IconButton>
          <IconButton color="inherit" onClick={() => onEditCategory(category)}>
            <Edit />
          </IconButton>

          <IconButton color="error" onClick={() => onDeleteCategory(category._id, category.name)}>
            <Delete />
          </IconButton>
        </div>
      </div>

      {/* PRODUCTS */}
      <Collapse in={isOpen}>
        <Divider />
        <div className="bg-white rounded-xl border divide-y">
          {products.map((product) => (
            <ProductRow
              key={product._id}
              product={product}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onToggleAvailability={onToggleProductAvailability}
              loading={toggleLoadingProductId === product._id}
            />
          ))}
        </div>

        <div className="p-3">
          <Button fullWidth startIcon={<Add />} onClick={() => onAddProduct(category._id)}>
            Thêm sản phẩm
          </Button>
        </div>
      </Collapse>
    </Card>
  );
}

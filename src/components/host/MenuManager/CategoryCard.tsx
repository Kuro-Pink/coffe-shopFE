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
    <Card className="shadow-md border-0 overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start md:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="bg-gradient-to-br from-blue-500 to-purple-600 w-14 h-14">
              <CategoryIcon />
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Typography variant="h6" className="font-semibold">
                  {category.name}
                </Typography>
                <Chip size="small" label={`${products.length} món`} className="bg-gray-100" />
                <Chip size="small" label={`Thứ tự: #${category.order}`} variant="outlined" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="small"
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => onEditCategory(category)}
            >
              Sửa
            </Button>

            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => onDeleteCategory(category._id, category.name)}
              startIcon={<Delete />}
            >
              Xóa
            </Button>

            <Button
              size="small"
              variant="contained"
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              onClick={onToggle}
              endIcon={isOpen ? <ExpandLess /> : <ExpandMore />}
            >
              {isOpen ? 'Thu gọn' : 'Xem'}
            </Button>
          </div>
        </div>

        {/* Collapse Products */}
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Divider className="my-4" />

          <div className="flex justify-between items-center mb-3">
            <Typography variant="subtitle1" className="font-semibold">
              Sản phẩm trong danh mục
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={() => onAddProduct(category._id)}
              className="bg-gradient-to-r from-green-600 to-teal-600"
            >
              Thêm sản phẩm
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              <Typography variant="body2">Chưa có sản phẩm nào</Typography>
            </div>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
                  <Card className="h-full hover:shadow-lg transition-all">
                    <CardContent className="p-3">
                      {/* Image */}
                      <div className="relative mb-3">
                        <Avatar
                          src={product.image}
                          variant="rounded"
                          className="w-full h-36 rounded-lg"
                        >
                          <Restaurant className="text-4xl" />
                        </Avatar>
                        {!product.isAvailable && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                            Hết hàng
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <Typography variant="subtitle2" className="font-semibold line-clamp-2 mb-1">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500 line-clamp-2 mb-2">
                        {product.description}
                      </Typography>
                      <Typography variant="h6" className="text-green-600 font-bold mb-3">
                        {product.price.toLocaleString('vi-VN')} ₫
                      </Typography>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => onEditProduct(product)}
                          className="flex-1"
                        >
                          Sửa
                        </Button>
                        
                        <IconButton
                          size="small"
                          color={product.isAvailable ? 'success' : 'error'}
                          onClick={() => onToggleProductAvailability(product._id)}
                          disabled={toggleLoadingProductId === product._id}
                        >
                          {toggleLoadingProductId === product._id ? (
                            <CircularProgress size={20} />
                          ) : product.isAvailable ? (
                            <CheckCircle />
                          ) : (
                            <Cancel />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteProduct(product._id, product.name)}
                        >
                          <Delete />
                        </IconButton>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
}
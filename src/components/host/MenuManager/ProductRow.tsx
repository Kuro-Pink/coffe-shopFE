'use client';

import React from 'react';
import {
  Avatar,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Restaurant,
} from '@mui/icons-material';
import { Product } from '@/types';


/* ===================== TYPES ===================== */

export interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string, productName: string) => void;
  onToggleAvailability: (productId: string) => void;
  loading?: boolean;
}

/* ===================== COMPONENT ===================== */

export default function ProductRow({
  product,
  loading = false,
  onEdit,
  onDelete,
  onToggleAvailability,
}: ProductRowProps) {
  return (
    <div
      className="
        flex items-center gap-3 px-4 py-3
        transition-colors
        hover:bg-gray-50
      "
    >
      {/* ===== IMAGE ===== */}
      <Avatar
        src={product.image}
        variant="rounded"
        sx={{ width: 56, height: 56 }}
      >
        <Restaurant />
      </Avatar>

      {/* ===== INFO ===== */}
      <div className="flex-1 min-w-0">
        <Typography
          variant="subtitle1"
          className="font-medium truncate"
        >
          {product.name}
        </Typography>

        {product.description && (
          <Typography
            variant="body2"
            className="text-gray-500 truncate"
          >
            {product.description}
          </Typography>
        )}
      </div>

      {/* ===== PRICE ===== */}
      <Typography
        variant="subtitle1"
        className="font-semibold text-green-600 w-[110px] text-right"
      >
        {product.price.toLocaleString()} ₫
      </Typography>

      {/* ===== STATUS ===== */}
      <Chip
        size="small"
        label={product.isAvailable ? 'Đang bán' : 'Tạm ẩn'}
        color={product.isAvailable ? 'success' : 'default'}
        sx={{ minWidth: 90 }}
      />

      {/* ===== ACTIONS ===== */}
      <div className="flex items-center gap-1">
        {/* EDIT */}
        <Tooltip title="Chỉnh sửa">
          <IconButton
            size="small"
            onClick={() => onEdit(product)}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* TOGGLE AVAILABILITY */}
        <Tooltip
          title={product.isAvailable ? 'Ẩn sản phẩm' : 'Bán lại'}
        >
          <IconButton
            size="small"
            onClick={() => onToggleAvailability(product._id)}
            disabled={loading}
            color={product.isAvailable ? 'success' : 'default'}
          >
            {loading ? (
              <CircularProgress size={18} />
            ) : product.isAvailable ? (
              <CheckCircle fontSize="small" />
            ) : (
              <Cancel fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* DELETE */}
        <Tooltip title="Xóa sản phẩm">
          <IconButton
            size="small"
            color="error"
            onClick={() =>
              onDelete(product._id, product.name)
            }
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

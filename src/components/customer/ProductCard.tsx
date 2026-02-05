'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import { Add, Remove, AddShoppingCart } from '@mui/icons-material';
import { Product } from '@/types';
import { useCartStore } from '@/lib/stores/cartStore';

interface ProductCardProps {
  product: Product;
  isBestSeller?: boolean;
  highlight?: boolean;
}

export default function ProductCard({
  product,
  isBestSeller = false,
  highlight = false,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const { addItem } = useCartStore();

  const originalPrice = product.originalPrice ?? product.price ?? product.finalPrice ?? 0;

  const finalPrice = product.finalPrice ?? product.originalPrice ?? product.price ?? 0;

  const hasDiscount = originalPrice > finalPrice;

  const handleAddToCart = () => {
    const original = product.originalPrice ?? product.finalPrice ?? 0;
    const final = product.finalPrice ?? product.originalPrice ?? 0;

    addItem({
      productId: product._id,
      storeId: product.storeId,
      name: product.name,
      quantity,

      // QUAN TRỌNG
      price: original,
      originalPrice: original,
      finalPrice: final,

      hasDiscount: original > final,
      discountAmount: original - final,
      discountPercent: original > 0 ? Math.round(((original - final) / original) * 100) : 0,

      image: product.image,
    });

    setQuantity(1);
    setDetailOpen(false);
  };

  return (
    <>
      <Card
        className={`
    hover:shadow-xl transition-all duration-300 cursor-pointer border
    ${highlight ? 'border-orange-500 shadow-orange-200 shadow-lg scale-[1.02]' : 'border-gray-200'}
  `}
        onClick={() => setDetailOpen(true)}
      >
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            {/* ✅ Best Seller Badge */}
            {isBestSeller && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10 animate-pulse">
                🔥 HOT
              </div>
            )}

            {product.image ? (
              <>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {hasDiscount && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md z-10">
                    Giảm giá
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                <Typography variant="h2" className="text-green-300">
                  🍽️
                </Typography>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <Typography variant="h6" className="font-bold text-gray-800 mb-2 line-clamp-1">
              {product.name}
            </Typography>

            <Typography variant="body2" className="text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </Typography>

            <div className="flex items-center justify-between">
              {/* PRICE BLOCK */}
              <div className="flex flex-col">
                {hasDiscount ? (
                  <>
                    <Typography variant="body2" className="text-gray-400 line-through font-medium">
                      {originalPrice.toLocaleString('vi-VN')} ₫
                    </Typography>

                    <div className="flex items-center gap-2">
                      <Typography variant="h6" className="text-red-600 font-bold">
                        {finalPrice.toLocaleString('vi-VN')} ₫
                      </Typography>

                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                        -{Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}%
                      </span>
                    </div>
                  </>
                ) : (
                  <Typography variant="h6" className="text-green-600 font-bold">
                    {finalPrice.toLocaleString('vi-VN')} ₫
                  </Typography>
                )}
              </div>

              <Button
                variant="contained"
                size="small"
                startIcon={<AddShoppingCart />}
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailOpen(true);
                }}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                Thêm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          {/* Image */}
          <Avatar
            src={product.image}
            variant="rounded"
            className="w-full h-64 mb-4"
            sx={{ borderRadius: 2 }}
          >
            <Typography variant="h1">🍽️</Typography>
          </Avatar>

          {/* Info */}
          <Typography variant="h5" className="font-bold text-gray-800 mb-3">
            {product.name}
          </Typography>

          <Typography variant="body1" className="text-gray-600 mb-4">
            {product.description}
          </Typography>

          <div className="mb-6">
            {hasDiscount ? (
              <>
                <Typography className="line-through text-gray-400">
                  {product.originalPrice.toLocaleString('vi-VN')} ₫
                </Typography>
                <Typography variant="h5" className="text-red-600 font-bold">
                  {product.finalPrice.toLocaleString('vi-VN')} ₫
                </Typography>
              </>
            ) : (
              <Typography variant="h5" className="text-green-600 font-bold">
                {product.finalPrice.toLocaleString('vi-VN')} ₫
              </Typography>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <IconButton
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="border border-gray-300"
            >
              <Remove />
            </IconButton>

            <Typography variant="h5" className="font-bold min-w-12 text-center">
              {quantity}
            </Typography>

            <IconButton
              onClick={() => setQuantity(quantity + 1)}
              className="border border-gray-300"
            >
              <Add />
            </IconButton>
          </div>

          {/* Total */}
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <Typography variant="body1" className="text-gray-700">
                Tạm tính:
              </Typography>
              <Typography variant="h6" className="text-green-600 font-bold">
                {(product.finalPrice * quantity).toLocaleString('vi-VN')} ₫
              </Typography>
            </div>
          </div>
        </DialogContent>

        <DialogActions className="px-6 pb-6">
          <Button onClick={() => setDetailOpen(false)} className="flex-1">
            Đóng
          </Button>
          <Button
            variant="contained"
            onClick={handleAddToCart}
            startIcon={<AddShoppingCart />}
            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            Thêm vào giỏ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

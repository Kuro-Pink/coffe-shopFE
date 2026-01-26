'use client';

import { useState } from 'react';
import {
  Drawer,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  Avatar,
  Box,
} from '@mui/material';
import { Close, Add, Remove, Delete, ShoppingCart } from '@mui/icons-material';
import { useCartStore } from '@/lib/stores/cartStore';
import CheckoutModal from './CheckoutModal';
import ComboSuggestion from './ComboSuggestion';

interface CartProps {
  open: boolean;
  onClose: () => void;
}

export default function Cart({ open, onClose }: CartProps) {
  const getCurrentItems = useCartStore((state) => state.getCurrentItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const currentStoreId = useCartStore((state) => state.currentStoreId);

  // Get items from current table
  const items = getCurrentItems();

  // Auto update when items change
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    console.log('🎉 Order success - Clearing cart...');
    setCheckoutOpen(false);
    clearCart(); // ✅ Clear cart của bàn hiện tại
    onClose(); // Close drawer
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } },
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-green-600" />
              <Typography variant="h6" className="font-bold">
                Giỏ hàng ({items.length})
              </Typography>
            </div>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <Box className="text-center py-12 px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="text-gray-400 text-5xl" />
                </div>
                <Typography variant="h6" className="text-gray-800 mb-2">
                  Giỏ hàng trống
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Hãy thêm món vào giỏ hàng
                </Typography>
              </Box>
            ) : (
              <List className="p-4">
                {items.map((item) => (
                  <div key={item.productId}>
                    <ListItem className="border border-gray-200 rounded-lg mb-2 p-3">
                      <div className="flex gap-3 w-full">
                        {/* Image */}
                        <Avatar src={item.image} variant="rounded" className="w-20 h-20">
                          🍽️
                        </Avatar>
                        {/* Info */}
                        <div className="flex-1">
                          <Typography variant="body1" className="font-semibold mb-1">
                            {item.name}
                          </Typography>
                          <Typography variant="body2" className="text-green-600 font-bold mb-2">
                            {item.price.toLocaleString('vi-VN')} ₫
                          </Typography>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                              }
                              className="border border-gray-300"
                            >
                              <Remove fontSize="small" />
                            </IconButton>

                            <Typography className="font-bold min-w-8 text-center">
                              {item.quantity}
                            </Typography>

                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="border border-gray-300"
                            >
                              <Add fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeItem(item.productId)}
                              className="ml-auto"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    </ListItem>
                    {item.quantity > 0 && currentStoreId && (
                      <ComboSuggestion
                        key={`combo-${item.productId}`} // 👈 ép React unmount khi item biến mất
                        storeId={currentStoreId}
                        baseProductId={item.productId}
                      />
                    )}
                  </div>
                ))}
              </List>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-bold">
                  Tổng cộng:
                </Typography>
                <Typography variant="h5" className="text-green-600 font-bold">
                  {totalAmount.toLocaleString('vi-VN')} ₫
                </Typography>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCheckout}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 font-bold"
                >
                  Đặt hàng
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    if (confirm('Xóa tất cả món trong giỏ?')) {
                      clearCart();
                    }
                  }}
                  color="error"
                >
                  Xóa giỏ hàng
                </Button>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleOrderSuccess}
      />
    </>
  );
}

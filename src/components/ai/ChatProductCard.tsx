'use client';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { useCartStore } from '@/lib/stores/cartStore';

interface Props {
  productId: string;
  name: string;

  price: number; // fallback
  originalPrice?: number;
  finalPrice?: number;
  discountAmount?: number;

  image?: string;
  storeId: string;
  onAddedToCart?: (productId: string, name: string) => void;
}

export default function ChatProductCard({
  productId,
  name,
  price,
  originalPrice,
  finalPrice,
  discountAmount,
  image,
  storeId,
  onAddedToCart,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const original = originalPrice ?? price;
  const final = finalPrice ?? price;
  const hasDiscount = original > final;
  console.log('original', original);
  console.log('final', final);
  console.log('hasDiscount', hasDiscount);
  console.log('FULL PRODUCT', {
    productId,
    name,
    price,
    originalPrice,
    finalPrice,
    discountAmount,
  });

  const handleAdd = () => {
    addItem({
      productId,
      storeId,
      name,
      price: finalPrice ?? price,
      originalPrice: originalPrice ?? price,
      finalPrice: finalPrice ?? price,
      discountAmount: discountAmount ?? 0,
      quantity: 1,
      image,
    });

    // 🔔 Báo cho AI biết vừa thêm món
    onAddedToCart?.(productId, name);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      p={1}
      border="1px solid #e2e8f0"
      borderRadius={2}
      mb={1}
      bgcolor="#fff"
    >
      <Avatar src={image} variant="rounded" sx={{ width: 48, height: 48 }} />

      <Box flex={1}>
        <Typography fontSize={14} fontWeight={600}>
          {name}
        </Typography>
        {/* PRICE BLOCK */}
        <Box display="flex" flexDirection="column">
          {hasDiscount ? (
            <>
              <Typography fontSize={12} color="gray" sx={{ textDecoration: 'line-through' }}>
                {original.toLocaleString('vi-VN')} ₫
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontSize={14} color="red" fontWeight={600}>
                  {final.toLocaleString('vi-VN')} ₫
                </Typography>

                <Box
                  px={0.8}
                  py={0.2}
                  borderRadius={1}
                  bgcolor="#fee2e2"
                  color="#dc2626"
                  fontSize={11}
                  fontWeight={600}
                >
                  -{Math.round(((original - final) / original) * 100)}%
                </Box>
              </Box>
            </>
          ) : (
            <Typography fontSize={14} color="green" fontWeight={600}>
              {final.toLocaleString('vi-VN')} ₫
            </Typography>
          )}
        </Box>
      </Box>

      <Button size="small" variant="contained" onClick={handleAdd}>
        Thêm
      </Button>
    </Box>
  );
}

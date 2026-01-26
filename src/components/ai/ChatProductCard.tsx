'use client';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { useCartStore } from '@/lib/stores/cartStore';

interface Props {
  productId: string;
  name: string;
  price: number;
  image?: string;
  storeId: string;
}

export default function ChatProductCard({ productId, name, price, image, storeId }: Props) {
  const addItem = useCartStore((s) => s.addItem);

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
        <Typography fontSize={13} color="green">
          {price.toLocaleString('vi-VN')} ₫
        </Typography>
      </Box>

      <Button
        size="small"
        variant="contained"
        onClick={() =>
          addItem({
            productId,
            storeId,
            name,
            price,
            quantity: 1,
            image,
          })
        }
      >
        Thêm
      </Button>
    </Box>
  );
}

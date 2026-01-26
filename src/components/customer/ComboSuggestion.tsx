'use client';

import { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Avatar, ListItem } from '@mui/material';
import { aiService } from '@/lib/services/aiService';
import { useCartStore } from '@/lib/stores/cartStore';

interface Props {
  storeId: string;
  baseProductId: string;
}

interface SuggestedProduct {
  productId: string;
  name: string;
  price: number;
  image?: string;
}

export default function ComboSuggestion({ storeId, baseProductId }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const comboCache = useRef<Record<string, SuggestedProduct[]>>({});

  useEffect(() => {
    if (!storeId || !baseProductId) return;

    const controller = new AbortController();
    let isMounted = true; // tránh setState sau khi unmount

    const fetchCombo = async () => {
      setLoading(true);

      if (comboCache.current[baseProductId]) {
        setProducts(comboCache.current[baseProductId]);
        return;
      }

      const res = await aiService.recommendCombo(storeId, baseProductId, controller.signal);

      if (!isMounted) return; // 👈 component đã unmount

      if (!res) {
        setProducts([]);
        setLoading(false);
        return;
      }
      if (res?.combo) {
        const data = [
          {
            productId: res.combo.productId,
            name: res.combo.name,
            price: res.combo.price,
            image: res.combo.image,
          },
        ];

        comboCache.current[baseProductId] = data;
        setProducts(data);
      }

      setLoading(false);
    };

    fetchCombo();

    return () => {
      isMounted = false;
      controller.abort(); // 🧨 HỦY REQUEST CŨ
    };
  }, [storeId, baseProductId]);

  if (loading || products.length === 0 || added) return null;

  return (
    <Box mt={1} pl={1} borderLeft="3px solid #22c55e">
      <Typography fontSize={13} fontWeight={600} color="#16a34a" mb={0.5}>
        Hay dùng kèm 👇
      </Typography>

      {products.map((p) => (
        <Box
          key={p.productId}
          display="flex"
          alignItems="center"
          gap={1}
          mb={0.5}
          sx={{ opacity: 0.85 }}
        >
          <ListItem className="border border-gray-200 rounded-lg mb-2 p-3">
            <div className="flex gap-3 w-full">
              {/* Image */}
              <Avatar src={p.image} variant="rounded" className="w-20 h-20">
                🍽️
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <Typography variant="body1" className="font-semibold mb-1">
                  {p.name}
                </Typography>
                <Typography variant="body2" className="text-green-600 font-bold mb-2">
                  {p.price.toLocaleString('vi-VN')} ₫
                </Typography>
              </div>
            </div>
          </ListItem>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              addItem({
                productId: p.productId,
                storeId,
                name: p.name,
                price: p.price,
                quantity: 1,
                image: p.image,
              });

              setAdded(true); // 👈 ẨN LUÔN SAU KHI THÊM
            }}
          >
            Thêm
          </Button>
        </Box>
      ))}
    </Box>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Avatar, ListItem, Chip } from '@mui/material';
import { aiService } from '@/lib/services/aiService';
import { useCartStore } from '@/lib/stores/cartStore';

interface Props {
  storeId: string;
  productIds: string[];
}

interface SuggestedProduct {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  finalPrice?: number;
  discountAmount?: number;
  image?: string;
  reason?: string;
  popularity?: number;
}

export default function ComboSuggestion({ storeId, productIds }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const cartIds = useCartStore((s) => s.items)?.map((i) => i.productId) ?? [];

  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const comboCache = useRef<Record<string, SuggestedProduct[]>>({});

  useEffect(() => {
    if (!storeId || productIds.length === 0) return;

    const fetchCombo = async () => {
      setLoading(true);

      const res = await aiService.recommendCartCombo(storeId, productIds);

      if (!res?.combos?.length) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setProducts(res.combos.slice(0, 2));
      setLoading(false);
    };

    fetchCombo();
  }, [storeId, productIds]);

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
          sx={{ opacity: 0.9 }}
        >
          <ListItem className="border border-gray-200 rounded-lg mb-2 p-3 w-full">
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

                {/* PRICE BLOCK – GIỐNG CART */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Giá gốc */}
                  {p.originalPrice && p.finalPrice && p.originalPrice > p.finalPrice && (
                    <Typography className="text-gray-400 line-through text-sm">
                      {p.originalPrice.toLocaleString('vi-VN')} ₫
                    </Typography>
                  )}

                  {/* Giá final */}
                  <Typography
                    className={`font-bold ${
                      p.originalPrice && p.finalPrice && p.originalPrice > p.finalPrice
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {(p.finalPrice ?? p.price).toLocaleString('vi-VN')} ₫
                  </Typography>

                  {/* % GIẢM */}
                  {p.originalPrice && p.finalPrice && p.originalPrice > p.finalPrice && (
                    <Chip
                      label={`-${Math.round(
                        ((p.originalPrice - p.finalPrice) / p.originalPrice) * 100,
                      )}%`}
                      color="error"
                      size="small"
                      className="w-fit mt-1"
                    />
                  )}
                  {/* BUTTON THÊM */}
                  <Button
                    size="small"
                    variant="outlined"
                    className="mt-2"
                    onClick={() => {
                      addItem({
                        productId: p.productId,
                        storeId,
                        name: p.name,
                        price: p.finalPrice ?? p.price,
                        originalPrice: p.originalPrice ?? p.price,
                        finalPrice: p.finalPrice ?? p.price,
                        discountAmount: p.discountAmount ?? 0,
                        quantity: 1,
                        image: p.image ?? '',
                      });

                      setAdded(true);
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              </div>
            </div>
          </ListItem>
        </Box>
      ))}
    </Box>
  );
}

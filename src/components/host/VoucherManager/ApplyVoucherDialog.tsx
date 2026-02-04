'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  TextField,
  Chip,
  FormControlLabel,
  Divider,
} from '@mui/material';

import FormDialog from '@/components/common/FormDialog';
import { Voucher, Category, Product } from '@/types';
import { voucherService } from '@/lib/services/voucherService';
import { storeService } from '@/lib/services/storeService';
import { useAuthStore } from '@/lib/stores/authStore';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { showToast } from '@/components/common/Toast';

interface ApplyVoucherDialogProps {
  open: boolean;
  voucher: Voucher | null;
  onClose: () => void;
}

export default function ApplyVoucherDialog({ open, voucher, onClose }: ApplyVoucherDialogProps) {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [checkedProductIds, setCheckedProductIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [openClearConfirm, setOpenClearConfirm] = useState(false);
  const [voucherLocal, setVoucherLocal] = useState<Voucher | null>(null);

  const normalizeProductIds = (ids: (string | { _id: string })[] = []): string[] => {
    return ids.map((id) => (typeof id === 'string' ? id : id._id));
  };

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  /* ================= GROUP BY CATEGORY ================= */
  const productsByCategory = useMemo(() => {
    return categories.reduce<Record<string, Product[]>>((acc, cat) => {
      acc[cat._id] = filteredProducts.filter((p) => {
        const catId =
          typeof p.categoryId === 'object' ? (p.categoryId as Category)._id : p.categoryId;
        return catId === cat._id;
      });
      return acc;
    }, {});
  }, [categories, filteredProducts]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!open || !user?.storeId) return;

    const storeId = user.storeId;
    const fetchData = async () => {
      const [cats, prods] = await Promise.all([
        storeService.getCategories(storeId),
        storeService.getProducts(storeId),
      ]);

      setCategories(cats);
      setProducts(prods);
    };

    fetchData();
  }, [open, user?.storeId]);

  useEffect(() => {
    if (!open || !voucher?._id) return;

    const fetchVoucher = async () => {
      try {
        const v = await voucherService.getVoucherDetail(voucher._id);
        setVoucherLocal(v);

        const ids = normalizeProductIds(v.productIds);
        setCheckedProductIds(ids);
      } catch (e) {
        console.error(e);
      }
    };

    fetchVoucher();
  }, [open, voucher?._id]);

  /* RESET KHI CLOSE */
  useEffect(() => {
    if (!open) {
      setCheckedProductIds([]);
      setSearch('');
    }
  }, [open]);

  if (!voucherLocal) return null;

  /* ================= PRODUCT TOGGLE ================= */
  const toggleProduct = (productId: string) => {
    setCheckedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  /* ================= CATEGORY TOGGLE ================= */
  const toggleCategory = (categoryId: string) => {
    const catProducts = productsByCategory[categoryId] || [];
    const ids = catProducts.map((p) => p._id);

    const allChecked = ids.every((id) => checkedProductIds.includes(id));

    if (allChecked) {
      setCheckedProductIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setCheckedProductIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const isCategoryChecked = (categoryId: string) => {
    const allProductsInCategory = products.filter((p) => {
      const catId =
        typeof p.categoryId === 'object' ? (p.categoryId as Category)._id : p.categoryId;

      return catId === categoryId;
    });

    if (allProductsInCategory.length === 0) return false;

    return allProductsInCategory.every((p) => checkedProductIds.includes(p._id));
  };

  /* ================= APPLY ================= */
  const handleApply = async () => {
    if (!voucherLocal) return;

    try {
      setLoading(true);

      const fresh = await voucherService.setVoucherProducts(voucherLocal._id, {
        productIds: checkedProductIds,
      });

      setVoucherLocal(fresh);

      showToast.success({ message: 'Lưu voucher thành công!' });
      onClose(); // đóng dialog
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLEAR ================= */
  const handleClearConfirm = () => {
    setCheckedProductIds([]);
    setOpenClearConfirm(false);
  };

  /* ================= UI ================= */
  return (
    <FormDialog
      open={open}
      title="Gán / Gỡ Voucher"
      confirmText="Áp dụng"
      cancelText="Đóng"
      loading={loading}
      size="md"
      onConfirm={handleApply}
      onCancel={onClose}
    >
      <Box className="space-y-4">
        {/* INFO */}
        <Box className="border rounded-lg p-3 bg-gray-50">
          <Typography className="font-semibold">
            {voucherLocal?.code || voucherLocal?.name}
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            {voucherLocal.type} - {voucherLocal.value}
          </Typography>
          <Chip size="small" label={voucherLocal.scope} className="mt-1" />
        </Box>

        {/* SEARCH */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Divider />

        {/* TREE */}
        <Box className="max-h-[400px] overflow-y-auto space-y-3">
          {categories.map((cat) => {
            const catProducts = productsByCategory[cat._id] || [];
            if (catProducts.length === 0) return null;

            return (
              <Box key={cat._id}>
                {/* CATEGORY */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCategoryChecked(cat._id)}
                      indeterminate={
                        (productsByCategory[cat._id] || []).some((p) =>
                          checkedProductIds.includes(p._id),
                        ) && !isCategoryChecked(cat._id)
                      }
                      onChange={() => toggleCategory(cat._id)}
                    />
                  }
                  label={<Typography className="font-semibold">{cat.name}</Typography>}
                />

                {/* PRODUCTS */}
                <Box className="ml-6 flex flex-col">
                  {catProducts.map((p) => (
                    <FormControlLabel
                      key={p._id}
                      control={
                        <Checkbox
                          checked={checkedProductIds.includes(p._id)}
                          onChange={() => toggleProduct(p._id)}
                        />
                      }
                      label={p.name}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
        <Button color="warning" variant="outlined" onClick={() => setOpenClearConfirm(true)}>
          Bỏ hết
        </Button>
      </Box>
      <ConfirmDialog
        open={openClearConfirm}
        title="Gỡ toàn bộ voucher?"
        message="Hành động này sẽ xóa voucher khỏi TẤT CẢ sản phẩm."
        variant="danger"
        onCancel={() => setOpenClearConfirm(false)}
        onConfirm={handleClearConfirm}
      />
    </FormDialog>
  );
}

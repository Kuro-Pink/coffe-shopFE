'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category, Product } from '@/types';
import { storeService } from '@/lib/services/storeService';
import { AxiosError } from 'axios';
import RecipeManager from './RecipeManager';

interface ProductDialogProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  storeId: string;
  defaultCategoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ErrorResponse {
  message?: string;
  error?: string;
}

/* =======================
   VALIDATION
======================= */
const productSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự.'),
  description: z.string().min(5, 'Mô tả phải có ít nhất 5 ký tự.'),
  price: z.number().min(1000, 'Giá phải >= 1,000 VNĐ.'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục.'),
  isAvailable: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductDialog({
  open,
  product,
  categories,
  storeId,
  defaultCategoryId,
  onClose,
  onSuccess,
}: ProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [recipeChanged, setRecipeChanged] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [isEditingFlow, setIsEditingFlow] = useState(false);

  const activeProductId = product?._id ?? createdProduct?._id;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      isAvailable: true,
    },
  });

  /* =======================
     EFFECTS
  ======================= */
  useEffect(() => {
    setCurrentTab(0);
    setRecipeChanged(false);
    setCreatedProduct(null);
    setIsEditingFlow(false);
  }, [open, product]);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name ?? '',
        description: product.description ?? '',
        price: product.price ?? 0,
        categoryId:
          typeof product.categoryId === 'string'
            ? product.categoryId
            : ((product.categoryId as any)?._id ?? ''),
        isAvailable: product.isAvailable ?? true,
      });
      setImagePreview(product.image || '');
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        categoryId: defaultCategoryId || '',
        isAvailable: true,
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [product, open, reset, defaultCategoryId]);

  /* =======================
     HANDLERS
  ======================= */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('categoryId', data.categoryId);
      formData.append('isAvailable', String(data.isAvailable ?? true));
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (product?.image) {
        formData.append('imageUrl', product.image);
      }

      if (product) {
        await storeService.updateProduct(product._id, formData);
        setIsEditingFlow(true);
        setCurrentTab(1);
      } else {
        const newProduct = await storeService.createProduct(storeId, formData);
        setCreatedProduct(newProduct);
        setCurrentTab(1);
      }
    } catch (err) {
      let errorMessage = 'Thao tác thất bại';
      if (err instanceof AxiosError) {
        const data = err.response?.data as ErrorResponse;
        errorMessage = data?.message || data?.error || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeSaved = () => {
    setRecipeChanged(true);
    setIsEditingFlow(false);
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    if (!product && !recipeChanged) {
      alert('Vui lòng lưu công thức trước khi thoát');
      return;
    }

    if (product && isEditingFlow && !recipeChanged) {
      alert('Bạn chưa lưu công thức');
      return;
    }

    onClose();
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
            <Tab label="Thông tin" />
            <Tab label="Công thức" />
          </Tabs>

          {currentTab === 0 && (
            <>
              <Box className="text-center">
                <Avatar src={imagePreview} variant="rounded" className="w-32 h-32 mx-auto mb-3">
                  <CloudUpload />
                </Avatar>
                <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
                  {imagePreview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                  <input hidden type="file" accept="image/*" onChange={handleImageUpload} />
                </Button>
              </Box>

              <TextField
                {...register('name')}
                label="Tên sản phẩm"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              <TextField
                {...register('description')}
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
              />

              <TextField
                {...register('price', { valueAsNumber: true })}
                label="Giá (VNĐ)"
                type="number"
                fullWidth
                error={!!errors.price}
                helperText={errors.price?.message}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                }}
              />

              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Danh mục"
                    fullWidth
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={!!errors.categoryId}
                    helperText={errors.categoryId?.message}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    label="Còn hàng"
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                  />
                )}
              />
            </>
          )}

          {currentTab === 1 && activeProductId && (
            <RecipeManager
              productId={activeProductId}
              storeId={storeId}
              onRecipeSaved={handleRecipeSaved}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>

          {currentTab === 0 && (
            <Button type="submit" variant="contained" className="bg-green-600">
              {product ? 'Lưu & tiếp' : 'Thêm & tiếp'}
            </Button>
          )}

          {currentTab === 1 && (
            <Button variant="contained" onClick={handleClose} className="bg-green-600">
              Đóng
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}

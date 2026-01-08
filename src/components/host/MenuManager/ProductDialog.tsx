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
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category, Product } from '@/types';
import { storeService } from '@/lib/services/storeService';
import { AxiosError } from 'axios';
import { Controller } from 'react-hook-form';
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
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [recipeChanged, setRecipeChanged] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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

  useEffect(() => {
    setCurrentTab(0);
  }, [open, product]);

  // Load dữ liệu vào form nếu đang edit
  useEffect(() => {
    if (product) {
      reset({
        name: product.name ?? '',
        description: product.description ?? '',
        price: product.price ?? 0,
        categoryId: product.categoryId, // 🔥 BẮT BUỘC
        isAvailable: product.isAvailable ?? true,
      });
      setImagePreview(product.image || '');
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        categoryId: defaultCategoryId!, // 🔥 BẮT BUỘC
        isAvailable: true,
      });
      setImagePreview('');
    }

    setImageFile(null);
  }, [product, open, reset, defaultCategoryId]);

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
      formData.append('isAvailable', (data.isAvailable ?? true).toString());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (product) {
        // Update
        await storeService.updateProduct(product._id, formData);
      } else {
        // Create
        await storeService.createProduct(storeId, formData);
      }

      onSuccess();
      onClose();
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
  };

  const handleClose = () => {
    if (recipeChanged) {
      onSuccess();
    }
    setRecipeChanged(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          {/* Tabs */}
          <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
            <Tab label="Thông tin" />
            <Tab label="Công thức" disabled={!product} />
          </Tabs>

          {/* TAB 1: THÔNG TIN */}
          {currentTab === 0 && (
            <>
              {/* Image */}
              <Box className="text-center">
                <Avatar src={imagePreview} variant="rounded" className="w-32 h-32 mx-auto mb-3">
                  <CloudUpload className="text-4xl" />
                </Avatar>

                <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
                  {imagePreview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                  <input hidden type="file" accept="image/*" onChange={handleImageUpload} />
                </Button>
              </Box>

              {/* Fields */}
              <TextField
                {...register('name')}
                label="Tên sản phẩm"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isLoading}
              />

              <TextField
                {...register('description')}
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={isLoading}
              />

              <TextField
                {...register('price', { valueAsNumber: true })}
                label="Giá (VNĐ)"
                type="number"
                fullWidth
                error={!!errors.price}
                helperText={errors.price?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                }}
              />

              <Controller
                name="isAvailable"
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <FormControlLabel
                    label="Còn hàng"
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={isLoading}
                      />
                    }
                  />
                )}
              />
            </>
          )}

          {/* TAB 2: CÔNG THỨC */}
          {currentTab === 1 && product && (
            <RecipeManager
              productId={product._id}
              storeId={storeId}
              onRecipeSaved={handleRecipeSaved}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>

          {currentTab === 0 && (
            <Button type="submit" variant="contained" disabled={isLoading} className="bg-green-600">
              {isLoading ? 'Đang lưu...' : product ? 'Cập nhật' : 'Thêm'}
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

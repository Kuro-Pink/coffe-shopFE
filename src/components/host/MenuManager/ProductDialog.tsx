'use client';

import { useEffect, useState, useRef } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { CloudUpload, ArrowBack, Save } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category, Product, ProductIngredient } from '@/types';
import { storeService } from '@/lib/services/storeService';
import { AxiosError } from 'axios';
import RecipeManager from './RecipeManager';
import { showToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import type { RecipeManagerRef } from './RecipeManager';

interface ProductDialogProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  storeId: string;
  defaultCategoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
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
  const recipeRef = useRef<RecipeManagerRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [recipeChanged, setRecipeChanged] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const activeProductId = product?._id ?? createdProduct?._id;
  const [confirmClose, setConfirmClose] = useState(false);
  const [canSaveRecipe, setCanSaveRecipe] = useState(false);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [recipe, setRecipe] = useState<ProductIngredient[]>([]);
  const [recipeInitialized, setRecipeInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
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

  const hasUnsavedChange = isDirty || recipeChanged;

  /* =======================
     EFFECTS
  ======================= */

  useEffect(() => {
    setCurrentTab(0);
    setRecipeChanged(false);
    setCreatedProduct(null);
  }, [open, product]);

  useEffect(() => {
    if (!open) return;

    setRecipe([]);
    setRecipeInitialized(false);
    if (product) {
      reset(
        {
          name: product.name ?? '',
          description: product.description ?? '',
          price: product.price ?? 0,
          categoryId:
            typeof product.categoryId === 'string'
              ? product.categoryId
              : ((product.categoryId as Category)?._id ?? ''),
          isAvailable: product.isAvailable ?? true,
        },
        { keepDirty: false },
      );
      setImagePreview(product.image || '');
    } else {
      reset(
        {
          name: '',
          description: '',
          price: 0,
          categoryId: defaultCategoryId || '',
          isAvailable: true,
        },
        { keepDirty: false },
      );
      setImagePreview('');
    }
    setImageFile(null);
  }, [product, open]);

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

      // 🔥 ƯU TIÊN UPDATE NẾU ĐÃ TỪNG CREATE
      if (product || createdProduct) {
        const id = product?._id ?? createdProduct!._id;
        await storeService.updateProduct(id, formData);
      } else {
        const newProduct = await storeService.createProduct(storeId, formData);
        setCreatedProduct(newProduct);
      }

      setCurrentTab(1);
    } catch (err) {
      let errorMessage = 'Thao tác thất bại';
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        errorMessage = data?.message || data?.error || errorMessage;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeSaved = () => {
    setRecipe([]);
    setCurrentTab(0);
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    if (!hasUnsavedChange) {
      onClose();
      return;
    }

    showToast.warning({
      message: 'Bạn có thay đổi chưa được lưu',
    });

    setConfirmClose(true);
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-4">
          <Tabs value={currentTab}>
            <Tab label="Thông tin" />
            <Tab label="Công thức" />
          </Tabs>

          <Box hidden={currentTab !== 0}>
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
          </Box>

          {currentTab === 1 && activeProductId && (
            <RecipeManager
              ref={recipeRef}
              productId={activeProductId}
              storeId={storeId}
              recipe={recipe}
              onRecipeChange={(data) => {
                setRecipe(data);

                // ✅ chỉ dirty khi đã init xong
                if (recipeInitialized) {
                  setRecipeChanged(true);
                }
              }}
              onRecipeSaved={handleRecipeSaved}
              onRecipeStateChange={({ hasRecipe, isSaving }) => {
                setCanSaveRecipe(hasRecipe);
                setIsSavingRecipe(isSaving);
              }}
              onRecipeInitialized={() => setRecipeInitialized(true)}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>

          {/* TAB THÔNG TIN */}
          {currentTab === 0 && (
            <Button
              type="submit"
              variant="contained"
              className="bg-green-600"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              Tiếp
            </Button>
          )}

          {/* TAB CÔNG THỨC */}
          {currentTab === 1 && (
            <>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => setCurrentTab(0)}>
                Quay lại
              </Button>

              <Button
                variant="contained"
                startIcon={
                  isSavingRecipe ? <CircularProgress size={18} color="inherit" /> : <Save />
                }
                onClick={() => recipeRef.current?.saveRecipe()}
                disabled={!canSaveRecipe || isSavingRecipe}
                className="bg-green-600"
              >
                {isSavingRecipe ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
      <ConfirmDialog
        open={confirmClose}
        title="Hủy thay đổi?"
        message="Các thay đổi của bạn sẽ không được lưu. Bạn có chắc chắn muốn thoát?"
        confirmText="Thoát"
        cancelText="Tiếp tục chỉnh sửa"
        variant="warning"
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
      />
    </Dialog>
  );
}

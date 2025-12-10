'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Avatar,
  Chip,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Restaurant,
  CloudUpload,
  Search,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { storeService } from '@/lib/services/storeService';
import { Category, Product } from '@/types';
import { AxiosError } from 'axios';

interface ProductManagerProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  storeId: string;
}

const productSchema = z.object({
  name: z.string().min(2, 'Tên món ăn phải có ít nhất 2 ký tự'),
  description: z.string().min(5, 'Mô tả phải có ít nhất 5 ký tự'),
  price: z.number().min(1000, 'Giá phải >= 1,000 VNĐ'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  isAvailable: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ErrorResponse {
  message?: string;
  error?: string;
}

export default function ProductManager({
  products,
  categories,
  onRefresh,
  storeId,
}: ProductManagerProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setValue('name', product.name);
      setValue('description', product.description);
      setValue('price', product.price);
      setValue('categoryId', product.categoryId);
      setValue('isAvailable', product.isAvailable);
      setImagePreview(product.image || '');
    } else {
      setEditingProduct(null);
      reset({ isAvailable: true });
      setImagePreview('');
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setImagePreview('');
    setImageFile(null);
    reset();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('categoryId', data.categoryId);
      formData.append('isAvailable', (data.isAvailable ?? true).toString());

      if (imageFile) {
        console.log('Uploading image file:', imageFile);
        formData.append('image', imageFile);
      }

      if (editingProduct) {
        await storeService.updateProduct(editingProduct._id, formData);
      } else {
        await storeService.createProduct(storeId, formData);
      }

      onRefresh();
      handleCloseDialog();
    } catch (err: unknown) {
      let errorMessage = 'Thao tác thất bại';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.product) return;

    try {
      await storeService.deleteProduct(deleteDialog.product._id);
      onRefresh();
      setDeleteDialog({ open: false, product: null });
    } catch (err: unknown) {
      let errorMessage = 'Không thể xóa món ăn';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      alert(errorMessage);
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      await storeService.toggleProductAvailability(product._id);
      onRefresh();
    } catch (err: unknown) {
      let errorMessage = 'Không thể cập nhật trạng thái';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      }
      alert(errorMessage);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <>
      <Card className="shadow-lg border-0">
        <CardContent>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <Typography variant="h6" className="font-bold">
              Danh sách món ăn
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              disabled={categories.length === 0}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              Thêm món ăn
            </Button>
          </div>

          {categories.length === 0 && (
            <Box className="text-center py-8 bg-yellow-50 rounded-lg mb-4">
              <Typography variant="body2" className="text-yellow-800">
                ⚠️ Bạn cần tạo danh mục trước khi thêm món ăn
              </Typography>
            </Box>
          )}

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <TextField
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64"
              label="Lọc theo danh mục"
            >
              <MenuItem value="all">Tất cả danh mục</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <Box className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Restaurant className="text-gray-400 text-4xl" />
              </div>
              <Typography variant="h6" className="text-gray-800 mb-2">
                {searchQuery ? 'Không tìm thấy món ăn' : 'Chưa có món ăn nào'}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Thêm món ăn đầu tiên vào menu'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product._id}>
                  <Card className="border border-gray-200 hover:shadow-lg transition-all h-full">
                    <CardContent>
                      {/* Image */}
                      <Avatar
                        src={product.image}
                        variant="rounded"
                        className="w-full h-40 mb-3"
                      >
                        <Restaurant className="text-4xl" />
                      </Avatar>

                      {/* Info */}
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <Typography variant="h6" className="font-semibold flex-1">
                            {product.name}
                          </Typography>
                          <Chip
                            label={product.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                            size="small"
                            icon={product.isAvailable ? <CheckCircle /> : <Cancel />}
                            className={
                              product.isAvailable
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-600'
                            }
                            onClick={() => toggleAvailability(product)}
                          />
                        </div>

                        <Typography variant="body2" className="text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </Typography>

                        <Typography variant="h6" className="text-green-600 font-bold">
                          {product.price.toLocaleString('vi-VN')} ₫
                        </Typography>

                        <Chip
                          label={
                            categories.find((c) => c._id === product.categoryId)?.name ||
                            'Không rõ'
                          }
                          size="small"
                          className="mt-2 bg-gray-100"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleOpenDialog(product)}
                          className="flex-1"
                        >
                          Sửa
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, product })}
                        >
                          <Delete />
                        </IconButton>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent className="space-y-4">
            {/* Image Upload */}
            <Box className="text-center">
              <Avatar
                src={imagePreview}
                variant="rounded"
                className="w-32 h-32 mx-auto mb-3"
              >
                <CloudUpload className="text-4xl" />
              </Avatar>
              <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
                {imagePreview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
            </Box>

            <TextField
              {...register('name')}
              label="Tên món ăn"
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

            <TextField
              {...register('categoryId')}
              label="Danh mục"
              select
              fullWidth
              error={!!errors.categoryId}
              helperText={errors.categoryId?.message}
              disabled={isLoading}
              defaultValue=""
            >
              <MenuItem value="" disabled>
                -- Chọn danh mục --
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch {...register('isAvailable')} defaultChecked disabled={isLoading} />
              }
              label="Còn hàng"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" variant="contained" disabled={isLoading} className="bg-green-600">
              {isLoading ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
      >
        <DialogTitle>Xác nhận xóa món ăn</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa món <strong>{deleteDialog.product?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, product: null })}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
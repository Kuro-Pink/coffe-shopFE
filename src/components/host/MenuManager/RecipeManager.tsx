'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import { inventoryService } from '../../../lib/services/inventoryService';
import { Ingredient, ProductIngredient } from '../../../types';
import { AxiosError } from 'axios';
interface ErrorResponse {
  message?: string;
  error?: string;
}
interface RecipeManagerProps {
  productId: string;
  storeId: string;
  onRecipeSaved?: () => void; // ✅ Add callback
}
export default function RecipeManager({
  productId,
  storeId,
  onRecipeSaved, // ✅ Add prop
}: RecipeManagerProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipe, setRecipe] = useState<ProductIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    fetchData();
  }, [productId, storeId]);
  const fetchData = async () => {
    try {
      setLoading(true);

      const [ingredientsData, recipeData] = await Promise.all([
        inventoryService.getIngredients(storeId),
        inventoryService.getProductRecipe(productId).catch(() => []),
      ]);

      console.log('Fetched recipe data:', recipeData);

      setIngredients(ingredientsData);
      setRecipe(recipeData); // ✅ FIX Ở ĐÂY
    } catch (err) {
      console.error('Failed to fetch recipe data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    const usedIds = recipe.map((r) => r.ingredientId);
    const available = ingredients.find((i) => !usedIds.includes(i._id));
    if (!available) {
      setError('Tất cả nguyên liệu đã được sử dụng');
      return;
    }
    setRecipe([
      ...recipe,
      {
        ingredientId: available._id,
        amount: 0,
      },
    ]);
  };
  const handleRemoveIngredient = (index: number) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };
  const handleIngredientChange = (index: number, field: 'ingredientId' | 'amount', value: any) => {
    const newRecipe = [...recipe];
    newRecipe[index] = {
      ...newRecipe[index],
      [field]: value,
    };
    setRecipe(newRecipe);
    setSuccess('');
  };
  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess(''); // Validate
      if (recipe.length === 0) {
        setError('Vui lòng thêm ít nhất một nguyên liệu');
        setSaving(false);
        return;
      }
      for (let i = 0; i < recipe.length; i++) {
        if (!recipe[i].amount || recipe[i].amount <= 0) {
          setError(`Số lượng nguyên liệu ${i + 1} phải lớn hơn 0`);
          setSaving(false);
          return;
        }
      }
      await inventoryService.setProductRecipe(productId, {
        ingredients: recipe.map((r) => ({
          ingredientId: r.ingredientId,
          amount: r.amount,
        })),
      });
      setSuccess('Lưu công thức thành công!'); // ✅ Call callback to notify parent
      if (onRecipeSaved) {
        onRecipeSaved();
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      console.error('Failed to save recipe:', err);
      let errorMessage = 'Lưu công thức thất bại. Vui lòng thử lại.';
      if (err instanceof AxiosError) {
        const responseData = err.response?.data as ErrorResponse;
        errorMessage = responseData?.message || responseData?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };
  const getIngredientUnit = (ingredientId: string) => {
    const ingredient = ingredients.find((i) => i._id === ingredientId);
    return ingredient?.unit || '';
  };
  const getIngredientName = (ingredientId: string) => {
    const ingredient = ingredients.find((i) => i._id === ingredientId);
    return ingredient?.name || '';
  };
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }
  if (ingredients.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            Chưa có nguyên liệu nào. Vui lòng thêm nguyên liệu trong phần{' '}
            <strong>Quản lý Kho</strong> trước khi thiết lập công thức.
          </Alert>
        </CardContent>
      </Card>
    );
  }
  console.log('Rendering RecipeManager with recipe:', recipe);
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-bold">
            Công thức món ăn
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddIngredient}
            disabled={saving}
          >
            Thêm nguyên liệu
          </Button>
        </div>{' '}
        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}{' '}
        {success && (
          <Alert severity="success" className="mb-4" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}{' '}
        <Typography variant="body2" className="text-gray-600 mb-4">
          Thiết lập nguyên liệu cần thiết để làm 1 phần món này. Hệ thống sẽ tự động trừ kho khi xác
          nhận đơn hàng.
        </Typography>{' '}
        <Divider className="mb-4" /> {/* Recipe Items */}
        {recipe.length === 0 ? (
          <Alert severity="info">
            Chưa có nguyên liệu nào. Click <strong>Thêm nguyên liệu</strong> để bắt đầu.
          </Alert>
        ) : (
          <div className="space-y-3 mb-4">
            {recipe.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <TextField
                  select
                  label="Nguyên liệu"
                  value={item.ingredientId}
                  onChange={(e) => handleIngredientChange(index, 'ingredientId', e.target.value)}
                  disabled={saving}
                  className="flex-1"
                >
                  {ingredients.map((ingredient) => (
                    <MenuItem
                      key={ingredient._id}
                      value={ingredient._id}
                      disabled={recipe.some(
                        (r, i) => r.ingredientId === ingredient._id && i !== index,
                      )}
                    >
                      {ingredient.name} ({ingredient.unit})
                    </MenuItem>
                  ))}
                </TextField>{' '}
                <TextField
                  label="Số lượng"
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    handleIngredientChange(
                      index,
                      'amount',
                      e.target.value === '' ? 0 : Number(e.target.value),
                    )
                  }
                  disabled={saving}
                  inputProps={{ min: 0, step: 'any' }}
                  helperText={getIngredientUnit(item.ingredientId)}
                  className="w-40"
                />{' '}
                <IconButton
                  color="error"
                  onClick={() => handleRemoveIngredient(index)}
                  disabled={saving}
                >
                  <Delete />
                </IconButton>
              </div>
            ))}
          </div>
        )}{' '}
        {/* Cost Summary */}
        {recipe.length > 0 && (
          <div className="bg-gray-50 rounded p-4 mb-4">
            <Typography variant="body2" className="text-gray-700 font-semibold mb-2">
              Chi tiết công thức:
            </Typography>
            <div className="space-y-1">
              {recipe.map((item, index) => {
                const ingredient = ingredients.find((i) => i._id === item.ingredientId);
                const cost = ingredient ? ingredient.cost * item.amount : 0;
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      • {getIngredientName(item.ingredientId)}: {item.amount}{' '}
                      {getIngredientUnit(item.ingredientId)}
                    </span>
                    <span className="font-semibold">{cost.toLocaleString()} ₫</span>
                  </div>
                );
              })}
              <Divider className="my-2" />
              <div className="flex justify-between font-bold text-green-600">
                <span>Tổng giá vốn:</span>
                <span>
                  {recipe
                    .reduce((total, item) => {
                      const ingredient = ingredients.find((i) => i._id === item.ingredientId);
                      return total + (ingredient ? ingredient.cost * item.amount : 0);
                    }, 0)
                    .toLocaleString()}{' '}
                  ₫
                </span>
              </div>
            </div>
          </div>
        )}{' '}
        {/* Save Button */}
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={saving || recipe.length === 0}
          fullWidth
        >
          {saving ? <CircularProgress size={24} /> : 'Lưu công thức'}
        </Button>
      </CardContent>
    </Card>
  );
}

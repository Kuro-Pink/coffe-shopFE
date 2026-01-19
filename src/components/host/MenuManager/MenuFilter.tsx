'use client';

import { TextField, MenuItem, Button, InputAdornment, Box, Tabs, Tab } from '@mui/material';
import { Search, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Category } from '@/types';
import { StatTab } from '@/components/ui';

interface MenuFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'available' | 'unavailable';
  onStatusChange: (value: 'all' | 'available' | 'unavailable') => void;
  expandAll: boolean;
  onToggleExpandAll: () => void;
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function MenuFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  expandAll,
  onToggleExpandAll,
  categories,
  selectedCategory,
  onCategoryChange,
}: MenuFilterProps) {
  return (
    <div className="space-y-4">
      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="flex-1 w-full">
          <TextField
            placeholder="Tìm sản phẩm theo tên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto">
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as 'all' | 'available' | 'unavailable')}
            label="Trạng thái"
            className="w-40"
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="available">Còn hàng</MenuItem>
            <MenuItem value="unavailable">Hết hàng</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            size="small"
            onClick={onToggleExpandAll}
            startIcon={expandAll ? <ExpandLess /> : <ExpandMore />}
          >
            {expandAll ? 'Thu gọn' : 'Mở rộng'}
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <Box className="border-t border-gray-200 -mx-4 px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto">
            <StatTab
              active={selectedCategory === 'all'}
              label="Tất cả"
              onClick={() => onCategoryChange('all')}
            />

            {categories
              .sort((a, b) => a.order - b.order)
              .map((category) => (
                <StatTab
                  key={category._id}
                  active={selectedCategory === category._id}
                  label={category.name}
                  onClick={() => onCategoryChange(category._id)}
                />
              ))}
          </div>
        </Box>
      )}
    </div>
  );
}

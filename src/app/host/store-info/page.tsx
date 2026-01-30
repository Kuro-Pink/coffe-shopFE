'use client';

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Box,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { storeService } from '@/lib/services/storeService';
import { useAuthStore } from '@/lib/stores/authStore';
import { Store } from '@/types';

export default function StoreInfoPage() {
  const user = useAuthStore((s) => s.user);
  const storeId = user?.storeId;

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  // ===== Fetch store =====
  useEffect(() => {
    if (!storeId) return;

    const fetchStore = async () => {
      setLoading(true);
      const data = await storeService.getStoreInfo(storeId);
      setStore(data);

      setName(data.name);
      setAddress(data.address);
      setPhone(data.phone);
      setPreview(data.logo);

      setLoading(false);
    };

    fetchStore();
  }, [storeId]);

  // ===== Save =====
  const handleSave = async () => {
    if (!store) return;

    try {
      setSaving(true);
      const formData = new FormData();

      if (name) formData.append('name', name);
      if (address) formData.append('address', address);
      if (phone) formData.append('phone', phone);
      if (logoFile) formData.append('logo', logoFile);

      const updated = await storeService.updateStoreInfo(store._id, formData);
      setStore(updated);
      setPreview(updated.logo);
      setLogoFile(null);
    } finally {
      setSaving(false);
    }
  };

  if (!storeId) {
    return <Typography>Bạn chưa có cửa hàng</Typography>;
  }

  if (loading) {
    return (
      <Stack alignItems="center" mt={6}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!store) return null;

  return (
    <Box
      sx={{
        minHeight: '90vh', // chiếm toàn bộ chiều cao màn hình
        maxWidth: '400vh', // chiếm toàn bộ chiều cao màn hình
        display: 'flex',
        alignItems: 'center', // căn giữa theo chiều dọc
        justifyContent: 'center', // căn giữa theo chiều ngang
        bgcolor: '#f5f5f5', // optional: nền xám nhẹ cho đẹp
      }}
    >
      <Card sx={{ minWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2} textAlign="center">
            Thông tin cửa hàng
          </Typography>

          {/* ===== LOGO (CLICK TO UPLOAD) ===== */}
          <Stack alignItems="center" spacing={1}>
            <Box
              component="label"
              sx={{
                position: 'relative',
                width: 96,
                height: 96,
                cursor: 'pointer',
              }}
            >
              <Avatar
                src={preview}
                sx={{
                  width: 96,
                  height: 96,
                  opacity: uploadingLogo ? 0.5 : 1,
                  border: '2px solid',
                  borderColor: 'divider', // theo theme MUI
                }}
              />

              {/* Overlay spinner */}
              {uploadingLogo && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.3)',
                    borderRadius: '50%',
                  }}
                >
                  <CircularProgress size={28} color="inherit" />
                </Box>
              )}

              {/* Hidden file input */}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setUploadingLogo(true);
                  setLogoFile(file);
                  setPreview(URL.createObjectURL(file));

                  // UX delay (có thể bỏ nếu không thích)
                  setTimeout(() => setUploadingLogo(false), 400);
                }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary">
              Nhấn vào logo để tải ảnh mới
            </Typography>
          </Stack>

          {/* ===== FORM ===== */}
          <Stack spacing={2} mt={3}>
            <TextField
              label="Tên cửa hàng"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
              label="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {saving ? 'Đang lưu...' : 'Cập nhật thông tin'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

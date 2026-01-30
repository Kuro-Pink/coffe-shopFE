'use client';

import { useState } from 'react';
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
import { authService } from '@/lib/services/authService';
import { showToast } from '@/components/common/Toast';
import { User } from '@/types';
import { useAuthStore } from '@/lib/stores/authStore';

interface ProfileInfoCardProps {
  user: User;
  onUpdated: (user: User) => void;
}

export default function ProfileInfoCard({ user, onUpdated }: ProfileInfoCardProps) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(user.avatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();

      if (name) formData.append('name', name);
      if (phone) formData.append('phone', phone);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (user?.avatar) {
        formData.append('avatar', user.avatar);
      }
      const updatedUser = await authService.updateMe(formData);
      // ✅ Cập nhật global auth store
      updateUser(updatedUser);

      // ✅ cập nhật local page (nếu bạn vẫn cần)
      onUpdated(updatedUser);

      showToast.success({ message: 'Cập nhật thông tin thành công' });
    } catch (e) {
      showToast.error({ message: 'Cập nhật thất bại' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography fontWeight={600} mb={2} variant="h6" textAlign="center">
          Thông tin tài khoản
        </Typography>

        <Stack alignItems="center" spacing={1}>
          <Box
            sx={{
              position: 'relative',
              width: 96,
              height: 96,
              cursor: 'pointer',
            }}
            component="label"
          >
            <Avatar
              src={preview}
              sx={{
                width: 96,
                height: 96,
                opacity: uploadingAvatar ? 0.5 : 1,
                border: '4px solid',
                borderColor: 'divider',
              }}
            />

            {/* Overlay spinner */}
            {uploadingAvatar && (
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

                setUploadingAvatar(true);

                // Preview ngay
                setAvatarFile(file);
                setPreview(URL.createObjectURL(file));

                // giả lập delay UX (hoặc bỏ nếu không thích)
                setTimeout(() => setUploadingAvatar(false), 500);
              }}
            />
          </Box>

          <Typography variant="caption" color="text.secondary">
            Nhấn vào ảnh để tải lên avatar mới!
          </Typography>
        </Stack>

        <Stack spacing={2} mt={3}>
          <TextField label="Email" value={user.email} disabled />
          <TextField label="Họ tên" value={name} onChange={(e) => setName(e.target.value)} />
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
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

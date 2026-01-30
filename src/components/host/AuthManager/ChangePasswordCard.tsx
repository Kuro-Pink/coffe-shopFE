'use client';

import { useState } from 'react';
import { Card, CardContent, Typography, Stack, TextField, Button } from '@mui/material';
import { authService } from '@/lib/services/authService';
import { showToast } from '@/components/common/Toast';

interface Props {
  onClose: () => void;
}

export default function ChangePasswordCard({ onClose }: Props) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ===== Validation (chỉ dùng khi submit) =====
  const currentError = submitted && !current ? 'Vui lòng nhập mật khẩu hiện tại' : '';

  const nextError =
    submitted && !next
      ? 'Vui lòng nhập mật khẩu mới'
      : submitted && next.length < 6
        ? 'Mật khẩu tối thiểu 6 ký tự'
        : '';

  const confirmError =
    submitted && !confirm
      ? 'Vui lòng xác nhận mật khẩu'
      : submitted && confirm !== next
        ? 'Mật khẩu xác nhận không khớp'
        : '';

  const isInvalid = Boolean(currentError || nextError || confirmError);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (isInvalid) return;
    if (!current || !next || !confirm) {
      showToast.error({
        message: 'Vui lòng nhập đầy đủ các trường thông tin',
      });
      return;
    }

    try {
      setLoading(true);

      await authService.changePassword({
        currentPassword: current,
        newPassword: next,
      });

      showToast.success({ message: 'Đổi mật khẩu thành công' });

      setCurrent('');
      setNext('');
      setConfirm('');
      setSubmitted(false);
      onClose();
    } catch {
      showToast.error({
        message: 'Có lỗi xảy ra khi đổi mật khẩu',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography fontWeight={600} mb={2}>
          Đổi mật khẩu
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Mật khẩu hiện tại"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            error={!!currentError}
            helperText={currentError}
          />

          <TextField
            label="Mật khẩu mới"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            error={!!nextError}
            helperText={nextError}
          />

          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={!!confirmError}
            helperText={confirmError}
          />

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

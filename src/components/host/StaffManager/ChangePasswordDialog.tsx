'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { staffService } from '@/lib/services/staffService';
import { showToast } from '@/components/common/Toast';
import { Staff } from '@/types';

interface Props {
  open: boolean;
  staff: Staff | null;
  onClose: () => void;
}

export default function ChangePasswordDialog({ open, staff, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await staffService.updateStaff(staff!._id, { password });
      showToast.success({ message: 'Đổi mật khẩu thành công!' });
      onClose();
      setPassword('');
      setConfirm('');
    } catch {
      setError('Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Đổi mật khẩu</DialogTitle>

      <DialogContent className="space-y-4 mt-2">
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Mật khẩu mới"
          type={show ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow(!show)}>
                  {show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Xác nhận mật khẩu"
          type={show ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Đổi mật khẩu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

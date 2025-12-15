'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { FormDialogProps } from '@/types';

const sizeMap = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
} as const;

export default function FormDialog({
  open,
  title,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  loading = false,
  size = 'sm',
  onConfirm,
  onCancel,
  children,
}: FormDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth={sizeMap[size]}
      fullWidth
    >
      <DialogTitle className="flex items-center justify-between border-b pb-3">
        <span className="font-bold">{title}</span>
        <IconButton
          size="small"
          onClick={onCancel}
          disabled={loading}
          className="text-gray-500 hover:text-gray-700"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent className="pt-6">{children}</DialogContent>

      <DialogActions className="px-6 pb-6 border-t pt-4">
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          className="min-w-[100px]"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          className="min-w-[100px]"
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Đang xử lý...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
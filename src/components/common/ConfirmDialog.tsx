'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Warning, Delete, CheckCircle, Info, Error } from '@mui/icons-material';
import { ConfirmDialogProps, ModalVariant } from '@/types';

const variantConfig: Record<
  ModalVariant,
  {
    icon: React.ReactNode;
    iconBg: string;
    confirmColor: 'error' | 'warning' | 'success' | 'info' | 'primary';
  }
> = {
  danger: {
    icon: <Delete className="text-red-600" />,
    iconBg: 'bg-red-100',
    confirmColor: 'error',
  },
  warning: {
    icon: <Warning className="text-orange-600" />,
    iconBg: 'bg-orange-100',
    confirmColor: 'warning',
  },
  success: {
    icon: <CheckCircle className="text-green-600" />,
    iconBg: 'bg-green-100',
    confirmColor: 'success',
  },
  info: {
    icon: <Info className="text-blue-600" />,
    iconBg: 'bg-blue-100',
    confirmColor: 'info',
  },
  default: {
    icon: <Info className="text-gray-600" />,
    iconBg: 'bg-gray-100',
    confirmColor: 'primary',
  },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent className="text-center pt-8">
        <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-4`}>
          <div className="text-4xl">{config.icon}</div>
        </div>
        
        <Typography variant="h6" className="font-bold mb-3">
          {title}
        </Typography>
        
        <Typography variant="body1" className="text-gray-600">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions className="px-6 pb-6">
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
          color={config.confirmColor}
          className="min-w-[100px]"
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Đang xử lý...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
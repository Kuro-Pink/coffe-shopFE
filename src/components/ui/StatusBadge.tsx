'use client';

import { Box, Typography } from '@mui/material';

interface StatusBadgeProps {
  label: string;
  color?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const COLOR_MAP = {
  success: { bg: '#DCFCE7', text: '#166534' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  error: { bg: '#FEE2E2', text: '#991B1B' },
  info: { bg: '#DBEAFE', text: '#1E40AF' },
  default: { bg: '#F3F4F6', text: '#374151' },
};

export default function StatusBadge({
  label,
  color = 'default',
}: StatusBadgeProps) {
  const c = COLOR_MAP[color];

  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        backgroundColor: c.bg,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: c.text }}
      >
        {label}
      </Typography>
    </Box>
  );
}

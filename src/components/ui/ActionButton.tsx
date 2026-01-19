'use client';

import { Button, ButtonProps } from '@mui/material';
import { ReactNode } from 'react';

interface ActionButtonProps extends ButtonProps {
  icon?: ReactNode;
}

export default function ActionButton({
  icon,
  children,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant="contained"
      startIcon={icon}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

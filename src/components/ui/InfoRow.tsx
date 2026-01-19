import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

export interface InfoRowProps {
  label: string;
  value: ReactNode;
}

export default function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Box display="flex" justifyContent="space-between" py={0.75}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={500}>{value}</Typography>
    </Box>
  );
}

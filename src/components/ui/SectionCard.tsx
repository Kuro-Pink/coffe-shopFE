import { Card, CardContent, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
      {(title || action) && (
        <Box display="flex" justifyContent="space-between" alignItems="center" px={3} pt={3}>
          {title && <Typography fontWeight={600}>{title}</Typography>}
          {action}
        </Box>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

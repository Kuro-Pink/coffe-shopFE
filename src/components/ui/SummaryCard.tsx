'use client';

import { Card, CardContent, Typography } from '@mui/material';
import React from 'react';

export interface SummaryCardColor {
  bg: string;
  iconBg: string;
  iconColor: string;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: SummaryCardColor;
}

export default function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        background: color?.bg ?? '#fff',
        color: color ? '#fff' : 'inherit',
        borderRadius: 3,
      }}
    >
      <CardContent>
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: color?.iconBg ?? '#e5e7eb',
              color: color?.iconColor ?? '#374151',
            }}
          >
            {icon}
          </div>

          <div>
            <Typography variant="body2" sx={{ opacity: color ? 0.85 : 1 }}>
              {title}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {value}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

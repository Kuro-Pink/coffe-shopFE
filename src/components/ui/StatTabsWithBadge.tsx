'use client';

import { Tabs, Tab, Badge } from '@mui/material';

export interface StatTabItem {
  label: string;
  value: string;
  count?: number;
}

interface StatTabsWithBadgeProps {
  tabs: StatTabItem[];
  value: string;
  onChange: (value: string) => void;
}

export default function StatTabsWithBadge({
  tabs,
  value,
  onChange,
}: StatTabsWithBadgeProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, v) => onChange(v)}
      sx={{
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          minHeight: 44,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={
            tab.count !== undefined ? (
              <Badge
                badgeContent={tab.count}
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontSize: 11 } }}
              >
                {tab.label}
              </Badge>
            ) : (
              tab.label
            )
          }
        />
      ))}
    </Tabs>
  );
}

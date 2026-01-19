'use client';

import { Tabs, Tab, Badge } from '@mui/material';

export interface SummaryTabItem {
  label: string;
  value: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SummaryTabsProps {
  value: string;
  onChange: (value: string) => void;
  items: SummaryTabItem[];
}

export function SummaryTabs({ value, onChange, items }: SummaryTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, v) => onChange(v)}
      variant="scrollable"
      scrollButtons="auto"
      className="bg-white rounded-xl shadow-sm px-2"
    >
      {items.map((item) => (
        <Tab
          key={item.value}
          value={item.value}
          label={
            <div className="flex items-center gap-2">
              {item.icon}
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <Badge color="primary" badgeContent={item.count} />
              )}
            </div>
          }
        />
      ))}
    </Tabs>
  );
}

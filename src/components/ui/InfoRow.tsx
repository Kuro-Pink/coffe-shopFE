'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

export interface InfoRowProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function InfoRow({ label, value, icon, className }: InfoRowProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-gray-50 border border-gray-200',
        className,
      )}
    >
      {icon && (
        <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
      )}

      <div className="flex-1 w-20 ">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );
}

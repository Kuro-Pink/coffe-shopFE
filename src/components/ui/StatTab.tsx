'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatTabProps {
  label: string;
  count?: number;
  active?: boolean;
  color?: 'primary' | 'warning' | 'success' | 'error';
  icon?: ReactNode;
  onClick?: () => void;
}

const colorMap = {
  primary: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    badge: 'bg-blue-600 text-white',
  },
  warning: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    badge: 'bg-orange-500 text-white',
  },
  success: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    badge: 'bg-green-600 text-white',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    badge: 'bg-red-600 text-white',
  },
};

export default function StatTab({
  label,
  count,
  active,
  color = 'primary',
  icon,
  onClick,
}: StatTabProps) {
  const c = colorMap[color];

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative px-4 py-2 rounded-xl flex items-center gap-2',
        'transition-all border',
        active
          ? `${c.bg} ${c.text} border-transparent shadow-sm`
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
      )}
    >
      {icon && <span className="text-base">{icon}</span>}

      <span className="font-medium">{label}</span>

      {typeof count === 'number' && (
        <span
          className={clsx(
            'absolute -top-2 -right-2 min-w-[20px] h-5 px-1',
            'flex items-center justify-center text-xs font-bold rounded-full',
            count === 0 ? 'bg-gray-300 text-gray-600' : c.badge,
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

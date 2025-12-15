'use client';

import toast, { Toaster, ToastOptions as HotToastOptions } from 'react-hot-toast';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#363636',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

interface ToastMessage {
  message: string;
  duration?: number;
}

export const showToast = {
  success: ({ message, duration = 4000 }: ToastMessage) => {
    toast.success(message, {
      duration,
      icon: <CheckCircle className="text-green-500" />,
    });
  },

  error: ({ message, duration = 5000 }: ToastMessage) => {
    toast.error(message, {
      duration,
      icon: <Error className="text-red-500" />,
    });
  },

  warning: ({ message, duration = 4000 }: ToastMessage) => {
    toast(message, {
      duration,
      icon: <Warning className="text-orange-500" />,
      style: {
        border: '1px solid #fb923c',
        background: '#fff7ed',
      },
    });
  },

  info: ({ message, duration = 4000 }: ToastMessage) => {
    toast(message, {
      duration,
      icon: <Info className="text-blue-500" />,
      style: {
        border: '1px solid #60a5fa',
        background: '#eff6ff',
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};
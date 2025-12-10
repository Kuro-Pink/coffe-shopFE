import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';
import AuthInitializer from '@/components/providers/AuthInitializer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coffee Shop',
  description: 'Restaurant ordering system with QR code',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthInitializer />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
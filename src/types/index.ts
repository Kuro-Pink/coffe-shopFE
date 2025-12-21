export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ModalVariant = 'default' | 'danger' | 'warning' | 'success' | 'info';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export interface FormDialogProps {
  open: boolean;
  title: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: ModalSize;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  children: React.ReactNode;
}
export interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'host';
  phone?: string;
  storeId?: string;
}

export interface Store {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email?: string; 
  logo?: string;
  ownerId: string;
  isActive: boolean;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  storeId: string;
  order: number;
  products: Product[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: string;
  storeId: string;
  isAvailable: boolean;
  soldCount?: number;
  createdAt: string;
}

export interface Table {
  _id: string;
  tableNumber: string;
  area: string;
  storeId: string;
  qrCodeUrl: string;
  status: 'available' | 'occupied' | 'needs_cleaning'; 
  currentSession?: {
    customerName?: string;
    customerPhone?: string;
    startTime: string;
    totalOrders: number;
    totalAmount: number;
  }; 
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  storeId: string;
  tableId: string;
  tableName: string;
  customerName: string;
  customerPhone: string;
  customerNote?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  isPaid: boolean;
  paymentMethod?: 'cash' | 'transfer';
  createdAt: string;
  completedAt?: string;
}

export interface StoreRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeLogo?: string;
  businessLicense?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  _id: string;
  billNumber: string;
  storeId: string;
  tableId: string;
  tableName: string;
  tableArea: string;
  customerName: string;
  customerPhone: string;
  orders: Order[]; // Multiple orders combined
  items: OrderItem[]; // All items combined
  subtotal: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'transfer';
  amountReceived?: number;
  changeAmount?: number;
  sessionStartTime: string;
  sessionEndTime: string;
  isPaid: boolean;
  qrPaymentUrl?: string; // ✅ VietQR or bank QR
  createdAt: string;
  paidAt?: string;
}

export interface TablePerformance {
  _id: string;
  tableNumber: string;
  area: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averageSessionTime: number; // in minutes
  turnoverRate: number; // customers per day
  lastSession?: {
    startTime: string;
    endTime: string;
    duration: number;
  };
}

export interface HostRegistrationData {
  // User info
  name: string;
  email: string;
  password: string;
  phone: string;
  
  // Store info
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeLogo?: string;
}
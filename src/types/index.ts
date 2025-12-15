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
  logo?: string;
  ownerId: string;
  isActive: boolean;
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
  createdAt: string;
  soldCount?: number;
}

export interface Table {
  _id: string;
  tableNumber: string;
  area: string;
  storeId: string;
  qrCodeUrl: string;
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
  customerPhone: string;
  customerNote?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
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
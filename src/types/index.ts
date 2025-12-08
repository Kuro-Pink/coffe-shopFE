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
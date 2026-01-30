export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

export interface ToastOptions {
  duration?: number;
  position?:
    | 'top-right'
    | 'top-center'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left';
}

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ModalVariant = 'default' | 'danger' | 'warning' | 'success' | 'info';
export type StaffType = 'cashier' | 'bar' | 'kitchen';

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
export interface SidebarMenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number;
  badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  children?: SidebarMenuItem[];
}
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'host' | 'staff';
  phone?: string;
  avatar?: string;
  storeId?: string;
  staffType?: StaffType;
  currentShift?: Shift;
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
  recipe?: ProductIngredient[];
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
  _id: string;
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
  confirmedBy?: {
    _id: string;
    name: string;
    staffType: StaffType;
  };
  confirmedAt?: string;
  completedBy?: {
    _id: string;
    name: string;
  };
  paidBy?: {
    _id: string;
    name: string;
  };
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

export interface Staff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'staff';
  staffType: StaffType;
  storeId: string;
  isActive: boolean;
  createdAt: string;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  staffByType: {
    cashier: number;
    bar: number;
    kitchen: number;
  };
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  staffType: StaffType;
  ordersProcessed: number;
  ordersCompleted: number;
  ordersCancelled: number;
  totalRevenue: number;
  avgOrderValue: number;
  hoursWorked?: number;
  ordersPerHour?: number;
  firstOrder?: string;
  lastOrder?: string;
}

export interface Ingredient {
  _id: string;
  name: string;
  unit: string; // g, ml, kg, l, pieces
  quantity: number;
  minQuantity: number;
  cost: number; // cost per unit
  storeId: string;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductIngredient {
  ingredientId: string;
  ingredientName?: string;
  amount: number;
}

export interface ProductRecipe {
  productId: string;
  ingredients: ProductIngredient[];
}

export interface InventoryTransaction {
  _id: string;
  ingredientId: {
    _id: string;
    name: string;
    unit: string;
  };
  type: 'in' | 'out'; // in = nhập, out = xuất
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  orderId?: {
    _id: string;
    orderNumber: string;
  };
  note?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export interface InventorySummary {
  totalIngredients: number;
  lowStockCount: number;
  lowStockIngredients: Ingredient[];
  outOfStockCount: number;
  totalInventoryValue: number;
}

export interface UsageReport {
  ingredientId: string;
  name: string;
  unit: string;
  totalUsed: number;
  totalCost: number;
  cost: number;
  timesUsed: number;
  ordersCount: number;
}

export interface Shift {
  _id: string;
  staffId: StaffReference; // Có thể là object hoặc string tùy populate
  storeId: StoreReference;

  // Timestamps
  checkInTime: string;
  checkOutTime?: string;

  // Work metrics
  ordersProcessed: number;
  ordersCompleted: number;
  ordersCancelled: number;
  totalRevenue: number;
  averageOrderValue?: number; // ✅ Backend có field này
  hoursWorked: number | null; // ✅ null nếu chưa check-out

  // Status
  status: 'active' | 'completed';

  // Location tracking
  checkInLocation?: Location;
  checkOutLocation?: Location;

  // Notes
  notes?: string;

  // Timestamps
  createdAt: string;
  updatedAt?: string;
}

export interface UnpaidBill {
  _id: string;
  billNumber: string;
  tableNumber: string;
  customerName?: string;
  customerPhone: string;
  totalAmount: number;
  paidAmount: number;
  balance: number; // Còn nợ
  createdAt: string;
  staffId: string;
  staffName: string;
}

export type ShiftReport =
  // dữ liệu ca làm cơ bản
  Shift &
    // + dữ liệu báo cáo (có thể có / không)
    {
      shiftId?: string;
      staffName?: string;

      // Money
      initialCash?: number;
      cashCollected?: number;
      transferCollected?: number;

      systemRevenue?: number;
      discrepancy?: number;

      // Debt
      unpaidOrders?: number;
      unpaidAmount?: number;
    };

export interface StaffShiftStats {
  totalShifts: number;
  totalHours: number;
  totalOrdersProcessed: number;
  totalOrdersCompleted: number;
  totalOrdersCancelled: number;
  totalRevenue: number;
  averageOrdersPerShift: number;
  averageRevenuePerShift: number;
}

export interface HostShiftStats {
  totalShifts: number;
  activeShifts: number;
  completedShifts: number;

  totalHoursWorked: number;

  totalOrdersProcessed: number;
  totalOrdersCompleted: number;
  totalOrdersCancelled: number;

  totalSystemRevenue: number;
  averageRevenuePerShift: number;
  averageHoursPerShift: number;
  staffPerformance?: {
    staffId: string;
    staffName: string;
    totalShifts: number;
    totalHours: number;
    totalOrders: number;
    totalRevenue: number;
  }[];
}

export interface ShiftCheckOutPayload {
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface StaffReference {
  _id: string;
  name: string;
  staffType: 'cashier' | 'bar' | 'kitchen';
}
export interface StoreReference {
  _id: string;
  name: string;
}

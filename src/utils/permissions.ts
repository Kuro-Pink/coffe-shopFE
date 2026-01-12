import { User } from '@/types';
// ✅ Check if user can access a feature
export const canAccess = (user: User | null, feature: string): boolean => {
  if (!user) return false;
  // Admin has full access
  if (user.role === 'admin') return true;
  // Host permissions
  if (user.role === 'host') {
    const hostFeatures = [
      'dashboard',
      'menu',
      'menu-manage', // CRUD menu
      'tables',
      'tables-manage', // CRUD tables
      'orders',
      'bills',
      'staff',
      'inventory',
      'reports',
    ];
    return hostFeatures.includes(feature);
  }
  // Staff permissions
  if (user.role === 'staff') {
    const staffFeatures = [
      'tables', // View only
      'orders', // View + Update status
      'bills', // Process payment
      'my-shift', // Shift management
      'unpaid-bills', // View unpaid
    ];
    return staffFeatures.includes(feature);
  }
  return false;
};
// ✅ Check if user can manage (CRUD)
export const canManage = (user: User | null, resource: string): boolean => {
  if (!user) return false;
  // Only Host can manage
  if (user.role === 'host') {
    const manageableResources = ['menu', 'tables', 'staff', 'inventory'];
    return manageableResources.includes(resource);
  }
  return false;
};

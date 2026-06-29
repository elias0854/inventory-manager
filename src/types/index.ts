export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'operator';
  createdAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'operator';
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  before: number;
  after: number;
  note: string;
  userId: string;
  username: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  todayInCount: number;
  todayOutCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

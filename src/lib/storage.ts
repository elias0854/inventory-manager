const KEYS = {
  USERS: 'inv_users',
  CURRENT_USER: 'inv_current_user',
  CATEGORIES: 'inv_categories',
  PRODUCTS: 'inv_products',
  STOCK_LOGS: 'inv_stock_logs',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* Users */
import type { User, AuthUser } from '@/types';

export function getUsers(): User[] {
  return read<User[]>(KEYS.USERS, []);
}
export function saveUsers(users: User[]) {
  write(KEYS.USERS, users);
}

export function getCurrentUser(): AuthUser | null {
  return read<AuthUser | null>(KEYS.CURRENT_USER, null);
}
export function saveCurrentUser(user: AuthUser | null) {
  if (user) write(KEYS.CURRENT_USER, user);
  else localStorage.removeItem(KEYS.CURRENT_USER);
}

/* Categories */
import type { Category } from '@/types';

export function getCategories(): Category[] {
  return read<Category[]>(KEYS.CATEGORIES, []);
}
export function saveCategories(cats: Category[]) {
  write(KEYS.CATEGORIES, cats);
}

/* Products */
import type { Product } from '@/types';

export function getProducts(): Product[] {
  return read<Product[]>(KEYS.PRODUCTS, []);
}
export function saveProducts(products: Product[]) {
  write(KEYS.PRODUCTS, products);
}

/* Stock Logs */
import type { StockLog } from '@/types';

export function getStockLogs(): StockLog[] {
  return read<StockLog[]>(KEYS.STOCK_LOGS, []);
}
export function saveStockLogs(logs: StockLog[]) {
  write(KEYS.STOCK_LOGS, logs);
}

/** Helper: generate simple ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Helper: today date string YYYY-MM-DD */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Helper: ISO datetime */
export function nowStr(): string {
  return new Date().toISOString();
}

/** Initialize demo data if storage is empty */
export function initDemoData() {
  const users = getUsers();
  if (users.length === 0) {
    const adminId = generateId();
    saveUsers([
      { id: adminId, username: 'admin', password: 'admin123', role: 'admin', createdAt: nowStr() },
      { id: generateId(), username: 'operator', password: '123456', role: 'operator', createdAt: nowStr() },
    ]);
  }

  const cats = getCategories();
  if (cats.length === 0) {
    saveCategories([
      { id: generateId(), name: '电子产品', createdAt: nowStr() },
      { id: generateId(), name: '办公用品', createdAt: nowStr() },
      { id: generateId(), name: '日用品', createdAt: nowStr() },
      { id: generateId(), name: '食品饮料', createdAt: nowStr() },
    ]);
  }

  const products = getProducts();
  if (products.length === 0) {
    const c = getCategories();
    const sampleProducts: Product[] = [
      { id: generateId(), name: '无线鼠标', sku: 'WM-001', categoryId: c[0]?.id || '', unit: '个', price: 89, stock: 150, minStock: 20, createdAt: nowStr(), updatedAt: nowStr() },
      { id: generateId(), name: '机械键盘', sku: 'MK-002', categoryId: c[0]?.id || '', unit: '个', price: 299, stock: 80, minStock: 10, createdAt: nowStr(), updatedAt: nowStr() },
      { id: generateId(), name: 'USB-C 数据线', sku: 'UC-003', categoryId: c[0]?.id || '', unit: '根', price: 25, stock: 500, minStock: 50, createdAt: nowStr(), updatedAt: nowStr() },
      { id: generateId(), name: 'A4打印纸', sku: 'PA-001', categoryId: c[1]?.id || '', unit: '包', price: 22, stock: 200, minStock: 30, createdAt: nowStr(), updatedAt: nowStr() },
      { id: generateId(), name: '黑色签字笔', sku: 'BP-002', categoryId: c[1]?.id || '', unit: '盒', price: 15, stock: 8, minStock: 10, createdAt: nowStr(), updatedAt: nowStr() },
      { id: generateId(), name: '文件夹', sku: 'FD-003', categoryId: c[1]?.id || '', unit: '个', price: 5, stock: 0, minStock: 20, createdAt: nowStr(), updatedAt: nowStr() },
      { id: generateId(), name: '洗手液', sku: 'HS-001', categoryId: c[2]?.id || '', unit: '瓶', price: 12, stock: 45, minStock: 10, createdAt: nowStr(), updatedAt: nowStr() },
      { id: generateId(), name: '矿泉水', sku: 'MW-001', categoryId: c[3]?.id || '', unit: '箱', price: 36, stock: 120, minStock: 20, createdAt: nowStr(), updatedAt: nowStr() },
    ];
    saveProducts(sampleProducts);
  }
}

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('inv_token');
}

export function setToken(token: string) {
  localStorage.setItem('inv_token', token);
}

export function clearToken() {
  localStorage.removeItem('inv_token');
  localStorage.removeItem('inv_user');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

/* Auth */
export async function apiLogin(username: string, password: string) {
  const res = await request<{ token: string; user: { id: string; username: string; role: string } }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ username, password }),
  });
  setToken(res.token);
  localStorage.setItem('inv_user', JSON.stringify(res.user));
  return res.user;
}

export async function apiRegister(username: string, password: string) {
  const res = await request<{ token: string; user: { id: string; username: string; role: string } }>('/auth/register', {
    method: 'POST', body: JSON.stringify({ username, password }),
  });
  setToken(res.token);
  localStorage.setItem('inv_user', JSON.stringify(res.user));
  return res.user;
}

/* Products */
export async function fetchProducts(params?: { search?: string; category_id?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.category_id && params.category_id !== 'all') qs.set('category_id', params.category_id);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return request<{ data: any[]; total: number; page: number; totalPages: number }>(`/products?${qs}`);
}

export async function createProduct(data: any) {
  return request('/products', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProduct(id: string, data: any) {
  return request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteProduct(id: string) {
  return request(`/products/${id}`, { method: 'DELETE' });
}

export async function batchDeleteProducts(ids: string[]) {
  return request('/products/batch-delete', { method: 'POST', body: JSON.stringify({ ids }) });
}

/* Stock */
export async function stockIn(product_id: string, quantity: number, note?: string) {
  return request('/stock/in', { method: 'POST', body: JSON.stringify({ product_id, quantity, note }) });
}

export async function stockOut(product_id: string, quantity: number, note?: string) {
  return request('/stock/out', { method: 'POST', body: JSON.stringify({ product_id, quantity, note }) });
}

export async function stockCheck(items: { product_id: string; actual: number; apply: boolean }[]) {
  return request('/stock/check', { method: 'POST', body: JSON.stringify({ items }) });
}

/* Logs */
export async function fetchLogs(params?: { product_id?: string; type?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.product_id && params.product_id !== 'all') qs.set('product_id', params.product_id);
  if (params?.type && params.type !== 'all') qs.set('type', params.type);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return request<{ data: any[]; total: number; page: number; totalPages: number }>(`/logs?${qs}`);
}

/* Categories */
export async function fetchCategories() {
  return request<any[]>('/categories');
}

export async function createCategory(name: string) {
  return request('/categories', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function updateCategory(id: string, name: string) {
  return request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
}

export async function deleteCategory(id: string) {
  return request(`/categories/${id}`, { method: 'DELETE' });
}

/* Dashboard */
export async function fetchDashboardStats() {
  return request<any>('/dashboard/stats');
}

export async function fetchChartTrend(days?: number) {
  return request<any[]>(`/dashboard/chart/trend?days=${days || 7}`);
}

export async function fetchChartCategory() {
  return request<any[]>('/dashboard/chart/category');
}

/* Users (admin) */
export async function fetchUsers() {
  return request<any[]>('/users');
}

export async function updateUser(id: string, data: { role?: string; password?: string }) {
  return request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteUser(id: string) {
  return request(`/users/${id}`, { method: 'DELETE' });
}

/* Image */
export async function uploadProductImage(productId: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/products/${productId}/image`, { method: 'POST', headers, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '上传失败');
  return data;
}

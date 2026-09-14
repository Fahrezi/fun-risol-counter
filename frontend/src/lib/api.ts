export interface Food {
  id: string
  name: string
  price: number
  icon: string
}

export interface OrderItem {
  foodId: string
  name: string
  price: number
  qty: number
}

export interface Order {
  id: string
  listName: string
  items: OrderItem[]
  total: number
  createdAt: string
}

export interface Customer {
  id: string
  name: string
}

export interface FoodStock {
  id: string
  name: string
  price: number
  icon: string
  qty: number
  stockDate: string
}

export interface StockHistoryEntry {
  id: number
  foodId: string
  foodName: string
  qty: number
  stockDate: string
  archivedAt: string
}

const BASE = import.meta.env.VITE_API_BASE ?? '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export const api = {
  getFoods: () => request<Food[]>('/foods'),
  createFood: (data: { name: string; price: number; icon?: string }) =>
    request<Food>('/foods', { method: 'POST', body: JSON.stringify(data) }),
  updateFood: (id: string, data: Partial<Pick<Food, 'name' | 'price' | 'icon'>>) =>
    request<Food>(`/foods/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFood: (id: string) => request<{ ok: boolean }>(`/foods/${id}`, { method: 'DELETE' }),

  getOrders: () => request<Order[]>('/orders'),
  createOrder: (data: { listName: string; items: { foodId: string; qty: number }[] }) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  deleteOrder: (id: string) => request<{ ok: boolean }>(`/orders/${id}`, { method: 'DELETE' }),

  getCustomers: () => request<Customer[]>('/customers'),
  createCustomer: (data: { name: string }) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),

  verifySecret: (value: string) =>
    request<{ ok: boolean }>('/auth/verify', { method: 'POST', body: JSON.stringify({ value }) }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  getStock: () => request<FoodStock[]>('/stock'),
  setStock: (foodId: string, qty: number) =>
    request<{ foodId: string; qty: number; stockDate: string }>(`/stock/${foodId}`, {
      method: 'PUT',
      body: JSON.stringify({ qty }),
    }),
  getStockHistory: () => request<StockHistoryEntry[]>('/stock/history'),
}

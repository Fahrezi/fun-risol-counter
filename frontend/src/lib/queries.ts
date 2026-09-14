import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { api, type Food } from './api'

export const queryKeys = {
  foods: ['foods'] as const,
  orders: ['orders'] as const,
  customers: ['customers'] as const,
  stock: ['stock'] as const,
  stockHistory: ['stock-history'] as const,
}

export function useFoodsQuery() {
  return useQuery({ queryKey: queryKeys.foods, queryFn: api.getFoods })
}

export function useOrdersQuery() {
  return useQuery({ queryKey: queryKeys.orders, queryFn: api.getOrders })
}

export function useCustomersQuery() {
  return useQuery({ queryKey: queryKeys.customers, queryFn: api.getCustomers })
}

export function useStockQuery() {
  return useQuery({ queryKey: queryKeys.stock, queryFn: api.getStock })
}

export function useStockHistoryQuery(enabled: MaybeRefOrGetter<boolean>) {
  return useQuery({ queryKey: queryKeys.stockHistory, queryFn: api.getStockHistory, enabled })
}

export function useCreateFoodMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createFood,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.foods }),
  })
}

export function useUpdateFoodMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; data: Partial<Pick<Food, 'name' | 'price' | 'icon'>> }) =>
      api.updateFood(vars.id, vars.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.foods }),
  })
}

export function useDeleteFoodMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteFood,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.foods }),
  })
}

export function useCreateOrderMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders })
      qc.invalidateQueries({ queryKey: queryKeys.stock })
    },
  })
}

export function useDeleteOrderMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders })
      qc.invalidateQueries({ queryKey: queryKeys.stock })
    },
  })
}

export function useCreateCustomerMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers }),
  })
}

export function useSetStockMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { foodId: string; qty: number }) => api.setStock(vars.foodId, vars.qty),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.stock })
      qc.invalidateQueries({ queryKey: queryKeys.stockHistory })
    },
  })
}

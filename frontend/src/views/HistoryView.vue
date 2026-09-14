<script setup lang="ts">
import { computed } from 'vue'
import type { Order } from '../lib/api'
import { useDeleteOrderMutation, useOrdersQuery } from '../lib/queries'

const { data: ordersData } = useOrdersQuery()
const deleteOrder = useDeleteOrderMutation()

const orders = computed(() => ordersData.value ?? [])

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function removeOrder(id: string) {
  deleteOrder.mutate(id)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function dateKey(iso: string) {
  return new Date(iso).toDateString()
}

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const groups = computed(() => {
  const map = new Map<string, Order[]>()
  for (const o of orders.value) {
    const key = dateKey(o.createdAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(o)
  }
  return Array.from(map.values())
    .filter((list) => list.length > 0)
    .map((list) => ({
      label: formatDateLabel(list[0]!.createdAt),
      orders: list,
    }))
})
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Riwayat Pesanan</h2>
    <p v-if="!orders.length" class="empty-text">Belum ada pesanan.</p>
    <div v-for="group in groups" :key="group.label" class="mb-5.5 last:mb-0">
      <h3
        class="inline-block mb-2.5 bg-lime border-[2.5px] border-ink px-2.5 py-1 text-[0.85rem] font-black uppercase text-ink"
      >
        {{ group.label }}
      </h3>
      <ul class="flex flex-col gap-3.5 list-none p-0 m-0">
        <li
          v-for="o in group.orders"
          :key="o.id"
          class="bg-white border-[3px] border-ink shadow-[4px_4px_0_#000] p-3.5"
        >
          <div class="flex justify-between flex-wrap gap-1 mb-1.5">
            <strong class="wrap-break-word">{{ o.listName }}</strong>
            <span class="text-muted text-[0.8rem] font-bold">{{ formatTime(o.createdAt) }}</span>
          </div>
          <ul class="list-none p-0 m-0 mb-2 text-[0.88rem] font-semibold text-ink">
            <li v-for="it in o.items" :key="it.foodId">{{ it.name }} x{{ it.qty }}</li>
          </ul>
          <div class="flex justify-between items-center font-extrabold">
            <span>{{ currency.format(o.total) }}</span>
            <button
              type="button"
              class="bg-cyan border-2 border-ink px-2 py-1 text-ink font-extrabold text-[0.78rem] uppercase cursor-pointer"
              @click="removeOrder(o.id)"
            >
              Hapus
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

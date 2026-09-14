<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Order } from '../lib/api'
import CustomerAvatar from '../components/CustomerAvatar.vue'
import FoodIcon from '../components/FoodIcon.vue'
import { useOrdersQuery, useStockQuery } from '../lib/queries'

type Range = 'daily' | 'weekly' | 'all'

const { data: ordersData } = useOrdersQuery()
const orders = computed(() => ordersData.value ?? [])
const { data: stockData } = useStockQuery()
const stock = computed(() => stockData.value ?? [])
const leaderboardOpen = ref(false)
const stockOpen = ref(false)
const historyCustomer = ref<string | null>(null)
const range = ref<Range>('all')

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const fullDateWeekdayFmt = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatFullDate(iso: string) {
  return fullDateWeekdayFmt.format(new Date(iso))
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function dateKey(iso: string) {
  return new Date(iso).toDateString()
}

function openHistory(name: string) {
  historyCustomer.value = name
}

function closeHistory() {
  historyCustomer.value = null
}

const customerHistoryGroups = computed(() => {
  if (!historyCustomer.value) return []
  const map = new Map<string, Order[]>()
  for (const o of orders.value) {
    if (o.listName !== historyCustomer.value) continue
    const key = dateKey(o.createdAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(o)
  }
  return Array.from(map.values())
    .filter((list) => list.length > 0)
    .map((list) => ({ label: formatFullDate(list[0]!.createdAt), orders: list }))
})

function startOfDay(d: Date) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  return date
}

function endOfDay(d: Date) {
  const date = new Date(d)
  date.setHours(23, 59, 59, 999)
  return date
}

function startOfWeek(d: Date) {
  const date = startOfDay(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

function endOfWeek(d: Date) {
  const start = startOfWeek(d)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return endOfDay(end)
}

const dayFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric' })
const fullDateFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatDateRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  return sameMonth
    ? `${dayFmt.format(start)} - ${fullDateFmt.format(end)}`
    : `${fullDateFmt.format(start)} - ${fullDateFmt.format(end)}`
}

const rangeLabel = computed(() => {
  const now = new Date()
  if (range.value === 'daily') return fullDateFmt.format(now)
  if (range.value === 'weekly') return formatDateRange(startOfWeek(now), endOfWeek(now))
  return ''
})

const buyerSummaries = computed(() => {
  const map = new Map<string, number>()
  for (const o of orders.value) {
    map.set(o.listName, (map.get(o.listName) ?? 0) + o.total)
  }
  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
})

const rangedOrders = computed(() => {
  if (range.value === 'all') return orders.value
  const now = new Date()
  const [from, to] =
    range.value === 'daily' ? [startOfDay(now), endOfDay(now)] : [startOfWeek(now), endOfWeek(now)]
  return orders.value.filter((o) => {
    const t = new Date(o.createdAt).getTime()
    return t >= from.getTime() && t <= to.getTime()
  })
})

const leaderboard = computed(() => {
  const map = new Map<string, number>()
  for (const o of rangedOrders.value) {
    map.set(o.listName, (map.get(o.listName) ?? 0) + o.total)
  }
  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
})

function rankClass(idx: number) {
  if (idx === 0) return 'bg-[#ffd700]'
  if (idx === 1) return 'bg-[#d9d9d9]'
  if (idx === 2) return 'bg-[#cd7f32] text-white'
  return 'bg-cream'
}
</script>

<template>
  <div
    class="min-h-svh bg-cream pt-4 px-3.5 pb-22.5 sm:pt-5 sm:px-5 sm:pb-25"
  >
    <header class="max-w-180 mx-auto mb-5 flex items-center gap-4">
      <router-link
        to="/"
        class="text-ink font-extrabold no-underline border-[2.5px] border-ink bg-white px-3 py-1.5 shadow-[4px_4px_0_#000]"
      >
        &larr; Beranda
      </router-link>
      <h1 class="text-[1.3rem] font-black uppercase m-0">Tanggungan Akhirat</h1>
    </header>

    <div class="max-w-180 mx-auto flex flex-col gap-4">
      <p v-if="!buyerSummaries.length" class="empty-text">Belum ada pembeli.</p>
      <section v-for="b in buyerSummaries" :key="b.name" class="panel mb-0">
        <div class="flex items-center gap-3">
          <CustomerAvatar :name="b.name" :size="48" />
          <div class="flex-1 min-w-0">
            <h3 class="m-0 text-[1.05rem] font-extrabold">{{ b.name }}</h3>
            <p class="mt-0.5 mb-0 font-black text-accent2">{{ currency.format(b.total) }}</p>
          </div>
          <button
            type="button"
            class="icon-btn"
            aria-label="Riwayat Pesanan"
            @click="openHistory(b.name)"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M1 12s4-7.5 11-7.5S23 12 23 12s-4 7.5-11 7.5S1 12 1 12z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
          </button>
        </div>
      </section>
    </div>

    <button
      type="button"
      class="fixed right-5 bottom-5 w-14.5 h-14.5 bg-accent border-[3px] border-ink shadow-[4px_4px_0_#000] flex items-center justify-center cursor-pointer z-40 active:translate-x-1 active:translate-y-1 active:shadow-none"
      aria-label="Orang Baik"
      @click="leaderboardOpen = true"
    >
      <svg viewBox="0 0 24 24" width="26" height="26">
        <rect x="3" y="13" width="4" height="8" fill="#0a0a0a" />
        <rect x="10" y="8" width="4" height="13" fill="#0a0a0a" />
        <rect x="17" y="3" width="4" height="18" fill="#0a0a0a" />
      </svg>
    </button>

    <button
      type="button"
      class="fixed right-5 bottom-22 w-14.5 h-14.5 bg-lime border-[3px] border-ink shadow-[4px_4px_0_#000] flex items-center justify-center cursor-pointer z-40 active:translate-x-1 active:translate-y-1 active:shadow-none"
      aria-label="Sisa Stok"
      @click="stockOpen = true"
    >
      <svg viewBox="0 0 24 24" width="26" height="26">
        <path
          d="M4 8l8-4 8 4-8 4-8-4zm0 0v8l8 4 8-4V8"
          fill="none"
          stroke="#0a0a0a"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <path d="M12 12v8" stroke="#0a0a0a" stroke-width="2" />
      </svg>
    </button>

    <div v-if="stockOpen" class="modal-overlay" @click.self="stockOpen = false">
      <div class="modal-box">
        <div class="modal-head">
          <h3>Sisa Stok</h3>
          <button type="button" class="modal-close" @click="stockOpen = false">X</button>
        </div>

        <p v-if="stock.length" class="text-[0.8rem] font-bold text-muted mb-3">
          {{ formatFullDate(stock[0]!.stockDate) }}
        </p>
        <p v-if="!stock.length" class="empty-text">Belum ada menu.</p>
        <ul class="list-none m-0 p-0 flex flex-col gap-2.5">
          <li
            v-for="s in stock"
            :key="s.id"
            class="flex items-center gap-3 border-2 border-ink px-3 py-2 bg-white"
          >
            <FoodIcon :icon="s.icon" :size="32" />
            <span class="font-bold flex-1">{{ s.name }}</span>
            <span
              class="font-black text-[0.85rem] uppercase"
              :class="s.qty > 0 ? 'text-ink' : 'text-accent2'"
            >
              {{ s.qty > 0 ? `Sisa ${s.qty}` : 'Habis' }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="leaderboardOpen" class="modal-overlay" @click.self="leaderboardOpen = false">
      <div class="modal-box">
        <div class="modal-head">
          <h3>Orang Baik</h3>
          <button type="button" class="modal-close" @click="leaderboardOpen = false">X</button>
        </div>

        <div class="flex gap-2 mb-4">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: range === 'daily' }"
            @click="range = 'daily'"
          >
            Daily
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: range === 'weekly' }"
            @click="range = 'weekly'"
          >
            Weekly
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: range === 'all' }"
            @click="range = 'all'"
          >
            All Time
          </button>
        </div>

        <p v-if="rangeLabel" class="text-center font-extrabold text-[0.8rem] text-muted uppercase mb-3.5">
          {{ rangeLabel }}
        </p>

        <p v-if="!leaderboard.length" class="empty-text">Belum ada data.</p>
        <ul class="list-none m-0 p-0 flex flex-col gap-2.5">
          <li
            v-for="(c, idx) in leaderboard"
            :key="c.name"
            class="flex items-center gap-3 border-2 border-ink px-3 py-2 bg-white"
          >
            <span
              class="w-6.5 h-6.5 shrink-0 flex items-center justify-center font-black text-[0.85rem] border-2 border-ink"
              :class="rankClass(idx)"
            >
              <svg v-if="idx === 0" viewBox="0 0 24 24" width="18" height="18">
                <path d="M2 19h20l-1.6-9-4.4 3.2L12 6l-4 7.2L3.6 10 2 19z" fill="#0a0a0a" />
              </svg>
              <template v-else>{{ idx + 1 }}</template>
            </span>
            <CustomerAvatar :name="c.name" :size="36" />
            <span class="font-bold">{{ c.name }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="historyCustomer" class="modal-overlay" @click.self="closeHistory">
      <div class="modal-box">
        <div class="modal-head">
          <h3>Riwayat {{ historyCustomer }}</h3>
          <button type="button" class="modal-close" @click="closeHistory">X</button>
        </div>

        <p v-if="!customerHistoryGroups.length" class="empty-text">Belum ada pesanan.</p>
        <div v-for="group in customerHistoryGroups" :key="group.label" class="mb-5 last:mb-0">
          <h4
            class="inline-block mb-2.5 bg-lime border-[2.5px] border-ink px-2.5 py-1 text-[0.8rem] font-black uppercase text-ink"
          >
            {{ group.label }}
          </h4>
          <ul class="list-none p-0 m-0 flex flex-col gap-2.5">
            <li v-for="o in group.orders" :key="o.id" class="bg-white border-2 border-ink px-3 py-2">
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-muted text-[0.78rem] font-bold">{{ formatTime(o.createdAt) }}</span>
                <span class="font-black">{{ currency.format(o.total) }}</span>
              </div>
              <ul class="list-none p-0 m-0 text-[0.85rem] font-semibold text-ink">
                <li v-for="it in o.items" :key="it.foodId">{{ it.name }} x{{ it.qty }}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

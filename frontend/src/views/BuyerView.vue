<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, type Order } from '../lib/api'
import CustomerAvatar from '../components/CustomerAvatar.vue'

type Range = 'daily' | 'weekly' | 'all'

const orders = ref<Order[]>([])
const leaderboardOpen = ref(false)
const range = ref<Range>('all')

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function maskCurrency(amount: number) {
  return currency.format(amount).replace(/\d/g, 'X')
}

onMounted(async () => {
  orders.value = await api.getOrders()
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
          <div>
            <h3 class="m-0 text-[1.05rem] font-extrabold">{{ b.name }}</h3>
            <p class="mt-0.5 mb-0 font-black text-accent2">{{ maskCurrency(b.total) }}</p>
          </div>
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
  </div>
</template>

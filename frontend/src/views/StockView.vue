<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FoodStock } from '../lib/api'
import FoodIcon from '../components/FoodIcon.vue'
import { useSetStockMutation, useStockHistoryQuery, useStockQuery } from '../lib/queries'

const { data: stockData } = useStockQuery()
const setStock = useSetStockMutation()

const stock = computed(() => stockData.value ?? [])
const drafts = ref<Record<string, number>>({})
const savedId = ref<string | null>(null)
const errorMsg = ref('')

const showHistory = ref(false)
const { data: historyData } = useStockHistoryQuery(showHistory)
const history = computed(() => historyData.value ?? [])

watch(
  stock,
  (list) => {
    for (const s of list) {
      if (!(s.id in drafts.value)) drafts.value[s.id] = s.qty
    }
  },
  { immediate: true },
)

function formatDateLabel(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

async function saveStock(f: FoodStock) {
  errorMsg.value = ''
  const qty = drafts.value[f.id] ?? 0
  if (qty < 0) {
    errorMsg.value = 'Stok tidak boleh minus.'
    return
  }
  try {
    await setStock.mutateAsync({ foodId: f.id, qty })
    savedId.value = f.id
    setTimeout(() => {
      if (savedId.value === f.id) savedId.value = null
    }, 1200)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Gagal menyimpan stok.'
  }
}

function toggleHistory() {
  showHistory.value = !showHistory.value
}
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Stok Menu Hari Ini</h2>
    <p v-if="errorMsg" class="error-text mb-2">{{ errorMsg }}</p>
    <p v-if="stock.length" class="text-[0.8rem] font-bold text-muted mb-3">
      {{ formatDateLabel(stock[0]!.stockDate) }}
    </p>
    <p v-if="!stock.length" class="empty-text">Belum ada menu. Tambah menu dulu di halaman Dashboard.</p>

    <div class="flex flex-col gap-3">
      <div
        v-for="f in stock"
        :key="f.id"
        class="flex items-center gap-3 p-2.5 bg-white border-[3px] border-ink"
      >
        <FoodIcon :icon="f.icon" :size="32" />
        <div class="flex-1 flex flex-col gap-0.5 min-w-0">
          <span
            class="font-extrabold text-[0.95rem] text-ink overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {{ f.name }}
          </span>
          <span class="text-[0.8rem] font-bold text-muted">Sisa saat ini: {{ f.qty }}</span>
        </div>
        <input
          v-model.number="drafts[f.id]"
          type="number"
          min="0"
          class="input-inset w-20 text-center"
        />
        <button
          type="button"
          class="btn-primary w-auto"
          :class="{ 'bg-lime': savedId === f.id }"
          @click="saveStock(f)"
        >
          {{ savedId === f.id ? 'Tersimpan' : 'Simpan' }}
        </button>
      </div>
    </div>

    <button
      type="button"
      class="mt-6 bg-white border-[3px] border-ink px-3 py-2 text-ink font-extrabold text-[0.78rem] uppercase cursor-pointer"
      @click="toggleHistory"
    >
      {{ showHistory ? 'Sembunyikan Riwayat Stok' : 'Lihat Riwayat Stok' }}
    </button>

    <div v-if="showHistory" class="mt-4">
      <p v-if="!history.length" class="empty-text">Belum ada riwayat stok.</p>
      <ul class="flex flex-col gap-2 list-none p-0 m-0">
        <li
          v-for="h in history"
          :key="h.id"
          class="flex justify-between items-center bg-white border-2 border-ink px-2.5 py-2 text-[0.85rem] font-semibold text-ink"
        >
          <span>{{ h.foodName }}</span>
          <span class="text-muted">{{ formatDateLabel(h.stockDate) }}</span>
          <span class="font-extrabold">Sisa {{ h.qty }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

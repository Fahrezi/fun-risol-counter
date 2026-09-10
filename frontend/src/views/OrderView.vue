<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, type Customer, type Food, type Order } from '../lib/api'
import FoodIcon from '../components/FoodIcon.vue'
import CustomerAvatar from '../components/CustomerAvatar.vue'

const router = useRouter()

const foods = ref<Food[]>([])
const orders = ref<Order[]>([])
const customers = ref<Customer[]>([])
const selectedCustomerName = ref('')
const pickerOpen = ref(false)
const draft = reactive<Record<string, number>>({})
const pileExpanded = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

async function load() {
  foods.value = await api.getFoods()
  orders.value = await api.getOrders()
  customers.value = await api.getCustomers()
}

onMounted(load)

const loyalCustomers = computed(() => {
  const map = new Map<string, { count: number; total: number }>()
  for (const o of orders.value) {
    const cur = map.get(o.listName) ?? { count: 0, total: 0 }
    cur.count += 1
    cur.total += o.total
    map.set(o.listName, cur)
  }
  return Array.from(map.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count || b.total - a.total)
    .slice(0, 4)
})

function openPicker() {
  pickerOpen.value = true
}

function closePicker() {
  pickerOpen.value = false
}

function pickCustomer(name: string) {
  selectedCustomerName.value = name
  pickerOpen.value = false
}

function goAddCustomer() {
  router.push('/owner/customers/new')
}

function qtyOf(foodId: string) {
  return draft[foodId] ?? 0
}

function addToBasket(foodId: string) {
  draft[foodId] = (draft[foodId] ?? 0) + 1
}

function decFromBasket(foodId: string) {
  const next = (draft[foodId] ?? 0) - 1
  if (next <= 0) delete draft[foodId]
  else draft[foodId] = next
}

const draftItems = computed(() =>
  foods.value
    .filter((f) => qtyOf(f.id) > 0)
    .map((f) => ({ food: f, qty: qtyOf(f.id), subtotal: f.price * qtyOf(f.id) })),
)

const draftTotal = computed(() => draftItems.value.reduce((sum, i) => sum + i.subtotal, 0))

async function submitOrder() {
  errorMsg.value = ''
  if (!selectedCustomerName.value) {
    errorMsg.value = 'Pilih nama pemesan dulu.'
    return
  }
  if (!draftItems.value.length) {
    errorMsg.value = 'Pilih minimal satu makanan.'
    return
  }
  submitting.value = true
  try {
    await api.createOrder({
      listName: selectedCustomerName.value,
      items: draftItems.value.map((i) => ({ foodId: i.food.id, qty: i.qty })),
    })
    selectedCustomerName.value = ''
    pileExpanded.value = false
    for (const key of Object.keys(draft)) delete draft[key]
    await load()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Gagal menyimpan pesanan.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Buat Pesanan</h2>
    <span class="field">
      <span>Nama Pemesan</span>
      <button
        type="button"
        class="input-base text-left cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none"
        @click="openPicker"
      >
        {{ selectedCustomerName || 'Pilih pelanggan' }}
      </button>
    </span>

    <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:gap-3.5">
      <button
        v-for="f in foods"
        :key="f.id"
        type="button"
        class="relative flex flex-col items-center gap-2 text-center bg-white border-[3px] border-ink shadow-[4px_4px_0_#000] py-4.5 px-3 cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none"
        @click="addToBasket(f.id)"
      >
        <span
          v-if="qtyOf(f.id) > 0"
          class="absolute -top-2.5 -right-2.5 min-w-6 h-6 px-1.5 bg-accent2 text-white text-[0.78rem] font-black flex items-center justify-center border-[2.5px] border-white"
        >
          {{ qtyOf(f.id) }}
        </span>
        <FoodIcon :icon="f.icon" :size="40" />
        <span class="font-extrabold text-[0.92rem] text-ink">{{ f.name }}</span>
        <span class="font-bold text-[0.78rem] text-muted">{{ currency.format(f.price) }}</span>
      </button>
    </div>
  </section>

  <div v-if="pickerOpen" class="modal-overlay" @click.self="closePicker">
    <div class="modal-box">
      <div class="modal-head">
        <h3>Pilih Pelanggan</h3>
        <button type="button" class="modal-close" @click="closePicker">X</button>
      </div>

      <div v-if="loyalCustomers.length" class="mb-5">
        <h4 class="text-[0.82rem] font-black uppercase text-muted mb-2.5">Pelanggan Setia</h4>
        <div class="grid grid-cols-2 gap-3 mb-1">
          <button
            v-for="c in loyalCustomers"
            :key="c.name"
            type="button"
            class="relative flex flex-col items-center gap-1.5 text-center py-3.5 px-2 bg-[linear-gradient(160deg,#ffe28a,#ffc636)] border-[3px] border-ink shadow-[4px_4px_0_#000] cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none"
            @click="pickCustomer(c.name)"
          >
            <CustomerAvatar :name="c.name" :size="48" />
            <span class="font-extrabold text-[0.85rem] text-ink">{{ c.name }}</span>
            <span class="text-[0.72rem] font-bold text-[#6b4a00]">{{ c.count }}x order</span>
          </button>
        </div>
      </div>

      <h4 class="text-[0.82rem] font-black uppercase text-muted mb-2.5">Semua Pelanggan</h4>
      <p v-if="!customers.length" class="empty-text mb-3">Belum ada pelanggan.</p>
      <div class="grid grid-cols-2 gap-3 mb-5">
        <button
          v-for="c in customers"
          :key="c.id"
          type="button"
          class="flex flex-col items-center gap-1.5 text-center py-3.5 px-2 bg-white border-[3px] border-ink shadow-[4px_4px_0_#000] cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none"
          @click="pickCustomer(c.name)"
        >
          <CustomerAvatar :name="c.name" :size="56" />
          <span class="font-bold text-[0.85rem] text-ink">{{ c.name }}</span>
        </button>
      </div>

      <button type="button" class="btn-primary" @click="goAddCustomer">
        + Tambah Pelanggan Baru
      </button>
    </div>
  </div>

  <div
    v-if="draftItems.length"
    class="fixed left-1/2 -translate-x-1/2 bottom-3 w-[min(94vw,420px)] sm:bottom-5 sm:w-[min(92vw,420px)] bg-ink text-white border-[3px] border-ink shadow-[6px_6px_0_#ff4d6d] overflow-hidden z-40"
  >
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2.5 px-4.5 py-3.5 bg-transparent border-none text-white cursor-pointer"
      @click="pileExpanded = !pileExpanded"
    >
      <span class="font-black text-[0.92rem] whitespace-nowrap overflow-hidden text-ellipsis">
        {{ selectedCustomerName || 'Pesanan' }}
      </span>
      <span class="flex items-center gap-2.5 shrink-0">
        <span
          v-for="i in draftItems"
          :key="i.food.id"
          class="relative flex bg-white/10 p-0.75"
        >
          <FoodIcon :icon="i.food.icon" :size="20" />
          <span
            class="absolute -bottom-1 -right-1 min-w-3.75 h-3.75 px-0.75 bg-accent2 text-white text-[0.62rem] font-black flex items-center justify-center border-2 border-ink"
          >
            {{ i.qty }}
          </span>
        </span>
      </span>
    </button>
    <div v-if="pileExpanded" class="px-4.5 pb-4.5">
      <ul class="list-none m-0 mb-2.5 p-0 flex flex-col gap-1.5 text-[0.9rem] font-bold max-h-55 overflow-y-auto">
        <li v-for="i in draftItems" :key="i.food.id" class="flex justify-between items-center">
          <span>{{ i.food.name }}</span>
          <span class="flex items-center gap-2">
            <button
              type="button"
              class="w-6 h-6 border-2 border-white bg-accent2 text-white font-black cursor-pointer"
              @click="decFromBasket(i.food.id)"
            >
              -
            </button>
            {{ i.qty }}x
          </span>
        </li>
      </ul>
      <div class="flex justify-between font-black border-t-2 border-white/25 pt-2.5 mb-3 uppercase">
        <span>Total</span>
        <span>{{ currency.format(draftTotal) }}</span>
      </div>
      <p v-if="errorMsg" class="text-[#ff8a80] text-[0.85rem] font-bold mb-2">{{ errorMsg }}</p>
      <button
        type="button"
        class="w-full bg-accent text-ink border-[3px] border-ink px-4.5 py-3.25 font-black uppercase cursor-pointer shadow-[4px_4px_0_#ff4d6d] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:cursor-default"
        :disabled="submitting"
        @click="submitOrder"
      >
        Simpan Pesanan
      </button>
    </div>
  </div>
</template>

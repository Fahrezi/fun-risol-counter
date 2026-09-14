<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { type Food } from '../lib/api'
import FoodIcon from '../components/FoodIcon.vue'
import {
  queryKeys,
  useCreateFoodMutation,
  useDeleteFoodMutation,
  useFoodsQuery,
  useUpdateFoodMutation,
} from '../lib/queries'

const queryClient = useQueryClient()

const ICON_OPTIONS = [
  { value: 'risol-mayo', label: 'Risol Mayo' },
  { value: 'risol-sayur', label: 'Risol Sayur' },
  { value: 'pisang-coklat', label: 'Pisang Coklat' },
  { value: 'ketan-serundeng', label: 'Ketan Serundeng' },
  { value: 'generic', label: 'Umum' },
]

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const { data: foodsData } = useFoodsQuery()
const createFood = useCreateFoodMutation()
const updateFood = useUpdateFoodMutation()
const deleteFood = useDeleteFoodMutation()

const foods = computed(() => foodsData.value ?? [])
const errorMsg = ref('')
const newFood = ref({ name: '', price: 0, icon: 'generic' })

const editing = ref<Food | null>(null)
const editForm = ref({ name: '', price: 0, icon: 'generic' })
const editError = ref('')

const deleteTarget = ref<Food | null>(null)

function openEdit(f: Food) {
  editing.value = f
  editForm.value = { name: f.name, price: f.price, icon: f.icon }
  editError.value = ''
}

function closeEdit() {
  editing.value = null
}

async function submitEdit() {
  if (!editing.value) return
  editError.value = ''
  if (!editForm.value.name.trim() || editForm.value.price <= 0) {
    editError.value = 'Isi nama dan harga (lebih dari 0).'
    return
  }
  try {
    await updateFood.mutateAsync({
      id: editing.value.id,
      data: {
        name: editForm.value.name.trim(),
        price: editForm.value.price,
        icon: editForm.value.icon,
      },
    })
    editing.value = null
    await queryClient.invalidateQueries({ queryKey: queryKeys.foods })
  } catch (e) {
    editError.value = e instanceof Error ? e.message : 'Gagal menyimpan.'
  }
}

function confirmDelete(f: Food) {
  deleteTarget.value = f
}

function cancelDelete() {
  deleteTarget.value = null
}

async function removeFood() {
  if (!deleteTarget.value) return
  await deleteFood.mutateAsync(deleteTarget.value.id)
  deleteTarget.value = null
  await queryClient.invalidateQueries({ queryKey: queryKeys.foods })
}

async function addFood() {
  errorMsg.value = ''
  if (!newFood.value.name.trim() || newFood.value.price <= 0) {
    errorMsg.value = 'Isi nama dan harga (lebih dari 0).'
    return
  }
  await createFood.mutateAsync({ ...newFood.value })
  newFood.value = { name: '', price: 0, icon: 'generic' }
  await queryClient.invalidateQueries({ queryKey: queryKeys.foods })
}
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Kelola Menu &amp; Harga</h2>
    <p v-if="errorMsg" class="error-text mb-2">{{ errorMsg }}</p>

    <div class="flex flex-col gap-3 mb-5.5">
      <div
        v-for="f in foods"
        :key="f.id"
        class="flex items-center gap-3 p-2.5 bg-white border-[3px] border-ink"
      >
        <FoodIcon :icon="f.icon" :size="32" />
        <div class="flex-1 flex flex-col gap-0.5 min-w-0">
          <span class="font-extrabold text-[0.95rem] text-ink overflow-hidden text-ellipsis whitespace-nowrap">
            {{ f.name }}
          </span>
          <span class="font-bold text-[0.82rem] text-muted">{{ currency.format(f.price) }}</span>
        </div>
        <button type="button" class="icon-btn" aria-label="Edit" @click="openEdit(f)">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M4 17.25V20h2.75L16.81 9.94l-2.75-2.75L4 17.25zM18.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.5 1.5 3.75 3.75 1.5-1.5z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          type="button"
          class="icon-btn icon-btn-danger"
          aria-label="Hapus"
          @click="confirmDelete(f)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path
              d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M6 7h12l-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7z"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>
    </div>

    <h3 class="mt-6 mb-3 text-[1rem] font-black uppercase">Tambah Menu Baru</h3>
    <div class="flex gap-2.5 items-center flex-wrap">
      <input
        v-model="newFood.name"
        type="text"
        placeholder="Nama makanan"
        class="input-inset flex-1 min-w-30"
      />
      <input
        v-model.number="newFood.price"
        type="number"
        min="0"
        placeholder="Harga"
        class="input-inset flex-1 min-w-30"
      />
      <select v-model="newFood.icon" class="input-base select-arrow flex-1 min-w-30">
        <option v-for="opt in ICON_OPTIONS" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <FoodIcon :icon="newFood.icon" :size="32" />
      <button type="button" class="btn-primary w-auto" @click="addFood">Tambah</button>
    </div>
  </section>

  <div v-if="editing" class="modal-overlay" @click.self="closeEdit">
    <div class="modal-box">
      <div class="modal-head">
        <h3>Edit Menu</h3>
        <button type="button" class="modal-close" @click="closeEdit">X</button>
      </div>

      <label class="field">
        <span>Nama</span>
        <input v-model="editForm.name" type="text" class="input-inset" />
      </label>
      <label class="field">
        <span>Icon</span>
        <select v-model="editForm.icon" class="input-base select-arrow">
          <option v-for="opt in ICON_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>
      <label class="field">
        <span>Harga</span>
        <input v-model.number="editForm.price" type="number" min="0" class="input-inset" />
      </label>
      <FoodIcon :icon="editForm.icon" :size="32" />

      <p v-if="editError" class="error-text mt-2 mb-2">{{ editError }}</p>
      <div class="modal-actions">
        <button type="button" class="btn-cancel" @click="closeEdit">Batal</button>
        <button type="button" class="btn-primary" @click="submitEdit">Simpan</button>
      </div>
    </div>
  </div>

  <div v-if="deleteTarget" class="modal-overlay" @click.self="cancelDelete">
    <div class="modal-box">
      <div class="modal-head">
        <h3>Hapus Menu</h3>
        <button type="button" class="modal-close" @click="cancelDelete">X</button>
      </div>
      <p class="mb-4 text-[0.95rem] font-semibold text-ink">
        Yakin hapus <strong>{{ deleteTarget.name }}</strong> dari menu?
      </p>
      <div class="modal-actions">
        <button type="button" class="btn-cancel" @click="cancelDelete">Batal</button>
        <button type="button" class="btn-primary btn-danger" @click="removeFood">Hapus</button>
      </div>
    </div>
  </div>
</template>

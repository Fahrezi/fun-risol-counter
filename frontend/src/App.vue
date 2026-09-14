<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { api } from './lib/api'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const logoutConfirmOpen = ref(false)
const loggingOut = ref(false)

function requestLogout() {
  logoutConfirmOpen.value = true
}

function cancelLogout() {
  logoutConfirmOpen.value = false
}

async function confirmLogout() {
  loggingOut.value = true
  try {
    await api.logout()
  } finally {
    queryClient.clear()
    loggingOut.value = false
    logoutConfirmOpen.value = false
    router.push('/yang-punya')
  }
}
</script>

<template>
  <div v-if="!route.meta.bare" class="min-h-svh max-w-[880px] mx-auto px-3 pb-[140px] sm:px-4 sm:pb-[120px]">
    <header class="flex items-center justify-between py-3.5 mb-4 flex-wrap gap-3 sm:py-[22px] sm:mb-6">
      <div class="flex items-center gap-3">
        <router-link to="/" class="flex items-center gap-3 no-underline text-ink">
          <span
            class="shine-sweep relative flex items-center justify-center w-[46px] h-[46px] bg-accent border-[3px] border-ink shadow-[4px_4px_0_#000] font-black text-[0.95rem] text-ink flex-shrink-0"
          >
            DL
          </span>
          <span class="flex flex-col justify-center leading-[1.2]">
            <span class="text-[1.3rem] sm:text-[1.8rem] font-black uppercase tracking-[0.02em] text-ink">
              Dagangan Luthfi
            </span>
          </span>
        </router-link>
        <button
          type="button"
          class="shrink-0 bg-white border-[2.5px] border-ink px-3 py-1.5 text-ink font-extrabold text-[0.72rem] sm:text-[0.78rem] uppercase cursor-pointer shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          @click="requestLogout"
        >
          Keluar
        </button>
      </div>
      <nav class="flex gap-1.5 bg-white p-[5px] border-[3px] border-ink shadow-[4px_4px_0_#000]">
        <router-link
          to="/owner"
          exact-active-class="bg-accent"
          class="px-3 sm:px-4 py-2 no-underline text-ink font-extrabold text-[0.78rem] sm:text-[0.85rem] uppercase"
        >
          Pesanan
        </router-link>
        <router-link
          to="/owner/history"
          exact-active-class="bg-accent"
          class="px-3 sm:px-4 py-2 no-underline text-ink font-extrabold text-[0.78rem] sm:text-[0.85rem] uppercase"
        >
          Riwayat
        </router-link>
        <router-link
          to="/owner/dashboard"
          exact-active-class="bg-accent"
          class="px-3 sm:px-4 py-2 no-underline text-ink font-extrabold text-[0.78rem] sm:text-[0.85rem] uppercase"
        >
          Dashboard
        </router-link>
        <router-link
          to="/owner/stock"
          exact-active-class="bg-accent"
          class="px-3 sm:px-4 py-2 no-underline text-ink font-extrabold text-[0.78rem] sm:text-[0.85rem] uppercase"
        >
          Stok
        </router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>

    <div v-if="logoutConfirmOpen" class="modal-overlay" @click.self="cancelLogout">
      <div class="modal-box">
        <div class="modal-head">
          <h3>Keluar</h3>
          <button type="button" class="modal-close" @click="cancelLogout">X</button>
        </div>
        <p class="mb-4 text-[0.95rem] font-semibold text-ink">Yakin mau keluar?</p>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" :disabled="loggingOut" @click="cancelLogout">
            Batal
          </button>
          <button
            type="button"
            class="btn-primary btn-danger"
            :disabled="loggingOut"
            @click="confirmLogout"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  </div>
  <router-view v-else />
</template>

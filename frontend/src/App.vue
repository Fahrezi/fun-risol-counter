<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div v-if="!route.meta.bare" class="min-h-svh max-w-[880px] mx-auto px-3 pb-[140px] sm:px-4 sm:pb-[120px]">
    <header class="flex items-center justify-between py-3.5 mb-4 flex-wrap gap-3 sm:py-[22px] sm:mb-6">
      <router-link to="/" class="flex items-center gap-3 no-underline text-ink">
        <span
          class="shine-sweep relative flex items-center justify-center w-[46px] h-[46px] bg-accent border-[3px] border-ink shadow-[4px_4px_0_#000] font-black text-[0.95rem] text-ink flex-shrink-0"
        >
          MM
        </span>
        <span class="flex flex-col justify-center leading-[1.2]">
          <span class="text-[1.3rem] sm:text-[1.8rem] font-black uppercase tracking-[0.02em] text-ink">
            MMDG
          </span>
          <span class="text-[0.7rem] sm:text-[0.78rem] font-bold text-muted">My Mine Dagangan Gueh</span>
        </span>
      </router-link>
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
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
  <router-view v-else />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-svh flex items-center justify-center p-4 bg-cream">
    <div class="panel w-full max-w-105 mb-0 text-center">
      <h2 class="panel-title">403 — Dilarang Masuk</h2>
      <p class="mb-5 text-[0.95rem] font-semibold text-ink">
        Sesi kamu tidak ditemukan atau sudah habis. Masuk dulu pakai kata rahasia.
      </p>
      <button type="button" class="btn-primary" @click="router.replace('/yang-punya')">
        Ke Halaman Masuk
      </button>
    </div>
  </div>
</template>

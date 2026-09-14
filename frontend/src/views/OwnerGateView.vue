<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../lib/api'
import { hasSessionCookie } from '../lib/auth'

const secret = ref('')
const errorMsg = ref('')
const submitting = ref(false)
const router = useRouter()

onMounted(() => {
  if (hasSessionCookie()) router.replace('/owner')
})

async function submit() {
  errorMsg.value = ''
  if (!secret.value) {
    errorMsg.value = 'Isi kata rahasia dulu.'
    return
  }
  submitting.value = true
  try {
    const res = await api.verifySecret(secret.value)
    if (res.ok) {
      router.push('/owner')
    } else {
      errorMsg.value = 'Kata rahasia salah.'
    }
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Gagal verifikasi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-svh flex flex-col items-center justify-center gap-5 p-4 bg-cream">
    <router-link to="/" class="flex items-center gap-3 no-underline text-ink">
      <span
        class="shine-sweep relative flex items-center justify-center w-11.5 h-11.5 bg-accent border-[3px] border-ink shadow-[4px_4px_0_#000] font-black text-[0.95rem] text-ink shrink-0"
      >
        DL
      </span>
      <span class="text-[1.3rem] font-black uppercase tracking-[0.02em] text-ink">
        Dagangan Luthfi
      </span>
    </router-link>

    <div class="panel w-full max-w-105 mb-0">
      <h2 class="panel-title">Yang Punya</h2>
      <label class="field">
        <span>Kata Rahasia</span>
        <input
          v-model="secret"
          type="password"
          placeholder="Kata rahasia"
          class="input-base"
          @keyup.enter="submit"
        />
      </label>
      <p class="-mt-2 mb-4 text-[0.8rem] font-bold text-muted italic">Luthfi Ganteng</p>
      <p v-if="errorMsg" class="error-text mb-2">{{ errorMsg }}</p>
      <button type="button" class="btn-primary" :disabled="submitting" @click="submit">
        Masuk
      </button>
    </div>
  </div>
</template>

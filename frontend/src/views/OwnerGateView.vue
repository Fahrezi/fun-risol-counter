<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../lib/api'

const secret = ref('')
const errorMsg = ref('')
const submitting = ref(false)
const router = useRouter()

onMounted(() => {
  if (localStorage.getItem('mmdg-unlocked') === '1') router.replace('/owner')
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
      localStorage.setItem('mmdg-unlocked', '1')
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
  <div class="min-h-svh flex items-center justify-center p-4 bg-cream">
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

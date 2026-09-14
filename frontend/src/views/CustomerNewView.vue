<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateCustomerMutation } from '../lib/queries'

const name = ref('')
const errorMsg = ref('')
const router = useRouter()
const createCustomer = useCreateCustomerMutation()
const submitting = createCustomer.isPending

async function submit() {
  errorMsg.value = ''
  if (!name.value.trim()) {
    errorMsg.value = 'Nama tidak boleh kosong.'
    return
  }
  try {
    await createCustomer.mutateAsync({ name: name.value.trim() })
    router.push('/owner')
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Gagal menyimpan pelanggan.'
  }
}
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Tambah Pelanggan Baru</h2>
    <label class="field">
      <span>Nama Pelanggan</span>
      <input
        v-model="name"
        type="text"
        placeholder="Nama pelanggan"
        class="input-base"
        @keyup.enter="submit"
      />
    </label>
    <p v-if="errorMsg" class="error-text mb-2">{{ errorMsg }}</p>
    <button type="button" class="btn-primary" :disabled="submitting" @click="submit">
      Simpan
    </button>
  </section>
</template>

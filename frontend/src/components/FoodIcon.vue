<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ icon: string; size?: number }>(), { size: 40 })

const ICON_FILES: Record<string, string> = {
  'risol-mayo': 'risol-mayo.png',
  'risol-sayur': 'risol-sayur.png',
  'pisang-coklat': 'pisang-coklat.png',
  'ketan-serundeng': 'ketan.png',
}

const src = computed(() => {
  const file = ICON_FILES[props.icon]
  return file ? `/icons/${file}` : null
})
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :width="size"
    :height="size"
    :alt="icon"
    class="object-contain"
  >
  <svg v-else :width="size" :height="size" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="16" fill="#E8DCC8" stroke="#C9B98F" stroke-width="1.5" />
    <circle cx="24" cy="24" r="9" fill="none" stroke="#C9B98F" stroke-width="1.5" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ icon: string; size?: number }>(), { size: 40 })
</script>

<template>
  <svg
    v-if="icon === 'risol-mayo'"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="6" y="16" width="36" height="18" rx="9" fill="#E3A857" stroke="#B97A2A" stroke-width="1.5" />
    <path d="M10 20c2 2 4-2 6 0s4-2 6 0 4-2 6 0 4-2 6 0 4-2 6 0" stroke="#FFFDF5" stroke-width="2.2" fill="none" stroke-linecap="round" />
    <path d="M10 26c2 2 4-2 6 0s4-2 6 0 4-2 6 0 4-2 6 0 4-2 6 0" stroke="#FFFDF5" stroke-width="2.2" fill="none" stroke-linecap="round" />
  </svg>
  <svg
    v-else-if="icon === 'risol-sayur'"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="6" y="16" width="36" height="18" rx="9" fill="#E3A857" stroke="#B97A2A" stroke-width="1.5" />
    <circle cx="14" cy="22" r="1.6" fill="#6FA84B" />
    <circle cx="20" cy="27" r="1.6" fill="#6FA84B" />
    <circle cx="26" cy="21" r="1.6" fill="#6FA84B" />
    <circle cx="32" cy="26" r="1.6" fill="#6FA84B" />
    <circle cx="38" cy="22" r="1.6" fill="#6FA84B" />
    <circle cx="17" cy="24" r="1.3" fill="#E2764B" />
    <circle cx="29" cy="24" r="1.3" fill="#E2764B" />
  </svg>
  <svg
    v-else-if="icon === 'pisang-coklat'"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 8 L42 38 L6 38 Z" fill="#E8B860" stroke="#B97A2A" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M14 30c2-3 4 3 6 0s4 3 6 0 4 3 6 0" stroke="#5B3A29" stroke-width="2.2" fill="none" stroke-linecap="round" />
    <path d="M18 22c1.5-2 3 2 4.5 0s3-2 4.5 0" stroke="#5B3A29" stroke-width="2" fill="none" stroke-linecap="round" />
  </svg>
  <svg
    v-else-if="icon === 'ketan-serundeng'"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="24" cy="36" rx="18" ry="5" fill="#5E8C4B" />
    <path d="M10 34c0-9 6-16 14-16s14 7 14 16" fill="#FBF6E8" stroke="#E4DBBF" stroke-width="1.2" />
    <circle cx="16" cy="28" r="1.4" fill="#9C6B2E" />
    <circle cx="21" cy="23" r="1.4" fill="#9C6B2E" />
    <circle cx="27" cy="24" r="1.4" fill="#9C6B2E" />
    <circle cx="32" cy="29" r="1.4" fill="#9C6B2E" />
    <circle cx="24" cy="30" r="1.4" fill="#9C6B2E" />
  </svg>
  <svg v-else :width="size" :height="size" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="16" fill="#E8DCC8" stroke="#C9B98F" stroke-width="1.5" />
    <circle cx="24" cy="24" r="9" fill="none" stroke="#C9B98F" stroke-width="1.5" />
  </svg>
</template>

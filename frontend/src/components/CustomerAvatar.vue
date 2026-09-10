<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 48 })

const PALETTE = ['#ffd400', '#ff4d6d', '#4ddbff', '#a6ff4d', '#b983ff', '#ff9f45']

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const first = parts[0]?.[0] ?? ''
  const second = parts.length > 1 ? (parts[1]?.[0] ?? '') : (parts[0]?.[1] ?? '')
  return (first + second).toUpperCase()
})

const bg = computed(() => PALETTE[hashCode(props.name || '?') % PALETTE.length])
</script>

<template>
  <span
    class="inline-flex items-center justify-center flex-shrink-0 border-[2.5px] border-ink font-black text-ink"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: bg,
      fontSize: `${size * 0.38}px`,
    }"
  >
    {{ initials }}
  </span>
</template>

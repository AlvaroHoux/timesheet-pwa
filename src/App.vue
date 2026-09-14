<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { initTheme, currentTheme } = useTheme()

const bgUrl = computed(() => {
  const base = import.meta.env.BASE_URL || './'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  return `${cleanBase}background.png`
})

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200 overflow-x-hidden">
    <!-- Fixed Mobile Background Layer -->
    <div
      class="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-300 opacity-50 invert dark:invert-0"
      :style="{ backgroundImage: `url(${bgUrl})` }"
      aria-hidden="true"
    />

    <!-- Router View Content Layer -->
    <div class="relative z-10 min-h-screen flex flex-col">
      <router-view />
    </div>
  </div>
</template>
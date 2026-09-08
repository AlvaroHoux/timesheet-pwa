<template>
  <button
    type="button"
    @click="toggleTheme"
    :aria-label="currentTheme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'"
    :title="currentTheme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'"
    :class="[
      fixed ? 'fixed top-4 right-4 md:top-8 md:right-8 z-50' : 'relative',
      'w-10 h-10 flex items-center justify-center rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400'
    ]">
    <span v-if="currentTheme === 'dark'" class="material-icons text-xl text-amber-400">light_mode</span>
    <span v-else class="material-icons text-xl text-slate-700">dark_mode</span>
  </button>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme';

const { currentTheme, toggleTheme } = useTheme();

interface Props {
  fixed?: boolean;
}

withDefaults(defineProps<Props>(), {
  fixed: true,
});
</script>


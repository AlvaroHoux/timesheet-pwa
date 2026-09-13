<template>
  <button
    type="button"
    @click="toggleTheme"
    :aria-label="currentTheme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'"
    :title="currentTheme === 'dark' ? 'Tema Claro' : 'Tema Escuro'"
    :class="[
      fixed ? 'fixed top-4 right-4 z-50' : 'relative',
      'w-10 h-10 inline-flex items-center justify-center rounded-2xl border transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600',
      'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-800'
    ]">
    <span v-if="currentTheme === 'dark'" class="material-icons text-[20px] text-amber-400 transition-transform duration-200 hover:rotate-12">
      light_mode
    </span>
    <span v-else class="material-icons text-[20px] text-zinc-700 transition-transform duration-200 hover:-rotate-12">
      dark_mode
    </span>
  </button>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme';

interface Props {
  fixed?: boolean;
}

withDefaults(defineProps<Props>(), {
  fixed: false,
});

const { currentTheme, toggleTheme } = useTheme();
</script>

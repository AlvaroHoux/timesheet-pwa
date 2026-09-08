<template>
  <div class="relative inline-block" ref="badgeRef">
    <!-- Botão Trigger do Badge -->
    <button
      type="button"
      @click="toggleMenu"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      aria-label="Perfil do usuário e configurações"
      :title="`Perfil: ${displayName}`"
      class="group relative z-50 w-10 h-10 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/90 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border border-slate-700/50 hover:border-slate-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
      <!-- Imagem de Avatar do Usuário (se houver) -->
      <img
        v-if="currentUser?.avatar"
        :src="currentUser.avatar"
        :alt="displayName"
        class="w-full h-full object-cover rounded-full" />

      <!-- Iniciais do Usuário -->
      <span
        v-else
        class="font-bold text-xs tracking-wider text-white select-none bg-linear-to-tr from-blue-600 to-indigo-500 w-full h-full rounded-full flex items-center justify-center">
        {{ userInitials }}
      </span>

      <!-- Indicador sutil de status online -->
      <span
        class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900"
        aria-hidden="true"></span>
    </button>

    <!-- Menu Dropdown Flutuante -->
    <transition name="popover">
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2.5 w-72 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/60 p-4 z-50 origin-top-right transition-all">
        <!-- Cabeçalho do Perfil -->
        <div class="flex items-start gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div
            class="w-11 h-11 shrink-0 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden">
            <img
              v-if="currentUser?.avatar"
              :src="currentUser.avatar"
              :alt="displayName"
              class="w-full h-full object-cover" />
            <span v-else>{{ userInitials }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <h3
              class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate"
              :title="displayName">
              {{ displayName }}
            </h3>
            <p
              class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5"
              :title="currentUser?.email || ''">
              {{ currentUser?.email || 'Usuário autenticado' }}
            </p>

            <span
              v-if="roleName"
              class="inline-flex items-center px-2 py-0.5 mt-1.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
              {{ roleName }}
            </span>
          </div>
        </div>

        <!-- Seção de Informações do Sistema e Versão -->
        <div class="py-3">
          <div
            class="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <span class="material-icons text-base text-blue-500 dark:text-blue-400">verified</span>
              <span>Versão do Sistema</span>
            </div>
            <span
              class="font-mono text-[11px] font-semibold px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
              v{{ APP_VERSION }}
            </span>
          </div>
        </div>

        <!-- Ações: Botão Sair / Logout -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300 border border-transparent hover:border-red-200 dark:hover:border-red-900/40 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <svg
              v-if="isLoggingOut"
              class="animate-spin h-4 w-4 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else class="material-icons text-base">logout</span>
            <span>{{ isLoggingOut ? 'Saindo...' : 'Sair da conta' }}</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { APP_VERSION } from '@/config/version';

const { currentUser, userInitials, displayName, roleName, refreshUser, logout } = useAuth();

const isOpen = ref(false);
const isLoggingOut = ref(false);
const badgeRef = ref<HTMLElement | null>(null);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleLogout = async () => {
  if (isLoggingOut.value) return;
  isLoggingOut.value = true;
  try {
    await logout();
  } catch (error) {
    console.error('Erro ao realizar logout:', error);
    isLoggingOut.value = false;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (badgeRef.value && !badgeRef.value.contains(event.target as Node)) {
    closeMenu();
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeMenu();
  }
};

onMounted(() => {
  refreshUser();
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.popover-enter-active,
.popover-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>


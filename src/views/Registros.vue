<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link
          to="/home"
          class="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all">
          <span class="material-icons text-xl">arrow_back</span>
        </router-link>
        <div>
          <h1 class="text-lg font-semibold tracking-tight">Registros</h1>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Histórico de pontos offline</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="historico.length > 0"
          @click="exportarCSV"
          title="Exportar como CSV"
          class="px-3 py-2 text-xs font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer">
          <span class="material-icons text-base">download</span>
          <span class="hidden sm:inline">Exportar CSV</span>
        </button>
        <ChangeTheme />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-lg w-full mx-auto px-4 py-6 flex flex-col gap-5">
      <!-- Balance Card -->
      <div class="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">Saldo Total de Horas</span>
          <div class="text-2xl font-bold font-mono tracking-tight mt-0.5" :class="saldoTotalMs >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
            {{ formatarSaldo(saldoTotalMs) }}
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-zinc-400 dark:text-zinc-500 block">Total de Dias</span>
          <span class="text-lg font-bold text-zinc-700 dark:text-zinc-300 font-mono">{{ historico.length }}</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="historico.length === 0" class="flex-1 flex flex-col items-center justify-center py-16 text-center text-zinc-400 dark:text-zinc-500">
        <span class="material-icons text-5xl mb-3 text-zinc-300 dark:text-zinc-700">history_toggle_off</span>
        <p class="text-base font-medium text-zinc-600 dark:text-zinc-300">Nenhum registro encontrado</p>
        <p class="text-xs mt-1 max-w-xs">Quando você finalizar seus dias de expediente, os registros aparecerão salvos localmente aqui.</p>
      </div>

      <!-- History List -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="item in historico"
          :key="item.id"
          class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col gap-3 shadow-xs">
          
          <!-- Top row: Date and Balance -->
          <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="material-icons text-zinc-400 text-sm">calendar_today</span>
              <span class="font-medium text-sm">{{ item.data }}</span>
              <span v-if="item.isCompensacao" class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Compensação
              </span>
            </div>

            <div class="flex items-center gap-3">
              <span
                class="text-xs font-mono font-bold px-2 py-0.5 rounded-lg"
                :class="calcularSaldo(item) >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'">
                {{ formatarSaldo(calcularSaldo(item)) }}
              </span>

              <button
                @click="excluirItem(item.id)"
                class="text-zinc-400 hover:text-rose-500 active:scale-95 transition-colors p-1"
                title="Excluir registro">
                <span class="material-icons text-base">delete_outline</span>
              </button>
            </div>
          </div>

          <!-- Bottom row: Punch Times -->
          <div v-if="!item.isCompensacao" class="grid grid-cols-4 gap-2 text-center text-xs">
            <div class="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <span class="text-[10px] text-zinc-400 block">Entrada</span>
              <span class="font-mono font-medium text-zinc-700 dark:text-zinc-200">{{ formatarHora(item.entrada) }}</span>
            </div>
            <div class="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <span class="text-[10px] text-zinc-400 block">Almoço</span>
              <span class="font-mono font-medium text-zinc-700 dark:text-zinc-200">{{ formatarHora(item.saidaAlmoco) }}</span>
            </div>
            <div class="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <span class="text-[10px] text-zinc-400 block">Retorno</span>
              <span class="font-mono font-medium text-zinc-700 dark:text-zinc-200">{{ formatarHora(item.retornoAlmoco) }}</span>
            </div>
            <div class="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <span class="text-[10px] text-zinc-400 block">Saída</span>
              <span class="font-mono font-medium text-zinc-700 dark:text-zinc-200">{{ formatarHora(item.saidaDia) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  RegistroHistorico,
  obterHistoricoCompleto,
  removerRegistroDoHistorico,
  exportarHistoricoCSV,
  obterCargaHoraria,
  calcularSaldoRegistro,
  formatarSaldo,
  formatarHora,
} from '@/services/timesheetStorage';
import ChangeTheme from '@/components/ChangeTheme.vue';

const historico = ref<RegistroHistorico[]>([]);
const cargaHoraria = ref<number>(obterCargaHoraria());

const carregarDados = async () => {
  cargaHoraria.value = obterCargaHoraria();
  historico.value = await obterHistoricoCompleto();
};

const calcularSaldo = (reg: RegistroHistorico) => {
  return calcularSaldoRegistro(reg, cargaHoraria.value);
};

const saldoTotalMs = computed(() => {
  return historico.value.reduce((total, item) => total + calcularSaldo(item), 0);
});

const exportarCSV = async () => {
  await exportarHistoricoCSV();
};

const excluirItem = async (id: number) => {
  if (confirm('Tem certeza de que deseja remover este registro permanentemente?')) {
    await removerRegistroDoHistorico(id);
    await carregarDados();
  }
};

onMounted(() => {
  carregarDados();
});
</script>

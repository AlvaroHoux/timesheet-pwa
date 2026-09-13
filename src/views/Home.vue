<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 select-none">
    
    <!-- Top Header -->
    <header class="w-full max-w-lg mx-auto px-5 pt-5 pb-2 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Offline-ready"></div>
        <span class="text-sm font-semibold tracking-wider uppercase text-zinc-600 dark:text-zinc-300">
          Controle de Ponto
        </span>
      </div>

      <div class="flex items-center gap-2">
        <ChangeTheme />
      </div>
    </header>

    <!-- Main Content: Central Square Button -->
    <main class="flex-1 flex flex-col items-center justify-center px-5 py-4 w-full max-w-lg mx-auto gap-6">
      
      <!-- Big Square Button (aspect-square) -->
      <button
        type="button"
        @click="handleBaterPonto"
        :aria-label="`${statusInfo.title} - Horário atual ${horaFormatada}:${segundosFormatados}`"
        class="group relative w-full max-w-[330px] xs:max-w-[360px] sm:max-w-[390px] aspect-square rounded-[36px] p-6 flex flex-col items-center justify-between text-center transition-all duration-150 active:scale-[0.96] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 border-2 shadow-xl"
        :class="[
          'bg-white dark:bg-zinc-900',
          'border-zinc-200 dark:border-zinc-800',
          'hover:border-zinc-300 dark:hover:border-zinc-700',
          'shadow-zinc-200/60 dark:shadow-black/60',
        ]">

        <!-- Top info inside button: Date & Status Chip -->
        <div class="w-full flex items-center justify-between">
          <span class="text-xs font-medium tracking-tight text-zinc-400 dark:text-zinc-500 capitalize">
            {{ dataFormatada }}
          </span>

          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
            :class="statusInfo.badgeColor">
            <span class="w-1.5 h-1.5 rounded-full" :class="statusInfo.indicatorColor"></span>
            {{ statusInfo.badge }}
          </span>
        </div>

        <!-- Center: Big Live Clock -->
        <div class="flex flex-col items-center justify-center my-auto">
          <div class="flex items-baseline justify-center font-mono font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">
            <span class="text-5xl xs:text-6xl sm:text-7xl">{{ horaFormatada }}</span>
            <span class="text-2xl xs:text-3xl text-zinc-400 dark:text-zinc-500 ml-1.5 font-medium">:{{ segundosFormatados }}</span>
          </div>

          <!-- Worked Time / Stats Pill -->
          <div v-if="dadosPonto.estado > 0" class="mt-2 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
            <span class="material-icons text-sm text-zinc-400">timer</span>
            <span v-if="dadosPonto.estado === 2">Almoço: {{ formatarDuracao(tempoAlmocoDecorridoMs) }}</span>
            <span v-else>Trabalhado: {{ formatarDuracao(tempoTrabalhadoHojeMs) }}</span>
          </div>
        </div>

        <!-- Bottom info inside button: Action Label & Icon -->
        <div class="w-full pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div class="text-left">
            <p class="text-sm xs:text-base font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>{{ statusInfo.title }}</span>
            </p>
            <p class="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              {{ statusInfo.subtitle }}
            </p>
          </div>

          <div
            class="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95"
            :class="[
              dadosPonto.estado === 0 ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' : '',
              dadosPonto.estado === 1 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : '',
              dadosPonto.estado === 2 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : '',
              dadosPonto.estado === 3 ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : '',
            ]">
            <span class="material-icons text-2xl">{{ statusInfo.icon }}</span>
          </div>
        </div>

        <!-- Touch / Click Ripple Feedback Flash -->
        <span
          v-if="cliqueAnimando"
          class="absolute inset-0 rounded-[36px] bg-blue-500/10 pointer-events-none animate-ping duration-300"></span>
      </button>

      <!-- Previsão de saída (se disponível) -->
      <div
        v-if="estimativaSaida"
        class="w-full max-w-[330px] xs:max-w-[360px] sm:max-w-[390px] flex items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 -mt-2">
        <span class="material-icons text-sm text-blue-500">schedule</span>
        <span>Previsão de saída: <strong class="font-mono text-zinc-700 dark:text-zinc-200">{{ estimativaSaida }}</strong></span>
      </div>

      <!-- Navigation: Registros & Configurações -->
      <div class="grid grid-cols-2 gap-3 w-full max-w-[330px] xs:max-w-[360px] sm:max-w-[390px]">
        <!-- Registros Button -->
        <router-link
          to="/registros"
          class="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between gap-3 active:scale-[0.98] transition-all group cursor-pointer">
          <div class="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <span class="material-icons text-xl">history</span>
          </div>
          <div>
            <span class="block text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">Registros</span>
            <span class="block text-[11px] text-zinc-400 dark:text-zinc-500">Histórico & Saldo</span>
          </div>
        </router-link>

        <!-- Configurações Button -->
        <router-link
          to="/configuracoes"
          class="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between gap-3 active:scale-[0.98] transition-all group cursor-pointer">
          <div class="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <span class="material-icons text-xl">settings</span>
          </div>
          <div>
            <span class="block text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">Configurações</span>
            <span class="block text-[11px] text-zinc-400 dark:text-zinc-500">Carga & Preferências</span>
          </div>
        </router-link>
      </div>

      <!-- Quick actions for today when active -->
      <div v-if="dadosPonto.estado > 0" class="flex items-center gap-3 text-xs">
        <button
          type="button"
          @click="mostrarModalEdicao = true"
          class="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 inline-flex items-center gap-1 cursor-pointer transition-colors py-1 px-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <span class="material-icons text-sm">edit_calendar</span>
          <span>Ajustar horários de hoje</span>
        </button>

        <span class="text-zinc-300 dark:text-zinc-700">•</span>

        <button
          type="button"
          @click="confirmarCancelarDia"
          class="text-rose-500 hover:text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 cursor-pointer transition-colors py-1 px-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30">
          <span class="material-icons text-sm">cancel</span>
          <span>Cancelar dia</span>
        </button>
      </div>
    </main>

    <!-- Modal para Ajustar Horários de Hoje -->
    <div
      v-if="mostrarModalEdicao"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div class="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold">Ajustar Ponto de Hoje</h2>
          <button
            @click="mostrarModalEdicao = false"
            class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="flex flex-col gap-3">
          <div>
            <label class="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Entrada (1º Turno)</label>
            <input
              v-model="editEntrada"
              type="time"
              class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Saída Almoço</label>
            <input
              v-model="editSaidaAlmoco"
              type="time"
              class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Retorno Almoço (2º Turno)</label>
            <input
              v-model="editRetornoAlmoco"
              type="time"
              class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            @click="mostrarModalEdicao = false"
            class="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            @click="salvarEdicaoHoje"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useTimesheet } from '@/composables/useTimesheet';
import ChangeTheme from '@/components/ChangeTheme.vue';

const {
  dadosPonto,
  horaFormatada,
  segundosFormatados,
  dataFormatada,
  tempoTrabalhadoHojeMs,
  tempoAlmocoDecorridoMs,
  estimativaSaida,
  statusInfo,
  inicializar,
  iniciarRelogio,
  pararRelogio,
  baterPonto,
  cancelarDiaAtual,
  atualizarPontoHoje,
  formatarDuracao,
  formatarHora,
} = useTimesheet();

const cliqueAnimando = ref(false);
const mostrarModalEdicao = ref(false);

const editEntrada = ref('');
const editSaidaAlmoco = ref('');
const editRetornoAlmoco = ref('');

const extrairHoraInput = (timestamp: number | null): string => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const timestampHoje = (horaStr: string): number | null => {
  if (!horaStr) return null;
  const [h, m] = horaStr.split(':');
  const d = new Date();
  d.setHours(Number(h), Number(m), 0, 0);
  return d.getTime();
};

watch(mostrarModalEdicao, (visivel) => {
  if (visivel) {
    editEntrada.value = extrairHoraInput(dadosPonto.value.inicioDia);
    editSaidaAlmoco.value = extrairHoraInput(dadosPonto.value.inicioAlmoco);
    editRetornoAlmoco.value = extrairHoraInput(dadosPonto.value.fimAlmoco);
  }
});

const handleBaterPonto = async () => {
  cliqueAnimando.value = true;
  setTimeout(() => {
    cliqueAnimando.value = false;
  }, 300);
  await baterPonto();
};

const confirmarCancelarDia = async () => {
  if (confirm('Deseja realmente cancelar o registro do dia atual?')) {
    await cancelarDiaAtual();
  }
};

const salvarEdicaoHoje = async () => {
  const novoInicioDia = timestampHoje(editEntrada.value);
  const novoInicioAlmoco = timestampHoje(editSaidaAlmoco.value);
  const novoFimAlmoco = timestampHoje(editRetornoAlmoco.value);

  let novoEstado = dadosPonto.value.estado;
  if (novoFimAlmoco) novoEstado = 3;
  else if (novoInicioAlmoco) novoEstado = 2;
  else if (novoInicioDia) novoEstado = 1;

  await atualizarPontoHoje({
    inicioDia: novoInicioDia,
    inicioAlmoco: novoInicioAlmoco,
    fimAlmoco: novoFimAlmoco,
    estado: novoEstado,
  });

  mostrarModalEdicao.value = false;
};

onMounted(() => {
  inicializar();
  iniciarRelogio();
});

onUnmounted(() => {
  pararRelogio();
});
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 select-none">
    
    <!-- Top Header -->
    <header class="w-full max-w-lg mx-auto px-5 pt-4 pb-2 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Offline-first"></div>
        <span class="text-sm font-semibold tracking-wider uppercase text-zinc-600 dark:text-zinc-300">
          Controle de Ponto
        </span>
      </div>

      <div class="flex items-center gap-2">
        <ChangeTheme />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center justify-center px-5 py-3 w-full max-w-lg mx-auto gap-5">

      <!-- Motivador Financeiro (Se configurado salário) -->
      <div
        v-if="temSalarioConfigurado && configFinanceira.mostrarGanhos"
        class="w-full max-w-[330px] xs:max-w-[360px] sm:max-w-[390px] p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            R$
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Hoje acumulado:</span>
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {{ formatarMoeda(ganhoHoje) }}
              </span>
            </div>
            <div class="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              <span>{{ formatarMoeda(ganhoPorMinuto) }}/min</span>
              <span v-if="dadosPonto.estado > 0 && valorPrevistoDia > 0"> • Meta: {{ formatarMoeda(valorPrevistoDia) }}</span>
            </div>
          </div>
        </div>

        <div v-if="isFimDeSemana" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          +{{ configFinanceira.adicionalFimDeSemana }}% FDS
        </div>
        <div v-else-if="tempoTrabalhadoHojeMs > cargaHoraria" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
          +{{ configFinanceira.adicionalExtra }}% EXTRA
        </div>
      </div>

      <!-- Big Square Button (aspect-square) -->
      <button
        type="button"
        @click="abrirConfirmacaoPonto"
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

          <!-- Worked Time / Lunch Countdown Pill -->
          <div v-if="dadosPonto.estado > 0" class="mt-2 text-xs font-mono font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3.5 py-1.5 rounded-full">
            <span class="material-icons text-sm text-zinc-400">timer</span>
            
            <span v-if="dadosPonto.estado === 2">
              <span v-if="tempoAlmocoRestanteMs >= 0">
                Almoço: Restam {{ formatarDuracao(tempoAlmocoRestanteMs) }}
              </span>
              <span v-else class="text-rose-600 dark:text-rose-400 font-bold">
                Almoço estourado: +{{ formatarDuracao(Math.abs(tempoAlmocoRestanteMs)) }}
              </span>
            </span>

            <span v-else>
              Trabalhado: {{ formatarDuracao(tempoTrabalhadoHojeMs) }}
            </span>
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
      </button>

      <!-- Previsão de saída -->
      <div
        v-if="estimativaSaida"
        class="w-full max-w-[330px] xs:max-w-[360px] sm:max-w-[390px] flex items-center justify-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 -mt-2">
        <span class="material-icons text-sm text-blue-500">schedule</span>
        <span>Previsão de saída: <strong class="font-mono text-zinc-700 dark:text-zinc-200">{{ estimativaSaida }}</strong></span>
      </div>

      <!-- Seletor de Etapas do Dia (Stepper Interativo) -->
      <div class="w-full max-w-[330px] xs:max-w-[360px] sm:max-w-[390px] flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-[11px] text-zinc-400 font-medium px-1">
          <span>Etapas do dia</span>
          <button
            v-if="dadosPonto.estado > 0"
            @click="abrirAjustarHorarios"
            class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1">
            <span class="material-icons text-xs">tune</span>
            <span>Ajustar horários</span>
          </button>
        </div>

        <div class="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            v-for="(etapa, idx) in etapasLista"
            :key="idx"
            type="button"
            @click="selecionarEtapaDireta(idx)"
            class="py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer text-xs"
            :class="[
              dadosPonto.estado === idx
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold ring-1 ring-blue-500/20'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            ]">
            <span class="text-[10px] font-semibold">{{ etapa.nome }}</span>
            <span class="font-mono text-[10px] text-zinc-400">
              {{ formatarEtapaHora(idx) }}
            </span>
          </button>
        </div>
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
            <span class="block text-[11px] text-zinc-400 dark:text-zinc-500">Histórico & Ajustes</span>
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
            <span class="block text-[11px] text-zinc-400 dark:text-zinc-500">Carga & Salário</span>
          </div>
        </router-link>
      </div>
    </main>

    <!-- 1. MODAL DE CONFIRMAÇÃO DO PONTO (Evita acionamento acidental) -->
    <div
      v-if="modalConfirmacaoVisivel"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div class="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl flex flex-col gap-4">
        
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-2xl flex items-center justify-center"
            :class="statusInfo.badgeColor">
            <span class="material-icons text-xl">{{ statusInfo.icon }}</span>
          </div>
          <div>
            <h2 class="text-base font-semibold text-zinc-900 dark:text-white">
              {{ statusInfo.title }}
            </h2>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Confirmar registro de ponto
            </p>
          </div>
        </div>

        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          {{ textoConfirmacao }}
        </p>

        <!-- Permite ajustar o horário caso tenha esquecido de bater antes -->
        <div class="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex flex-col gap-1.5">
          <label class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Horário da marcação (ajuste caso tenha esquecido):
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="horarioConfirmacao"
              type="time"
              class="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button
              type="button"
              @click="resetarHorarioParaAgora"
              class="px-2.5 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 cursor-pointer">
              Agora
            </button>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            @click="modalConfirmacaoVisivel = false"
            class="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmarPontoComHorario"
            class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5">
            <span class="material-icons text-base">check</span>
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. MODAL DE AJUSTE DE ETAPAS E HORÁRIOS DO DIA -->
    <div
      v-if="modalAjusteVisivel"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div class="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl flex flex-col gap-4">
        
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-zinc-900 dark:text-white">Ajustar Etapa & Horários</h2>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Corrija enganos ou marcações esquecidas</p>
          </div>
          <button
            @click="modalAjusteVisivel = false"
            class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Seletor da Etapa Atual -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Etapa ativa no momento:</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="(etapa, idx) in etapasLista"
              :key="idx"
              type="button"
              @click="editEtapa = idx"
              class="py-2 px-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer"
              :class="editEtapa === idx ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'">
              <span>{{ etapa.nome }}</span>
              <span v-if="editEtapa === idx" class="material-icons text-sm text-blue-500">check</span>
            </button>
          </div>
        </div>

        <!-- Campos de Horários -->
        <div class="flex flex-col gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <label class="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Entrada (1º Turno)</label>
            <input
              v-model="editEntrada"
              type="time"
              class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              Saída para Almoço (Intervalo)
            </label>
            <input
              v-model="editSaidaAlmoco"
              type="time"
              class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-[10px] text-zinc-400 mt-0.5">Ao ajustar para um horário passado, o tempo restante de almoço desconta automaticamente.</p>
          </div>

          <div>
            <label class="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Retorno do Almoço (2º Turno)</label>
            <input
              v-model="editRetornoAlmoco"
              type="time"
              class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            @click="confirmarCancelarDia"
            class="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer flex items-center gap-1">
            <span class="material-icons text-sm">delete_sweep</span>
            <span>Resetar Dia</span>
          </button>
          <button
            type="button"
            @click="salvarAjusteGeral"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTimesheet } from '@/composables/useTimesheet';
import ChangeTheme from '@/components/ChangeTheme.vue';

const {
  dadosPonto,
  horaFormatada,
  segundosFormatados,
  dataFormatada,
  tempoTrabalhadoHojeMs,
  tempoAlmocoRestanteMs,
  estimativaSaida,
  statusInfo,
  configFinanceira,
  temSalarioConfigurado,
  isFimDeSemana,
  ganhoHoje,
  ganhoPorMinuto,
  valorPrevistoDia,
  formatarMoeda,
  cargaHoraria,
  inicializar,
  iniciarRelogio,
  pararRelogio,
  aplicarTransicaoEtapa,
  definirEtapaDireta,
  cancelarDiaAtual,
  atualizarPontoHoje,
  formatarDuracao,
  formatarHora,
} = useTimesheet();

const etapasLista = [
  { nome: 'Livre' },
  { nome: '1º Turno' },
  { nome: 'Almoço' },
  { nome: '2º Turno' },
];

const modalConfirmacaoVisivel = ref(false);
const modalAjusteVisivel = ref(false);
const horarioConfirmacao = ref('');

const editEtapa = ref(0);
const editEntrada = ref('');
const editSaidaAlmoco = ref('');
const editRetornoAlmoco = ref('');

const formatarEtapaHora = (etapaIndex: number): string => {
  switch (etapaIndex) {
    case 1:
      return formatarHora(dadosPonto.value.inicioDia);
    case 2:
      return formatarHora(dadosPonto.value.inicioAlmoco);
    case 3:
      return formatarHora(dadosPonto.value.fimAlmoco);
    default:
      return dadosPonto.value.estado === 0 ? 'Livre' : '--:--';
  }
};

const obterHoraAtualString = () => {
  const agora = new Date();
  const h = String(agora.getHours()).padStart(2, '0');
  const m = String(agora.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const textoConfirmacao = computed(() => {
  switch (dadosPonto.value.estado) {
    case 0:
      return 'Deseja iniciar o expediente de hoje?';
    case 1:
      return 'Deseja registrar o início do intervalo de almoço?';
    case 2:
      return 'Deseja registrar o retorno do intervalo de almoço?';
    case 3:
      return 'Deseja finalizar o expediente e arquivar este dia no histórico?';
    default:
      return 'Deseja confirmar a marcação de ponto?';
  }
});

const abrirConfirmacaoPonto = () => {
  horarioConfirmacao.value = obterHoraAtualString();
  modalConfirmacaoVisivel.value = true;
};

const resetarHorarioParaAgora = () => {
  horarioConfirmacao.value = obterHoraAtualString();
};

const timestampDeHojeHora = (horaStr: string): number => {
  if (!horaStr || !horaStr.includes(':')) return Date.now();
  const [h, m] = horaStr.split(':');
  const d = new Date();
  d.setHours(Number(h), Number(m), 0, 0);
  return d.getTime();
};

const extrairHoraInput = (timestamp: number | null): string => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const confirmarPontoComHorario = async () => {
  const timestampEscolhido = timestampDeHojeHora(horarioConfirmacao.value);
  const proxima = dadosPonto.value.estado + 1;
  await aplicarTransicaoEtapa(proxima, timestampEscolhido);
  modalConfirmacaoVisivel.value = false;
};

const selecionarEtapaDireta = (etapaIndex: number) => {
  if (etapaIndex === dadosPonto.value.estado) {
    abrirAjustarHorarios();
    return;
  }
  // Se for um engano e quiser mudar
  editEtapa.value = etapaIndex;
  abrirAjustarHorarios();
};

const abrirAjustarHorarios = () => {
  editEtapa.value = dadosPonto.value.estado;
  editEntrada.value = extrairHoraInput(dadosPonto.value.inicioDia);
  editSaidaAlmoco.value = extrairHoraInput(dadosPonto.value.inicioAlmoco);
  editRetornoAlmoco.value = extrairHoraInput(dadosPonto.value.fimAlmoco);
  modalAjusteVisivel.value = true;
};

const salvarAjusteGeral = async () => {
  const novoInicioDia = editEntrada.value ? timestampDeHojeHora(editEntrada.value) : null;
  const novoInicioAlmoco = editSaidaAlmoco.value ? timestampDeHojeHora(editSaidaAlmoco.value) : null;
  const novoFimAlmoco = editRetornoAlmoco.value ? timestampDeHojeHora(editRetornoAlmoco.value) : null;

  await atualizarPontoHoje({
    estado: editEtapa.value,
    inicioDia: novoInicioDia,
    inicioAlmoco: novoInicioAlmoco,
    fimAlmoco: novoFimAlmoco,
  });

  modalAjusteVisivel.value = false;
};

const confirmarCancelarDia = async () => {
  if (confirm('Deseja realmente cancelar o registro do dia atual e voltar ao início?')) {
    await cancelarDiaAtual();
    modalAjusteVisivel.value = false;
  }
};

onMounted(() => {
  inicializar();
  iniciarRelogio();
});

onUnmounted(() => {
  pararRelogio();
});
</script>

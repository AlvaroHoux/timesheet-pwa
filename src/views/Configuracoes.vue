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
          <h1 class="text-lg font-semibold tracking-tight">Configurações</h1>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Jornada, ciclo do mês & salário</p>
        </div>
      </div>
      <ChangeTheme />
    </header>

    <!-- Content -->
    <main class="flex-1 max-w-lg w-full mx-auto px-4 py-6 flex flex-col gap-6">
      
      <!-- Carga Horária Diária -->
      <section class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col gap-4">
        <div class="flex items-center gap-2.5">
          <span class="material-icons text-zinc-500 dark:text-zinc-400">schedule</span>
          <div>
            <h2 class="text-sm font-semibold">Carga Horária Diária</h2>
            <p class="text-xs text-zinc-400">Jornada padrão esperada por dia</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Horas</label>
            <input
              v-model.number="horasCarga"
              type="number"
              min="0"
              max="24"
              class="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Minutos</label>
            <input
              v-model.number="minutosCarga"
              type="number"
              min="0"
              max="59"
              class="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </section>

      <!-- Fechamento do Mês (Ciclo de Ponto) -->
      <section class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col gap-4">
        <div class="flex items-center gap-2.5">
          <span class="material-icons text-blue-500">date_range</span>
          <div>
            <h2 class="text-sm font-semibold">Fechamento do Mês (Ciclo de Ponto)</h2>
            <p class="text-xs text-zinc-400">Dias de abertura e corte do espelho na empresa</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Dia de Abertura</label>
            <input
              v-model.number="formCiclo.diaInicio"
              type="number"
              min="1"
              max="31"
              class="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span class="text-[10px] text-zinc-400 block mt-1">Ex: 27 (mês anterior)</span>
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Dia de Fechamento</label>
            <input
              v-model.number="formCiclo.diaFim"
              type="number"
              min="1"
              max="31"
              class="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span class="text-[10px] text-zinc-400 block mt-1">Ex: 26 (mês atual)</span>
          </div>
        </div>

        <!-- Card com período atual calculado -->
        <div class="p-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/15 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="material-icons text-blue-500 text-base">event_available</span>
            <span class="text-zinc-600 dark:text-zinc-300">Ciclo atual em vigor:</span>
          </div>
          <strong class="font-mono text-blue-600 dark:text-blue-400 font-semibold">{{ periodoPreview }}</strong>
        </div>
      </section>

      <!-- Intervalo de Almoço -->
      <section class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col gap-4">
        <div class="flex items-center gap-2.5">
          <span class="material-icons text-zinc-500 dark:text-zinc-400">restaurant</span>
          <div>
            <h2 class="text-sm font-semibold">Tempo de Almoço Previsto</h2>
            <p class="text-xs text-zinc-400">Duração estimada do intervalo</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Horas</label>
            <input
              v-model.number="horasAlmoco"
              type="number"
              min="0"
              max="6"
              class="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Minutos</label>
            <input
              v-model.number="minutosAlmoco"
              type="number"
              min="0"
              max="59"
              class="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </section>

      <!-- Remuneração & Motivador Financeiro -->
      <section class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col gap-4">
        <div class="flex items-center gap-2.5">
          <span class="material-icons text-emerald-500">payments</span>
          <div>
            <h2 class="text-sm font-semibold">Motivador Financeiro</h2>
            <p class="text-xs text-zinc-400">Acompanhe seus ganhos por segundo/minuto</p>
          </div>
        </div>

        <!-- Salário Mensal -->
        <div>
          <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Salário Base Mensal (R$)
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-sm font-bold text-zinc-400">R$</span>
            <input
              v-model.number="formFinancas.salarioMensal"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              class="w-full pl-10 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <p class="text-[10px] text-zinc-400 mt-1">Se preenchido com 0, o motivador financeiro fica oculto.</p>
        </div>

        <!-- Dias úteis e adicionais -->
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Dias úteis/mês</label>
            <input
              v-model.number="formFinancas.diasUteisMes"
              type="number"
              min="1"
              max="31"
              class="w-full px-2 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Extra sem. (%)</label>
            <input
              v-model.number="formFinancas.adicionalExtra"
              type="number"
              min="0"
              max="500"
              class="w-full px-2 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Extra FDS (%)</label>
            <input
              v-model.number="formFinancas.adicionalFimDeSemana"
              type="number"
              min="0"
              max="500"
              class="w-full px-2 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <!-- Exibição de Resumo de Valores Calculados -->
        <div v-if="formFinancas.salarioMensal > 0" class="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/15 flex flex-col gap-1.5 text-xs font-mono">
          <div class="flex justify-between text-zinc-600 dark:text-zinc-300">
            <span>Hora Normal:</span>
            <strong class="text-emerald-600 dark:text-emerald-400">{{ formatarMoeda(valorHoraPreview) }}</strong>
          </div>
          <div class="flex justify-between text-zinc-600 dark:text-zinc-300">
            <span>Por Minuto:</span>
            <strong>{{ formatarMoeda(valorHoraPreview / 60) }}</strong>
          </div>
          <div class="flex justify-between text-zinc-600 dark:text-zinc-300">
            <span>Dia Completo ({{ horasCarga }}h):</span>
            <strong class="text-emerald-600 dark:text-emerald-400">{{ formatarMoeda(valorDiaPreview) }}</strong>
          </div>
          <div class="flex justify-between text-zinc-500 border-t border-emerald-500/15 pt-1 text-[11px]">
            <span>Hora Extra (+{{ formFinancas.adicionalExtra }}%):</span>
            <span>{{ formatarMoeda(valorHoraPreview * (1 + formFinancas.adicionalExtra / 100)) }}</span>
          </div>
          <div class="flex justify-between text-zinc-500 text-[11px]">
            <span>Hora FDS (+{{ formFinancas.adicionalFimDeSemana }}%):</span>
            <span>{{ formatarMoeda(valorHoraPreview * (1 + formFinancas.adicionalFimDeSemana / 100)) }}</span>
          </div>
        </div>
      </section>

      <!-- Aparência / Tema -->
      <section class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col gap-4">
        <div class="flex items-center gap-2.5">
          <span class="material-icons text-zinc-500 dark:text-zinc-400">palette</span>
          <div>
            <h2 class="text-sm font-semibold">Tema da Interface</h2>
            <p class="text-xs text-zinc-400">Escolha o visual que melhor se adapta</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="setTheme('light')"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm font-medium transition-all active:scale-95 cursor-pointer"
            :class="currentTheme === 'light' ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'">
            <span class="material-icons text-lg">light_mode</span>
            <span>Claro</span>
          </button>

          <button
            type="button"
            @click="setTheme('dark')"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm font-medium transition-all active:scale-95 cursor-pointer"
            :class="currentTheme === 'dark' ? 'bg-zinc-800 border-blue-500 text-blue-400 ring-2 ring-blue-500/20' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'">
            <span class="material-icons text-lg">dark_mode</span>
            <span>Escuro</span>
          </button>
        </div>
      </section>

      <!-- Ação Salvar -->
      <button
        @click="salvarConfiguracoes"
        class="w-full py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2">
        <span class="material-icons text-lg">check</span>
        <span>Salvar Configurações</span>
      </button>

      <!-- Feedback de salvo -->
      <p v-if="salvoSucesso" class="text-xs text-center text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
        Configurações salvas com sucesso!
      </p>

      <!-- Informações do App -->
      <footer class="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 text-center text-xs text-zinc-400 dark:text-zinc-600 flex flex-col gap-1">
        <span>Controle de Ponto PWA • 100% Offline-first</span>
        <span>Dados salvos exclusivamente no seu dispositivo</span>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  obterCargaHoraria,
  salvarCargaHoraria,
  obterTempoAlmoco,
  salvarTempoAlmoco,
  obterConfigCiclo,
  salvarConfigCiclo,
  calcularPeriodoCiclo,
  ConfigCiclo,
  obterConfigFinanceira,
  salvarConfigFinanceira,
  ConfigFinanceira,
} from '@/services/timesheetStorage';
import { useTheme } from '@/composables/useTheme';
import ChangeTheme from '@/components/ChangeTheme.vue';

const { currentTheme, setTheme } = useTheme();

const horasCarga = ref(8);
const minutosCarga = ref(0);
const horasAlmoco = ref(1);
const minutosAlmoco = ref(0);
const salvoSucesso = ref(false);

const formCiclo = ref<ConfigCiclo>({
  diaInicio: 27,
  diaFim: 26,
});

const formFinancas = ref<ConfigFinanceira>({
  salarioMensal: 0,
  diasUteisMes: 22,
  adicionalExtra: 50,
  adicionalFimDeSemana: 100,
  mostrarGanhos: true,
});

const carregar = () => {
  const cargaMs = obterCargaHoraria();
  horasCarga.value = Math.floor(cargaMs / (60 * 60 * 1000));
  minutosCarga.value = Math.floor((cargaMs % (60 * 60 * 1000)) / (60 * 1000));

  const almocoMs = obterTempoAlmoco();
  horasAlmoco.value = Math.floor(almocoMs / (60 * 60 * 1000));
  minutosAlmoco.value = Math.floor((almocoMs % (60 * 60 * 1000)) / (60 * 1000));

  formCiclo.value = obterConfigCiclo();
  formFinancas.value = obterConfigFinanceira();
};

const periodoPreview = computed(() => {
  const diaInicio = Number(formCiclo.value.diaInicio) || 27;
  const diaFim = Number(formCiclo.value.diaFim) || 26;
  return calcularPeriodoCiclo(diaInicio, diaFim).textoFormatado;
});

const totalHorasDia = computed(() => {
  return Number(horasCarga.value || 0) + (Number(minutosCarga.value || 0) / 60);
});

const totalHorasMes = computed(() => {
  const dias = formFinancas.value.diasUteisMes || 22;
  return totalHorasDia.value * dias;
});

const valorHoraPreview = computed(() => {
  if (!formFinancas.value.salarioMensal || totalHorasMes.value <= 0) return 0;
  return formFinancas.value.salarioMensal / totalHorasMes.value;
});

const valorDiaPreview = computed(() => {
  return valorHoraPreview.value * totalHorasDia.value;
});

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

const salvarConfiguracoes = () => {
  const cargaMs = (Number(horasCarga.value) || 0) * 3600000 + (Number(minutosCarga.value) || 0) * 60000;
  const almocoMs = (Number(horasAlmoco.value) || 0) * 3600000 + (Number(minutosAlmoco.value) || 0) * 60000;

  salvarCargaHoraria(cargaMs);
  salvarTempoAlmoco(almocoMs);
  salvarConfigCiclo(formCiclo.value);
  salvarConfigFinanceira(formFinancas.value);

  salvoSucesso.value = true;
  setTimeout(() => {
    salvoSucesso.value = false;
  }, 2500);
};

onMounted(() => {
  carregar();
});
</script>

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
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Histórico, ajustes & ciclo do mês</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <ChangeTheme />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-lg w-full mx-auto px-4 py-6 flex flex-col gap-5">

      <!-- Seletor de visualização de ciclo / período -->
      <div class="grid grid-cols-2 p-1 rounded-2xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800 text-xs font-semibold">
        <button
          type="button"
          @click="filtroCiclo = 'ciclo'"
          class="py-2 px-3 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
          :class="filtroCiclo === 'ciclo' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'">
          <span class="material-icons text-sm">date_range</span>
          <span>Ciclo Atual ({{ configCiclo.diaInicio }} a {{ configCiclo.diaFim }})</span>
        </button>

        <button
          type="button"
          @click="filtroCiclo = 'todos'"
          class="py-2 px-3 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
          :class="filtroCiclo === 'todos' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'">
          <span class="material-icons text-sm">view_agenda</span>
          <span>Todos os Registros</span>
        </button>
      </div>

      <!-- Balance Card -->
      <div class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">
            {{ filtroCiclo === 'ciclo' ? `Saldo do Ciclo (${periodoAtual.textoFormatado})` : 'Saldo Geral Acumulado' }}
          </span>
          <div class="text-3xl font-bold font-mono tracking-tight mt-0.5" :class="saldoFiltradoMs >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
            {{ formatarSaldo(saldoFiltradoMs) }}
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-zinc-400 dark:text-zinc-500 block">Entradas</span>
          <span class="text-lg font-bold text-zinc-700 dark:text-zinc-300 font-mono">{{ registrosFiltrados.length }}</span>
        </div>
      </div>

      <!-- Action Buttons: + Novo Ajuste, Exportar CSV, Importar CSV -->
      <div class="grid grid-cols-3 gap-2">
        <!-- Novo Ajuste -->
        <button
          type="button"
          @click="abrirModalNovoAjuste"
          class="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer">
          <span class="material-icons text-base">add_circle_outline</span>
          <span>Ajuste</span>
        </button>

        <!-- Exportar CSV -->
        <button
          type="button"
          @click="exportarCSV"
          :disabled="registrosFiltrados.length === 0"
          class="py-2.5 px-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-icons text-base">download</span>
          <span>{{ filtroCiclo === 'ciclo' ? 'Exportar Ciclo' : 'Exportar Tudo' }}</span>
        </button>

        <!-- Importar CSV -->
        <label
          class="py-2.5 px-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer text-center">
          <span class="material-icons text-base">upload_file</span>
          <span>Importar</span>
          <input
            type="file"
            accept=".csv,text/csv"
            @change="handleImportarCSV"
            class="hidden" />
        </label>
      </div>

      <!-- Feedback de Importação / Operação -->
      <div
        v-if="mensagemFeedback"
        class="p-3 rounded-2xl text-xs font-medium flex items-center gap-2 border"
        :class="tipoFeedback === 'sucesso' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500/20'">
        <span class="material-icons text-sm">{{ tipoFeedback === 'sucesso' ? 'check_circle' : 'error_outline' }}</span>
        <span>{{ mensagemFeedback }}</span>
      </div>

      <!-- Empty State -->
      <div v-if="registrosFiltrados.length === 0" class="flex-1 flex flex-col items-center justify-center py-16 text-center text-zinc-400 dark:text-zinc-500">
        <span class="material-icons text-5xl mb-3 text-zinc-300 dark:text-zinc-700">history_toggle_off</span>
        <p class="text-base font-medium text-zinc-600 dark:text-zinc-300">
          {{ filtroCiclo === 'ciclo' ? `Nenhum registro no ciclo atual (${periodoAtual.textoFormatado})` : 'Nenhum registro encontrado' }}
        </p>
        <p class="text-xs mt-1 max-w-xs">Ao finalizar seus dias ou adicionar ajustes manuais, eles aparecerão salvos localmente aqui.</p>
      </div>

      <!-- History List -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="item in registrosFiltrados"
          :key="item.id"
          class="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col gap-3 shadow-xs">
          
          <!-- Top row: Date, Type, Balance, and Actions -->
          <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="material-icons text-zinc-400 text-sm">calendar_today</span>
              <span class="font-semibold text-sm">{{ item.data }}</span>
              <span v-if="item.isCompensacao" class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Ajuste
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span
                class="text-xs font-mono font-bold px-2 py-0.5 rounded-lg"
                :class="calcularSaldo(item) >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'">
                {{ formatarSaldo(calcularSaldo(item)) }}
              </span>

              <!-- Editar -->
              <button
                @click="abrirModalEditarRegistro(item)"
                class="text-zinc-400 hover:text-blue-500 active:scale-95 transition-colors p-1 cursor-pointer"
                title="Editar este registro">
                <span class="material-icons text-base">edit</span>
              </button>

              <!-- Excluir -->
              <button
                @click="excluirItem(item.id)"
                class="text-zinc-400 hover:text-rose-500 active:scale-95 transition-colors p-1 cursor-pointer"
                title="Excluir este registro">
                <span class="material-icons text-base">delete_outline</span>
              </button>
            </div>
          </div>

          <!-- Descrição do Ajuste / Observação -->
          <div v-if="item.descricao" class="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl flex items-start gap-1.5">
            <span class="material-icons text-zinc-400 text-sm mt-0.5">info</span>
            <span>{{ item.descricao }}</span>
          </div>

          <!-- Bottom row: Punch Times for Normal Days -->
          <div v-if="!item.isCompensacao" class="grid grid-cols-4 gap-2 text-center text-xs">
            <div class="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
              <span class="text-[10px] text-zinc-400 block">Entrada</span>
              <span class="font-mono font-medium text-zinc-700 dark:text-zinc-200">{{ formatarHora(item.entrada) }}</span>
            </div>
            <div class="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
              <span class="text-[10px] text-zinc-400 block">Almoço</span>
              <span class="font-mono font-medium text-zinc-700 dark:text-zinc-200">{{ formatarHora(item.saidaAlmoco) }}</span>
            </div>
            <div class="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
              <span class="text-[10px] text-zinc-400 block">Retorno</span>
              <span class="font-mono font-medium text-zinc-700 dark:text-zinc-200">{{ formatarHora(item.retornoAlmoco) }}</span>
            </div>
            <div class="p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
              <span class="text-[10px] text-zinc-400 block">Saída</span>
              <span class="font-mono font-medium text-zinc-700 dark:text-zinc-200">{{ formatarHora(item.saidaDia) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL: NOVO AJUSTE / COMPENSAÇÃO DE HORAS -->
    <div
      v-if="modalAjusteAberto"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div class="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl flex flex-col gap-4">
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-icons text-blue-500">more_time</span>
            <h2 class="text-base font-semibold text-zinc-900 dark:text-white">Lançar Ajuste de Horas</h2>
          </div>
          <button @click="modalAjusteAberto = false" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
            <span class="material-icons">close</span>
          </button>
        </div>

        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          Adicione horas positivas (crédito) ou negativas (débito) para compensações e acertos com o ponto oficial.
        </p>

        <!-- Data -->
        <div>
          <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Data do ajuste (DD/MM/AAAA)</label>
          <input
            v-model="formAjuste.data"
            type="text"
            placeholder="Ex: 13/09/2026"
            class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Tipo de Saldo: Positivo (+) ou Negativo (-) -->
        <div>
          <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Tipo de Saldo</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="formAjuste.sinal = 1"
              class="py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              :class="formAjuste.sinal === 1 ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'">
              <span class="material-icons text-sm">add</span>
              <span>Positivo (+ Horas)</span>
            </button>

            <button
              type="button"
              @click="formAjuste.sinal = -1"
              class="py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              :class="formAjuste.sinal === -1 ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'">
              <span class="material-icons text-sm">remove</span>
              <span>Negativo (- Horas)</span>
            </button>
          </div>
        </div>

        <!-- Quantidade de Horas e Minutos -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Horas</label>
            <input
              v-model.number="formAjuste.horas"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Minutos</label>
            <input
              v-model.number="formAjuste.minutos"
              type="number"
              min="0"
              max="59"
              class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <!-- Descrição / Motivo -->
        <div>
          <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Motivo / Descrição</label>
          <input
            v-model="formAjuste.descricao"
            type="text"
            placeholder="Ex: Empresa liberou 4h a compensar"
            class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            @click="modalAjusteAberto = false"
            class="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            @click="salvarNovoAjuste"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
            Adicionar Ajuste
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: EDITAR REGISTRO EXISTENTE -->
    <div
      v-if="modalEdicaoAberto && registroEmEdicao"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div class="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl flex flex-col gap-4">
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-icons text-blue-500">edit_note</span>
            <h2 class="text-base font-semibold text-zinc-900 dark:text-white">
              {{ registroEmEdicao.isCompensacao ? 'Editar Ajuste' : 'Editar Registro' }}
            </h2>
          </div>
          <button @click="modalEdicaoAberto = false" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Data -->
        <div>
          <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Data</label>
          <input
            v-model="formEdicao.data"
            type="text"
            class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Se for registro normal: horários -->
        <div v-if="!registroEmEdicao.isCompensacao" class="flex flex-col gap-2.5">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Entrada</label>
              <input
                v-model="formEdicao.entrada"
                type="time"
                class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Saída Almoço</label>
              <input
                v-model="formEdicao.saidaAlmoco"
                type="time"
                class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Retorno Almoço</label>
              <input
                v-model="formEdicao.retornoAlmoco"
                type="time"
                class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Saída Dia</label>
              <input
                v-model="formEdicao.saidaDia"
                type="time"
                class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <!-- Se for compensação: Horas/Minutos e Sinal -->
        <div v-else class="flex flex-col gap-2.5">
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="formEdicao.sinal = 1"
              class="py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              :class="formEdicao.sinal === 1 ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'">
              <span>Positivo (+)</span>
            </button>
            <button
              type="button"
              @click="formEdicao.sinal = -1"
              class="py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              :class="formEdicao.sinal === -1 ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'">
              <span>Negativo (-)</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Horas</label>
              <input
                v-model.number="formEdicao.horas"
                type="number"
                min="0"
                class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Minutos</label>
              <input
                v-model.number="formEdicao.minutos"
                type="number"
                min="0"
                max="59"
                class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <!-- Descrição / Observação -->
        <div>
          <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Observação / Descrição</label>
          <input
            v-model="formEdicao.descricao"
            type="text"
            placeholder="Opcional"
            class="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            @click="modalEdicaoAberto = false"
            class="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            @click="salvarEdicaoRegistro"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  RegistroHistorico,
  obterHistoricoCompleto,
  salvarRegistroEditado,
  removerRegistroDoHistorico,
  criarRegistroAjuste,
  exportarHistoricoCSV,
  importarHistoricoCSV,
  obterCargaHoraria,
  obterConfigCiclo,
  calcularPeriodoCiclo,
  isDataNoPeriodo,
  ConfigCiclo,
  calcularSaldoRegistro,
  formatarSaldo,
  formatarHora,
} from '@/services/timesheetStorage';
import ChangeTheme from '@/components/ChangeTheme.vue';

const historico = ref<RegistroHistorico[]>([]);
const cargaHoraria = ref<number>(obterCargaHoraria());
const configCiclo = ref<ConfigCiclo>(obterConfigCiclo());
const filtroCiclo = ref<'ciclo' | 'todos'>('ciclo');

const mensagemFeedback = ref('');
const tipoFeedback = ref<'sucesso' | 'erro'>('sucesso');

const modalAjusteAberto = ref(false);
const formAjuste = ref({
  data: '',
  sinal: -1, // -1 ou 1
  horas: 4,
  minutos: 0,
  descricao: '',
});

const modalEdicaoAberto = ref(false);
const registroEmEdicao = ref<RegistroHistorico | null>(null);
const formEdicao = ref({
  data: '',
  entrada: '',
  saidaAlmoco: '',
  retornoAlmoco: '',
  saidaDia: '',
  sinal: 1,
  horas: 0,
  minutos: 0,
  descricao: '',
});

const carregarDados = async () => {
  cargaHoraria.value = obterCargaHoraria();
  configCiclo.value = obterConfigCiclo();
  historico.value = await obterHistoricoCompleto();
};

const periodoAtual = computed(() => {
  return calcularPeriodoCiclo(configCiclo.value.diaInicio, configCiclo.value.diaFim);
});

const registrosFiltrados = computed(() => {
  if (filtroCiclo.value === 'todos') {
    return historico.value;
  }
  const { inicio, fim } = periodoAtual.value;
  return historico.value.filter((reg) => isDataNoPeriodo(reg.data, inicio, fim));
});

const calcularSaldo = (reg: RegistroHistorico) => {
  return calcularSaldoRegistro(reg, cargaHoraria.value);
};

const saldoFiltradoMs = computed(() => {
  return registrosFiltrados.value.reduce((total, item) => total + calcularSaldo(item), 0);
});

const exibirFeedback = (msg: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
  mensagemFeedback.value = msg;
  tipoFeedback.value = tipo;
  setTimeout(() => {
    mensagemFeedback.value = '';
  }, 4000);
};

const exportarCSV = async () => {
  try {
    if (filtroCiclo.value === 'ciclo') {
      await exportarHistoricoCSV(periodoAtual.value.inicio, periodoAtual.value.fim);
      exibirFeedback(`Registros do ciclo (${periodoAtual.value.textoFormatado}) exportados!`, 'sucesso');
    } else {
      await exportarHistoricoCSV();
      exibirFeedback('Todos os registros exportados!', 'sucesso');
    }
  } catch (e) {
    exibirFeedback('Erro ao exportar CSV', 'erro');
  }
};

const handleImportarCSV = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  try {
    const text = await file.text();
    const resultado = await importarHistoricoCSV(text);
    await carregarDados();
    exibirFeedback(`${resultado.importados} registros importados com sucesso!`, 'sucesso');
  } catch (err: any) {
    exibirFeedback(`Falha ao importar CSV: ${err.message || err}`, 'erro');
  } finally {
    input.value = '';
  }
};

const abrirModalNovoAjuste = () => {
  formAjuste.value = {
    data: new Date().toLocaleDateString('pt-BR'),
    sinal: -1,
    horas: 4,
    minutos: 0,
    descricao: '',
  };
  modalAjusteAberto.value = true;
};

const salvarNovoAjuste = async () => {
  const totalMs = formAjuste.value.sinal * (formAjuste.value.horas * 3600000 + formAjuste.value.minutos * 60000);
  await criarRegistroAjuste(formAjuste.value.data, totalMs, formAjuste.value.descricao);
  modalAjusteAberto.value = false;
  await carregarDados();
  exibirFeedback('Ajuste adicionado com sucesso!', 'sucesso');
};

const extrairHoraString = (timestamp: number | null): string => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const parseHoraStringHoje = (dataStr: string, horaStr: string): number | null => {
  if (!horaStr || !horaStr.includes(':')) return null;
  const [h, m] = horaStr.split(':');
  const partes = dataStr.split('/');
  if (partes.length === 3) {
    const d = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]), Number(h), Number(m), 0, 0);
    return d.getTime();
  }
  const d = new Date();
  d.setHours(Number(h), Number(m), 0, 0);
  return d.getTime();
};

const abrirModalEditarRegistro = (reg: RegistroHistorico) => {
  registroEmEdicao.value = reg;
  const saldoMs = reg.saldoCompensacao || 0;
  const abs = Math.abs(saldoMs);

  formEdicao.value = {
    data: reg.data,
    entrada: extrairHoraString(reg.entrada),
    saidaAlmoco: extrairHoraString(reg.saidaAlmoco),
    retornoAlmoco: extrairHoraString(reg.retornoAlmoco),
    saidaDia: extrairHoraString(reg.saidaDia),
    sinal: saldoMs < 0 ? -1 : 1,
    horas: Math.floor(abs / 3600000),
    minutos: Math.floor((abs % 3600000) / 60000),
    descricao: reg.descricao || '',
  };

  modalEdicaoAberto.value = true;
};

const salvarEdicaoRegistro = async () => {
  if (!registroEmEdicao.value) return;

  const data = formEdicao.value.data;

  if (registroEmEdicao.value.isCompensacao) {
    const saldoMs = formEdicao.value.sinal * (formEdicao.value.horas * 3600000 + formEdicao.value.minutos * 60000);
    const atualizado: RegistroHistorico = {
      ...registroEmEdicao.value,
      data,
      saldoCompensacao: saldoMs,
      descricao: formEdicao.value.descricao,
    };
    await salvarRegistroEditado(atualizado);
  } else {
    const entrada = parseHoraStringHoje(data, formEdicao.value.entrada);
    const saidaAlmoco = parseHoraStringHoje(data, formEdicao.value.saidaAlmoco);
    const retornoAlmoco = parseHoraStringHoje(data, formEdicao.value.retornoAlmoco);
    const saidaDia = parseHoraStringHoje(data, formEdicao.value.saidaDia) || (entrada ? entrada + 8 * 3600000 : Date.now());

    const atualizado: RegistroHistorico = {
      ...registroEmEdicao.value,
      data,
      entrada,
      saidaAlmoco,
      retornoAlmoco,
      saidaDia,
      descricao: formEdicao.value.descricao,
    };
    await salvarRegistroEditado(atualizado);
  }

  modalEdicaoAberto.value = false;
  await carregarDados();
  exibirFeedback('Registro atualizado com sucesso!', 'sucesso');
};

const excluirItem = async (id: number) => {
  if (confirm('Tem certeza de que deseja remover este registro permanentemente?')) {
    await removerRegistroDoHistorico(id);
    await carregarDados();
    exibirFeedback('Registro removido!', 'sucesso');
  }
};

onMounted(() => {
  carregarDados();
});
</script>

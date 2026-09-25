<template>
  <div class="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link
          to="/home"
          class="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all">
          <span class="material-icons text-xl">arrow_back</span>
        </router-link>
        <div>
          <h1 class="text-lg font-semibold tracking-tight">Registros & Ganhos</h1>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Histórico, ajustes & estimativa mensal</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <ChangeTheme />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-lg w-full mx-auto px-4 py-6 flex flex-col gap-5">

      <!-- Seletor / Navegador de Ciclo por Mês -->
      <section class="p-3 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col gap-2.5">
        <div class="flex items-center justify-between gap-2">
          <!-- Botão Ciclo Anterior -->
          <button
            type="button"
            @click="navegarCiclo(-1)"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all cursor-pointer"
            title="Ciclo Anterior">
            <span class="material-icons text-lg">chevron_left</span>
          </button>

          <!-- Dropdown Seletor de Ciclo -->
          <div class="flex-1 relative">
            <select
              v-model="seletorCicloValor"
              class="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 px-3 pr-8 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-center">
              <option
                v-for="c in listaCiclosDisponiveis"
                :key="c.key"
                :value="c.key">
                Ciclo {{ c.rotulo }} ({{ c.textoFormatado }})
              </option>
              <option value="todos">Todos os Registros (Geral)</option>
            </select>
            <span class="material-icons absolute right-2.5 top-2 text-zinc-400 text-base pointer-events-none">unfold_more</span>
          </div>

          <!-- Botão Próximo Ciclo -->
          <button
            type="button"
            @click="navegarCiclo(1)"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all cursor-pointer"
            title="Próximo Ciclo">
            <span class="material-icons text-lg">chevron_right</span>
          </button>
        </div>

        <!-- Linha de Detalhes do Ciclo Ativo -->
        <div class="flex items-center justify-between px-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div class="flex items-center gap-1.5 font-medium truncate">
            <span class="material-icons text-xs text-blue-500">date_range</span>
            <span v-if="seletorCicloValor !== 'todos'">
              Período: <strong>{{ cicloAtivo?.textoFormatado }}</strong>
            </span>
            <span v-else>
              Exibindo todo o histórico acumulado
            </span>
          </div>

          <span
            v-if="seletorCicloValor === cicloAtualEmAberto.key"
            class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px] shrink-0">
            Ciclo Atual
          </span>
        </div>
      </section>

      <!-- Alternador de Abas: Registros vs Dashboard -->
      <div class="grid grid-cols-2 p-1 rounded-2xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800 text-xs font-semibold">
        <button
          type="button"
          @click="abaAtiva = 'registros'"
          class="py-2.5 px-3 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
          :class="abaAtiva === 'registros' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'">
          <span class="material-icons text-sm">format_list_bulleted</span>
          <span>Registros de Ponto</span>
        </button>

        <button
          type="button"
          @click="abaAtiva = 'dashboard'"
          class="py-2.5 px-3 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
          :class="abaAtiva === 'dashboard' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'">
          <span class="material-icons text-sm">analytics</span>
          <span>Dashboard & Ganhos</span>
        </button>
      </div>

      <!-- ============================================================= -->
      <!-- ABA 1: REGISTROS DE PONTO                                     -->
      <!-- ============================================================= -->
      <div v-if="abaAtiva === 'registros'" class="flex flex-col gap-5">
        <!-- Balance Card -->
        <div class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">
              {{ seletorCicloValor === 'todos' ? 'Saldo Geral Acumulado' : `Saldo do Ciclo (${cicloAtivo?.rotulo})` }}
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
            <span>{{ seletorCicloValor === 'todos' ? 'Exportar Tudo' : 'Exportar Ciclo' }}</span>
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
            {{ seletorCicloValor === 'todos' ? 'Nenhum registro encontrado' : `Nenhum registro no ciclo (${cicloAtivo?.textoFormatado})` }}
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
      </div>

      <!-- ============================================================= -->
      <!-- ABA 2: DASHBOARD & ESTIMATIVA DE GANHOS                       -->
      <!-- ============================================================= -->
      <div v-else class="flex flex-col gap-5">
        <!-- Aviso se estiver em 'Todos os Registros' -->
        <div v-if="seletorCicloValor === 'todos'" class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center flex flex-col items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span class="material-icons text-2xl">event_note</span>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Selecione um Ciclo Mensal</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
              O fechamento financeiro e estimativa de proventos são calculados individualmente por ciclo.
            </p>
          </div>
          <button
            type="button"
            @click="seletorCicloValor = cicloAtualEmAberto.key"
            class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all">
            Ver Ciclo Atual ({{ cicloAtualEmAberto.rotulo }})
          </button>
        </div>

        <!-- Painel do Ciclo Específico -->
        <template v-else>
          <!-- Card de Salário Base do Ciclo (Isolado e Customizável) -->
          <div class="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Salário Base do Ciclo
                </span>
                <span
                  class="px-2 py-0.2 text-[10px] font-bold rounded-full"
                  :class="salarioDoCicloInfo.isCustomizado ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'">
                  {{ salarioDoCicloInfo.isCustomizado ? 'Personalizado deste mês' : 'Configuração Geral' }}
                </span>
              </div>
              <div class="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                {{ formatarMoeda(salarioDoCicloInfo.salario) }}
              </div>
            </div>

            <button
              type="button"
              @click="abrirModalSalarioCiclo"
              class="py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer">
              <span class="material-icons text-sm">edit</span>
              <span>Definir Salário</span>
            </button>
          </div>

          <!-- Hero Card: Estimativa Total com Banco de Horas -->
          <div class="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-sm flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span class="material-icons text-sm">payments</span>
                <span>Previsão de Ganhos</span>
              </span>
              <span class="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                {{ cicloAtivo?.rotulo }}
              </span>
            </div>

            <div
              class="text-4xl font-extrabold font-mono tracking-tight"
              :class="estimativas.totalEstimado >= estimativas.salarioBase ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
              {{ formatarMoeda(estimativas.totalEstimado) }}
            </div>

            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
              <span v-if="estimativas.saldoMs > 0">
                Salário base + {{ estimativas.saldoFormatado }} extras no banco de horas (+{{ (estimativas.pctExtra * 100).toFixed(0) }}%)
              </span>
              <span v-else-if="estimativas.saldoMs < 0">
                Salário base com débito de {{ estimativas.saldoFormatado }} no banco de horas
              </span>
              <span v-else>
                Salário base contratual (banco de horas zerado)
              </span>
            </p>

            <!-- Quick Chips -->
            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/15 text-center">
              <div class="p-2 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Salário Base</span>
                <span class="text-xs font-bold font-mono text-zinc-700 dark:text-zinc-300">{{ formatarMoeda(salarioDoCicloInfo.salario) }}</span>
              </div>
              <div class="p-2 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Saldo Banco</span>
                <span
                  class="text-xs font-bold font-mono"
                  :class="estimativas.saldoMs >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                  {{ estimativas.saldoFormatado }}
                </span>
              </div>
              <div class="p-2 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800">
                <span class="text-[10px] text-zinc-400 block">Valor Banco</span>
                <span
                  class="text-xs font-bold font-mono"
                  :class="estimativas.saldoMs >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                  {{ (estimativas.saldoMs >= 0 ? '+' : '') + formatarMoeda(estimativas.valorBancoHoras) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Detalhamento dos Proventos & Banco -->
          <div class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col gap-3">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Detalhamento de Proventos & Banco
            </h4>

            <div class="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              <!-- Salário Base -->
              <div class="py-2.5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-zinc-400 text-base">account_balance_wallet</span>
                  <div>
                    <span class="text-zinc-700 dark:text-zinc-300 block">Salário Contratual</span>
                    <span class="text-[11px] text-zinc-400">Remuneração mensal fixa do ciclo</span>
                  </div>
                </div>
                <span class="font-mono font-semibold">{{ formatarMoeda(salarioDoCicloInfo.salario) }}</span>
              </div>

              <!-- Banco de Horas (Horas Extras / Débito) -->
              <div class="py-2.5 flex items-center justify-between">
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span
                      class="material-icons text-base"
                      :class="estimativas.saldoMs >= 0 ? 'text-emerald-500' : 'text-rose-500'">
                      timelapse
                    </span>
                    <span class="text-zinc-700 dark:text-zinc-300">
                      {{ estimativas.saldoMs >= 0 ? 'Horas Extras no Banco' : 'Horas em Débito no Banco' }}
                    </span>
                  </div>
                  <span class="text-[11px] text-zinc-400 pl-6 font-mono">
                    {{ estimativas.saldoFormatado }}
                    <span v-if="estimativas.saldoMs > 0"> (+{{ (estimativas.pctExtra * 100).toFixed(0) }}% adicional)</span>
                  </span>
                </div>
                <span
                  class="font-mono font-semibold"
                  :class="estimativas.saldoMs >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                  {{ (estimativas.saldoMs >= 0 ? '+' : '') + formatarMoeda(estimativas.valorBancoHoras) }}
                </span>
              </div>

              <!-- Valor Base da Hora e Hora Extra -->
              <div class="py-2.5 flex items-center justify-between">
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-blue-500 text-base">schedule</span>
                    <span class="text-zinc-700 dark:text-zinc-300">Valor da Hora de Trabalho</span>
                  </div>
                  <span class="text-[11px] text-zinc-400 pl-6 font-mono">
                    Base: {{ formatarMoeda(estimativas.valorHora) }}/h • Extra (+{{ (estimativas.pctExtra * 100).toFixed(0) }}%): {{ formatarMoeda(estimativas.valorHoraExtra) }}/h
                  </span>
                </div>
                <span class="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                  {{ formatarMoeda(estimativas.valorHora) }}/h
                </span>
              </div>

              <!-- Total Estimado -->
              <div class="py-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 -mx-5 px-5">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-emerald-500 text-lg">check_circle</span>
                  <div>
                    <span class="font-bold text-sm text-zinc-900 dark:text-white block">Previsão Total</span>
                    <span class="text-[10px] text-zinc-400">Salário base {{ estimativas.saldoMs >= 0 ? '+' : '-' }} equivalência do banco</span>
                  </div>
                </div>
                <span class="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {{ formatarMoeda(estimativas.totalEstimado) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Jornada de Trabalho & Estatísticas -->
          <div class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col gap-3.5">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Jornada & Estatísticas do Ciclo
            </h4>

            <!-- Barra de Progresso Horas Trabalhadas vs Previstas -->
            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-zinc-600 dark:text-zinc-300">Horas Trabalhadas</span>
                <span class="font-mono font-semibold text-zinc-900 dark:text-white">
                  {{ estimativas.totalHorasTrabalhadasFormatado }}
                </span>
              </div>

              <div class="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  class="h-full bg-blue-500 rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min(100, estimativas.percentualJornadaCumprida)}%` }"></div>
              </div>

              <div class="flex justify-between text-[11px] text-zinc-400">
                <span>Progresso: {{ estimativas.percentualJornadaCumprida }}%</span>
                <span>Base: {{ formatarMoeda(estimativas.valorHora) }}/h</span>
              </div>
            </div>

            <!-- Mini Grid de Métricas -->
            <div class="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div class="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <span class="text-[10px] text-zinc-400 block">Dias com Registro</span>
                <span class="text-base font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  {{ estimativas.diasTrabalhados }} dias
                </span>
              </div>

              <div class="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <span class="text-[10px] text-zinc-400 block">Média Diária Trabalhada</span>
                <span class="text-base font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  {{ estimativas.mediaDiariaTrabalhadaFormatada }}
                </span>
              </div>
            </div>
          </div>
        </template>
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
            placeholder="Ex: Folga compensatória autorizada"
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

    <!-- MODAL: DEFINIR SALÁRIO DO CICLO -->
    <div
      v-if="modalSalarioCicloAberto"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div class="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-icons text-emerald-500">payments</span>
            <h2 class="text-base font-semibold text-zinc-900 dark:text-white">Salário do Ciclo</h2>
          </div>
          <button @click="modalSalarioCicloAberto = false" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
            <span class="material-icons">close</span>
          </button>
        </div>

        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Defina o salário base exclusivo para o <strong>Ciclo {{ cicloAtivo?.rotulo }}</strong>.
          Alterações futuras nas configurações gerais não modificarão os valores definidos para este ciclo.
        </p>

        <div>
          <label class="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Salário para este ciclo (R$)
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-sm font-bold text-zinc-400">R$</span>
            <input
              v-model.number="formSalarioCicloValor"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              class="w-full pl-10 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="modalSalarioCicloAberto = false"
              class="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button
              type="button"
              @click="confirmarSalarioDoCiclo"
              class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
              Salvar p/ este Ciclo
            </button>
          </div>

          <button
            v-if="salarioDoCicloInfo.isCustomizado"
            type="button"
            @click="restaurarSalarioPadrao"
            class="w-full py-2 rounded-xl text-xs text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer">
            Restaurar padrão geral ({{ formatarMoeda(configFinancas.salarioMensal) }})
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
  calcularPeriodoCicloPorAnoMes,
  listarCiclosDisponiveis,
  isDataNoPeriodo,
  ConfigCiclo,
  obterConfigFinanceira,
  ConfigFinanceira,
  obterSalarioDoCiclo,
  salvarSalarioDoCiclo,
  removerSalarioCustomizadoDoCiclo,
  calcularSaldoRegistro,
  formatarSaldo,
  formatarHora,
  formatarDuracaoCurta,
  CicloInfo,
} from '@/services/timesheetStorage';
import ChangeTheme from '@/components/ChangeTheme.vue';

const historico = ref<RegistroHistorico[]>([]);
const cargaHoraria = ref<number>(obterCargaHoraria());
const configCiclo = ref<ConfigCiclo>(obterConfigCiclo());
const configFinancas = ref<ConfigFinanceira>(obterConfigFinanceira());

const abaAtiva = ref<'registros' | 'dashboard'>('registros');
const seletorCicloValor = ref<string>(''); // Chave do ciclo (ex: '2026-09') ou 'todos'

const mensagemFeedback = ref('');
const tipoFeedback = ref<'sucesso' | 'erro'>('sucesso');

// Salário do ciclo ativo
const salarioDoCicloInfo = ref<{ salario: number; isCustomizado: boolean }>({
  salario: 0,
  isCustomizado: false,
});
const modalSalarioCicloAberto = ref(false);
const formSalarioCicloValor = ref(0);

// Modais existentes
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

const cicloAtualEmAberto = computed(() => {
  return calcularPeriodoCiclo(configCiclo.value.diaInicio, configCiclo.value.diaFim);
});

const listaCiclosDisponiveis = computed<CicloInfo[]>(() => {
  return listarCiclosDisponiveis(historico.value, configCiclo.value.diaInicio, configCiclo.value.diaFim);
});

const cicloAtivo = computed<CicloInfo | null>(() => {
  if (seletorCicloValor.value === 'todos') {
    return null;
  }
  const encontrado = listaCiclosDisponiveis.value.find((c) => c.key === seletorCicloValor.value);
  if (encontrado) return encontrado;

  // Se não estiver na lista (ex: navegado), calcula dinamicamente
  if (seletorCicloValor.value.includes('-')) {
    const [anoStr, mesStr] = seletorCicloValor.value.split('-');
    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10);
    if (!isNaN(ano) && !isNaN(mes)) {
      return calcularPeriodoCicloPorAnoMes(configCiclo.value.diaInicio, configCiclo.value.diaFim, ano, mes);
    }
  }

  return cicloAtualEmAberto.value;
});

const atualizarSalarioDoCiclo = () => {
  if (cicloAtivo.value) {
    salarioDoCicloInfo.value = obterSalarioDoCiclo(cicloAtivo.value.key);
  } else {
    salarioDoCicloInfo.value = {
      salario: configFinancas.value.salarioMensal || 0,
      isCustomizado: false,
    };
  }
};

const carregarDados = async () => {
  cargaHoraria.value = obterCargaHoraria();
  configCiclo.value = obterConfigCiclo();
  configFinancas.value = obterConfigFinanceira();
  historico.value = await obterHistoricoCompleto();

  if (!seletorCicloValor.value) {
    seletorCicloValor.value = cicloAtualEmAberto.value.key;
  }

  atualizarSalarioDoCiclo();
};

const registrosFiltrados = computed(() => {
  if (seletorCicloValor.value === 'todos') {
    return historico.value;
  }
  if (!cicloAtivo.value) return [];
  const { inicio, fim } = cicloAtivo.value;
  return historico.value.filter((reg) => isDataNoPeriodo(reg.data, inicio, fim));
});

const calcularSaldo = (reg: RegistroHistorico) => {
  return calcularSaldoRegistro(reg, cargaHoraria.value);
};

const saldoFiltradoMs = computed(() => {
  return registrosFiltrados.value.reduce((total, item) => total + calcularSaldo(item), 0);
});

// Navegação entre ciclos (< e >)
const navegarCiclo = (direcao: -1 | 1) => {
  // direcao = -1: mês anterior
  // direcao = 1: próximo mês
  if (seletorCicloValor.value === 'todos') {
    seletorCicloValor.value = cicloAtualEmAberto.value.key;
    atualizarSalarioDoCiclo();
    return;
  }

  const atual = cicloAtivo.value || cicloAtualEmAberto.value;
  let novoMes = atual.mes + direcao;
  let novoAno = atual.ano;

  if (novoMes < 1) {
    novoMes = 12;
    novoAno -= 1;
  } else if (novoMes > 12) {
    novoMes = 1;
    novoAno += 1;
  }

  const novaKey = `${novoAno}-${String(novoMes).padStart(2, '0')}`;
  seletorCicloValor.value = novaKey;
  atualizarSalarioDoCiclo();
};

// Modal de Salário do Ciclo
const abrirModalSalarioCiclo = () => {
  formSalarioCicloValor.value = salarioDoCicloInfo.value.salario;
  modalSalarioCicloAberto.value = true;
};

const confirmarSalarioDoCiclo = () => {
  if (!cicloAtivo.value) return;
  salvarSalarioDoCiclo(cicloAtivo.value.key, formSalarioCicloValor.value);
  atualizarSalarioDoCiclo();
  modalSalarioCicloAberto.value = false;
  exibirFeedback(`Salário do Ciclo ${cicloAtivo.value.rotulo} atualizado!`, 'sucesso');
};

const restaurarSalarioPadrao = () => {
  if (!cicloAtivo.value) return;
  removerSalarioCustomizadoDoCiclo(cicloAtivo.value.key);
  atualizarSalarioDoCiclo();
  modalSalarioCicloAberto.value = false;
  exibirFeedback(`Salário do ciclo restaurado para o padrão geral!`, 'sucesso');
};

// =====================================================================
// Cálculos do Dashboard de Ganhos com Base em Banco de Horas
// =====================================================================
const estimativas = computed(() => {
  const salarioBase = salarioDoCicloInfo.value.salario || 0;
  const diasUteisConfig = configFinancas.value.diasUteisMes || 22;
  const cargaHorariaHoras = cargaHoraria.value / 3600000;
  const totalHorasEsperadasMes = diasUteisConfig * cargaHorariaHoras;

  const valorHora = totalHorasEsperadasMes > 0 ? salarioBase / totalHorasEsperadasMes : 0;
  const pctExtra = (configFinancas.value.adicionalExtra ?? 50) / 100;
  const valorHoraExtra = valorHora * (1 + pctExtra);

  // O cálculo é baseado exclusivamente no saldo acumulado do Banco de Horas (saldoFiltradoMs)
  const saldoMs = saldoFiltradoMs.value;
  const saldoHoras = saldoMs / 3600000;

  // Se o saldo for positivo, são horas extras calculadas com o adicional (ex: +50%)
  // Se for negativo, é débito proporcional ao valor da hora normal
  const valorBancoHoras = saldoMs >= 0
    ? saldoHoras * valorHoraExtra
    : saldoHoras * valorHora;

  // Previsão Total: Salário Base + Valor do Banco de Horas
  const totalEstimado = salarioBase + valorBancoHoras;

  let totalTrabalhadoMs = 0;
  let diasTrabalhados = 0;

  for (const reg of registrosFiltrados.value) {
    if (reg.isCompensacao) continue;

    if (reg.entrada && reg.saidaDia) {
      let trabalhadoDiaMs = 0;
      if (reg.saidaAlmoco && reg.retornoAlmoco) {
        trabalhadoDiaMs = Math.max(0, reg.saidaAlmoco - reg.entrada) + Math.max(0, reg.saidaDia - reg.retornoAlmoco);
      } else {
        trabalhadoDiaMs = Math.max(0, reg.saidaDia - reg.entrada);
      }

      totalTrabalhadoMs += trabalhadoDiaMs;
      if (trabalhadoDiaMs > 0) diasTrabalhados++;
    }
  }

  const cargaPrevistaCicloMs = diasTrabalhados * cargaHoraria.value;
  const percentualJornadaCumprida = cargaPrevistaCicloMs > 0
    ? Math.round((totalTrabalhadoMs / cargaPrevistaCicloMs) * 100)
    : 0;

  const mediaDiariaMs = diasTrabalhados > 0 ? Math.floor(totalTrabalhadoMs / diasTrabalhados) : 0;

  return {
    salarioBase,
    valorHora,
    valorHoraExtra,
    pctExtra,
    saldoMs,
    saldoHoras,
    saldoFormatado: formatarSaldo(saldoMs),
    valorBancoHoras,
    totalEstimado,
    totalTrabalhadoMs,
    totalHorasTrabalhadasFormatado: formatarDuracaoCurta(totalTrabalhadoMs),
    diasTrabalhados,
    percentualJornadaCumprida,
    mediaDiariaTrabalhadaFormatada: formatarDuracaoCurta(mediaDiariaMs),
  };
});

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor || 0);
};

const exibirFeedback = (msg: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
  mensagemFeedback.value = msg;
  tipoFeedback.value = tipo;
  setTimeout(() => {
    mensagemFeedback.value = '';
  }, 4000);
};

const exportarCSV = async () => {
  try {
    if (cicloAtivo.value && seletorCicloValor.value !== 'todos') {
      await exportarHistoricoCSV(cicloAtivo.value.inicio, cicloAtivo.value.fim);
      exibirFeedback(`Registros do ciclo (${cicloAtivo.value.textoFormatado}) exportados!`, 'sucesso');
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

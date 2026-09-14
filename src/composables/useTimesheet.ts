import { ref, computed } from 'vue';
import {
  DadosPonto,
  ConfigFinanceira,
  carregarEstado,
  salvarEstado,
  arquivarRegistroNoHistorico,
  obterCargaHoraria,
  obterTempoAlmoco,
  obterConfigFinanceira,
  formatarDuracao,
  formatarHora,
} from '@/services/timesheetStorage';

const dadosPonto = ref<DadosPonto>({
  estado: 0,
  inicioDia: null,
  inicioAlmoco: null,
  fimAlmoco: null,
});

const configFinanceira = ref<ConfigFinanceira>(obterConfigFinanceira());
const now = ref<Date>(new Date());
let timerInterval: number | null = null;

export function useTimesheet() {
  const cargaHoraria = ref<number>(obterCargaHoraria());
  const tempoAlmoco = ref<number>(obterTempoAlmoco());

  const recarregarConfiguracoes = () => {
    cargaHoraria.value = obterCargaHoraria();
    tempoAlmoco.value = obterTempoAlmoco();
    configFinanceira.value = obterConfigFinanceira();
  };

  const inicializar = async () => {
    recarregarConfiguracoes();
    try {
      const estadoSalvo = await carregarEstado();
      dadosPonto.value = estadoSalvo;
    } catch (e) {
      console.error('Erro ao carregar estado inicial:', e);
    }
  };

  const iniciarRelogio = () => {
    if (!timerInterval) {
      now.value = new Date();
      timerInterval = window.setInterval(() => {
        now.value = new Date();
      }, 1000);
    }
  };

  const pararRelogio = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  // Formatações do relógio principal
  const horaFormatada = computed(() => {
    const h = String(now.value.getHours()).padStart(2, '0');
    const m = String(now.value.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  const segundosFormatados = computed(() => {
    return String(now.value.getSeconds()).padStart(2, '0');
  });

  const dataFormatada = computed(() => {
    return now.value.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  });

  // Cálculo de tempos trabalhados e estimativa
  const tempoTrabalhadoHojeMs = computed(() => {
    const agoraMs = now.value.getTime();
    if (!dadosPonto.value.inicioDia) return 0;

    switch (dadosPonto.value.estado) {
      case 1: // Turno 1
        return Math.max(0, agoraMs - dadosPonto.value.inicioDia);
      case 2: // Em almoço: tempo até sair para almoço
        return dadosPonto.value.inicioAlmoco
          ? Math.max(0, dadosPonto.value.inicioAlmoco - dadosPonto.value.inicioDia)
          : 0;
      case 3: {
        // Turno 2
        const turno1 = dadosPonto.value.inicioAlmoco
          ? Math.max(0, dadosPonto.value.inicioAlmoco - dadosPonto.value.inicioDia)
          : 0;
        const turno2 = dadosPonto.value.fimAlmoco
          ? Math.max(0, agoraMs - dadosPonto.value.fimAlmoco)
          : Math.max(0, agoraMs - dadosPonto.value.inicioDia);
        return turno1 + turno2;
      }
      default:
        return 0;
    }
  });

  // Tempo de almoço decorrido (quando estado == 2)
  const tempoAlmocoDecorridoMs = computed(() => {
    if (dadosPonto.value.estado !== 2 || !dadosPonto.value.inicioAlmoco) return 0;
    return Math.max(0, now.value.getTime() - dadosPonto.value.inicioAlmoco);
  });

  // Tempo de almoço restante (quando estado == 2)
  const tempoAlmocoRestanteMs = computed(() => {
    if (dadosPonto.value.estado !== 2 || !dadosPonto.value.inicioAlmoco) return tempoAlmoco.value;
    const decorrido = tempoAlmocoDecorridoMs.value;
    return tempoAlmoco.value - decorrido;
  });

  // Horário estimado de saída
  const estimativaSaida = computed<string | null>(() => {
    const agoraMs = now.value.getTime();
    if (dadosPonto.value.estado === 0 || !dadosPonto.value.inicioDia) {
      return null;
    }
    if (dadosPonto.value.estado === 2) {
      // Em intervalo de almoço
      return null;
    }

    let trabalhado = 0;
    let totalNecessario = cargaHoraria.value;

    if (dadosPonto.value.estado === 1) {
      trabalhado = agoraMs - dadosPonto.value.inicioDia;
      totalNecessario = cargaHoraria.value + tempoAlmoco.value;
    } else if (dadosPonto.value.estado === 3) {
      if (dadosPonto.value.inicioAlmoco && dadosPonto.value.fimAlmoco) {
        const t1 = dadosPonto.value.inicioAlmoco - dadosPonto.value.inicioDia;
        const t2 = agoraMs - dadosPonto.value.fimAlmoco;
        trabalhado = t1 + t2;
      } else {
        trabalhado = agoraMs - dadosPonto.value.inicioDia;
      }
    }

    const restante = totalNecessario - trabalhado;
    if (restante <= 60000) return null;

    const dataSaida = new Date(agoraMs + restante);
    return `${String(dataSaida.getHours()).padStart(2, '0')}:${String(dataSaida.getMinutes()).padStart(2, '0')}`;
  });

  // Informações de status e ação do botão principal
  const statusInfo = computed(() => {
    switch (dadosPonto.value.estado) {
      case 0:
        return {
          badge: 'Dia Livre',
          badgeColor: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
          indicatorColor: 'bg-zinc-400',
          title: 'Iniciar Expediente',
          subtitle: 'Toque para confirmar início',
          icon: 'play_arrow',
          accentBorder: 'hover:border-blue-500/50 dark:hover:border-blue-500/40',
          activeColor: 'text-blue-600 dark:text-blue-400',
        };
      case 1:
        return {
          badge: '1º Turno em Andamento',
          badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
          indicatorColor: 'bg-emerald-500 animate-pulse',
          title: 'Pausa para Almoço',
          subtitle: 'Toque para registrar almoço',
          icon: 'restaurant',
          accentBorder: 'hover:border-amber-500/50 dark:hover:border-amber-500/40',
          activeColor: 'text-amber-600 dark:text-amber-400',
        };
      case 2:
        return {
          badge: 'Intervalo de Almoço',
          badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20',
          indicatorColor: 'bg-amber-500 animate-pulse',
          title: 'Retornar do Almoço',
          subtitle: 'Toque para registrar retorno',
          icon: 'work',
          accentBorder: 'hover:border-emerald-500/50 dark:hover:border-emerald-500/40',
          activeColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 3:
        return {
          badge: '2º Turno em Andamento',
          badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20',
          indicatorColor: 'bg-blue-500 animate-pulse',
          title: 'Finalizar Expediente',
          subtitle: 'Toque para arquivar o dia',
          icon: 'check_circle',
          accentBorder: 'hover:border-rose-500/50 dark:hover:border-rose-500/40',
          activeColor: 'text-rose-600 dark:text-rose-400',
        };
      default:
        return {
          badge: 'Pronto',
          badgeColor: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
          indicatorColor: 'bg-zinc-400',
          title: 'Bater Ponto',
          subtitle: 'Toque para confirmar',
          icon: 'fingerprint',
          accentBorder: 'hover:border-blue-500/50 dark:hover:border-blue-500/40',
          activeColor: 'text-blue-600 dark:text-blue-400',
        };
    }
  });

  const feedbackHaptico = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch {
        // Ignora caso dispositivo bloqueie
      }
    }
  };

  // Transição de etapa com suporte a horário customizado
  const aplicarTransicaoEtapa = async (proximaEtapa: number, timestamp: number = Date.now()) => {
    feedbackHaptico();
    const copia = { ...dadosPonto.value };

    switch (proximaEtapa) {
      case 0:
        dadosPonto.value = {
          estado: 0,
          inicioDia: null,
          inicioAlmoco: null,
          fimAlmoco: null,
        };
        break;
      case 1:
        dadosPonto.value.estado = 1;
        dadosPonto.value.inicioDia = timestamp;
        break;
      case 2:
        dadosPonto.value.estado = 2;
        dadosPonto.value.inicioAlmoco = timestamp;
        break;
      case 3:
        dadosPonto.value.estado = 3;
        dadosPonto.value.fimAlmoco = timestamp;
        break;
      case 4: // Finalizar dia
        await arquivarRegistroNoHistorico(copia, timestamp);
        dadosPonto.value = {
          estado: 0,
          inicioDia: null,
          inicioAlmoco: null,
          fimAlmoco: null,
        };
        break;
    }

    await salvarEstado(dadosPonto.value);
  };

  // Seletor direto de etapa (permite voltar ou avançar)
  const definirEtapaDireta = async (etapaAlvo: number) => {
    feedbackHaptico();
    const agora = Date.now();

    // Se estiver voltando de almoço (2) para turno 1 (1)
    if (etapaAlvo === 1) {
      dadosPonto.value.estado = 1;
      if (!dadosPonto.value.inicioDia) dadosPonto.value.inicioDia = agora;
    } else if (etapaAlvo === 2) {
      dadosPonto.value.estado = 2;
      if (!dadosPonto.value.inicioDia) dadosPonto.value.inicioDia = agora - 4 * 3600000;
      if (!dadosPonto.value.inicioAlmoco) dadosPonto.value.inicioAlmoco = agora;
    } else if (etapaAlvo === 3) {
      dadosPonto.value.estado = 3;
      if (!dadosPonto.value.inicioDia) dadosPonto.value.inicioDia = agora - 5 * 3600000;
      if (!dadosPonto.value.inicioAlmoco) dadosPonto.value.inicioAlmoco = agora - 3600000;
      if (!dadosPonto.value.fimAlmoco) dadosPonto.value.fimAlmoco = agora;
    } else if (etapaAlvo === 0) {
      dadosPonto.value = {
        estado: 0,
        inicioDia: null,
        inicioAlmoco: null,
        fimAlmoco: null,
      };
    }

    await salvarEstado(dadosPonto.value);
  };

  const cancelarDiaAtual = async () => {
    feedbackHaptico();
    dadosPonto.value = {
      estado: 0,
      inicioDia: null,
      inicioAlmoco: null,
      fimAlmoco: null,
    };
    await salvarEstado(dadosPonto.value);
  };

  const atualizarPontoHoje = async (novosDados: Partial<DadosPonto>) => {
    dadosPonto.value = {
      ...dadosPonto.value,
      ...novosDados,
    };
    await salvarEstado(dadosPonto.value);
  };

  // ---------------------------------------------------------------------------
  // CÁLCULOS DO MOTIVADOR FINANCEIRO
  // ---------------------------------------------------------------------------
  const isFimDeSemana = computed(() => {
    const diaSemana = now.value.getDay();
    return diaSemana === 0 || diaSemana === 6; // Domingo (0) ou Sábado (6)
  });

  const temSalarioConfigurado = computed(() => {
    return configFinanceira.value.salarioMensal > 0;
  });

  const horasMensaisTrabalho = computed(() => {
    const horasDiarias = cargaHoraria.value / 3600000;
    const diasUteis = configFinanceira.value.diasUteisMes || 22;
    return horasDiarias * diasUteis;
  });

  const valorPorHoraNormal = computed(() => {
    if (!temSalarioConfigurado.value || horasMensaisTrabalho.value <= 0) return 0;
    return configFinanceira.value.salarioMensal / horasMensaisTrabalho.value;
  });

  const multiplicadorAtual = computed(() => {
    if (isFimDeSemana.value) {
      return 1 + (configFinanceira.value.adicionalFimDeSemana || 100) / 100;
    }
    // Dia de semana: verifica se já passou da carga diária
    if (tempoTrabalhadoHojeMs.value > cargaHoraria.value) {
      return 1 + (configFinanceira.value.adicionalExtra || 50) / 100;
    }
    return 1;
  });

  const ganhoHoje = computed(() => {
    if (!temSalarioConfigurado.value || valorPorHoraNormal.value <= 0) return 0;
    const trabalhadoMs = tempoTrabalhadoHojeMs.value;

    if (isFimDeSemana.value) {
      const mult = 1 + (configFinanceira.value.adicionalFimDeSemana || 100) / 100;
      return (trabalhadoMs / 3600000) * valorPorHoraNormal.value * mult;
    }

    const tempoNormalMs = Math.min(trabalhadoMs, cargaHoraria.value);
    const tempoExtraMs = Math.max(0, trabalhadoMs - cargaHoraria.value);
    const multExtra = 1 + (configFinanceira.value.adicionalExtra || 50) / 100;

    const valorNormal = (tempoNormalMs / 3600000) * valorPorHoraNormal.value;
    const valorExtra = (tempoExtraMs / 3600000) * valorPorHoraNormal.value * multExtra;

    return valorNormal + valorExtra;
  });

  const ganhoPorMinuto = computed(() => {
    if (!temSalarioConfigurado.value || valorPorHoraNormal.value <= 0) return 0;
    return (valorPorHoraNormal.value / 60) * multiplicadorAtual.value;
  });

  const ganhoPorSegundo = computed(() => {
    return ganhoPorMinuto.value / 60;
  });

  const valorPrevistoDia = computed(() => {
    if (!temSalarioConfigurado.value || valorPorHoraNormal.value <= 0) return 0;
    if (isFimDeSemana.value) {
      return ganhoHoje.value;
    }
    const valorDiariaBase = (cargaHoraria.value / 3600000) * valorPorHoraNormal.value;
    const tempoExtraMs = Math.max(0, tempoTrabalhadoHojeMs.value - cargaHoraria.value);
    const multExtra = 1 + (configFinanceira.value.adicionalExtra || 50) / 100;
    const valorExtra = (tempoExtraMs / 3600000) * valorPorHoraNormal.value * multExtra;
    return valorDiariaBase + valorExtra;
  });

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  return {
    dadosPonto,
    now,
    cargaHoraria,
    tempoAlmoco,
    configFinanceira,
    horaFormatada,
    segundosFormatados,
    dataFormatada,
    tempoTrabalhadoHojeMs,
    tempoAlmocoDecorridoMs,
    tempoAlmocoRestanteMs,
    estimativaSaida,
    statusInfo,
    inicializar,
    iniciarRelogio,
    pararRelogio,
    recarregarConfiguracoes,
    aplicarTransicaoEtapa,
    definirEtapaDireta,
    cancelarDiaAtual,
    atualizarPontoHoje,
    formatarHora,
    formatarDuracao,
    // Motivador financeiro
    isFimDeSemana,
    temSalarioConfigurado,
    multiplicadorAtual,
    ganhoHoje,
    ganhoPorMinuto,
    ganhoPorSegundo,
    valorPrevistoDia,
    formatarMoeda,
  };
}

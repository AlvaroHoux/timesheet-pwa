import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  DadosPonto,
  carregarEstado,
  salvarEstado,
  arquivarRegistroNoHistorico,
  obterCargaHoraria,
  obterTempoAlmoco,
  formatarDuracao,
  formatarHora,
} from '@/services/timesheetStorage';

const dadosPonto = ref<DadosPonto>({
  estado: 0,
  inicioDia: null,
  inicioAlmoco: null,
  fimAlmoco: null,
});

const now = ref<Date>(new Date());
let timerInterval: number | null = null;

export function useTimesheet() {
  const cargaHoraria = ref<number>(obterCargaHoraria());
  const tempoAlmoco = ref<number>(obterTempoAlmoco());

  const recarregarConfiguracoes = () => {
    cargaHoraria.value = obterCargaHoraria();
    tempoAlmoco.value = obterTempoAlmoco();
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
      case 2: // Em almoço
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

  // Horário estimado de saída
  const estimativaSaida = computed<string | null>(() => {
    const agoraMs = now.value.getTime();
    if (dadosPonto.value.estado === 0 || !dadosPonto.value.inicioDia) {
      return null;
    }
    if (dadosPonto.value.estado === 2) {
      // Em intervalo de almoço não há previsão fixa de saída
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
    if (restante <= 60000) return null; // Já bateu ou está no minuto

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
          subtitle: 'Toque para registrar entrada',
          icon: 'play_arrow',
          accentBorder: 'hover:border-blue-500/50 dark:hover:border-blue-500/40',
          glowEffect: 'group-hover:ring-blue-500/20',
          activeColor: 'text-blue-600 dark:text-blue-400',
        };
      case 1:
        return {
          badge: '1º Turno em Andamento',
          badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20',
          indicatorColor: 'bg-emerald-500 animate-pulse',
          title: 'Pausa para Almoço',
          subtitle: 'Toque para registrar saída almoço',
          icon: 'restaurant',
          accentBorder: 'hover:border-amber-500/50 dark:hover:border-amber-500/40',
          glowEffect: 'group-hover:ring-amber-500/20',
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
          glowEffect: 'group-hover:ring-emerald-500/20',
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
          glowEffect: 'group-hover:ring-rose-500/20',
          activeColor: 'text-rose-600 dark:text-rose-400',
        };
      default:
        return {
          badge: 'Pronto',
          badgeColor: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
          indicatorColor: 'bg-zinc-400',
          title: 'Bater Ponto',
          subtitle: 'Toque para registrar',
          icon: 'fingerprint',
          accentBorder: 'hover:border-blue-500/50 dark:hover:border-blue-500/40',
          glowEffect: 'group-hover:ring-blue-500/20',
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

  // Avança para o próximo estado do ponto
  const baterPonto = async (): Promise<boolean> => {
    feedbackHaptico();
    const agora = Date.now();
    const copia = { ...dadosPonto.value };

    switch (dadosPonto.value.estado) {
      case 0:
        dadosPonto.value.estado = 1;
        dadosPonto.value.inicioDia = agora;
        break;
      case 1:
        dadosPonto.value.estado = 2;
        dadosPonto.value.inicioAlmoco = agora;
        break;
      case 2:
        dadosPonto.value.estado = 3;
        dadosPonto.value.fimAlmoco = agora;
        break;
      case 3:
        await arquivarRegistroNoHistorico(copia, agora);
        dadosPonto.value = {
          estado: 0,
          inicioDia: null,
          inicioAlmoco: null,
          fimAlmoco: null,
        };
        break;
    }

    await salvarEstado(dadosPonto.value);
    return true;
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

  return {
    dadosPonto,
    now,
    cargaHoraria,
    tempoAlmoco,
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
    recarregarConfiguracoes,
    baterPonto,
    cancelarDiaAtual,
    atualizarPontoHoje,
    formatarHora,
    formatarDuracao,
  };
}

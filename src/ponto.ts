import {
  DadosPonto,
  arquivarRegistroNoHistorico,
  salvarEstado,
  carregarEstado,
  obterCargaHoraria,
} from './registros.js';
import { applyLongPress } from './utils/long-press.js';

// SCRIPT: Bloquear retorno para index.html pelo histórico do navegador
history.pushState(null, document.title, location.href);
window.addEventListener('popstate', function () {
  history.pushState(null, document.title, location.href);
});

const TEMPO_ALMOCO: number = 1 * 60 * 60 * 1000;

let dadosPonto: DadosPonto = {
  estado: 0,
  inicioDia: null,
  inicioAlmoco: null,
  fimAlmoco: null,
};

const splashScreen = document.getElementById('splashScreen') as HTMLDivElement;
const btnPonto = document.getElementById('btnPonto') as HTMLButtonElement;
const btnCancelarDia = document.getElementById('btnCancelarDia') as HTMLButtonElement;

const clockDisplay = document.getElementById('clockDisplay') as HTMLDivElement;
const statusDisplay = document.getElementById('statusDisplay') as HTMLDivElement;
const countdownDisplay = document.getElementById('countdownDisplay') as HTMLDivElement;

const estadoDropdown = document.getElementById('estadoDropdown') as HTMLSelectElement;
const btnEditarHoje = document.getElementById('btnEditarHoje') as HTMLButtonElement;
const modalEdicaoHoje = document.getElementById('modalEdicaoHoje') as HTMLDialogElement;
const formEdicaoHoje = document.getElementById('formEdicaoHoje') as HTMLFormElement;
const inputEntradaHoje = document.getElementById('inputEntradaHoje') as HTMLInputElement;
const inputSaidaAlmocoHoje = document.getElementById('inputSaidaAlmocoHoje') as HTMLInputElement;
const inputRetornoAlmocoHoje = document.getElementById('inputRetornoAlmocoHoje') as HTMLInputElement;
const btnCancelarEdicaoHoje = document.getElementById('btnCancelarEdicaoHoje') as HTMLButtonElement;

const btnConfig = document.querySelector('.btn-config') as HTMLButtonElement;
const modalConfig = document.getElementById('modalConfig') as HTMLDialogElement;
const formConfig = document.getElementById('formConfig') as HTMLFormElement;
const inputHorasCarga = document.getElementById('inputHorasCarga') as HTMLInputElement;
const inputMinutosCarga = document.getElementById('inputMinutosCarga') as HTMLInputElement;
const btnCancelarConfig = document.getElementById('btnCancelarConfig') as HTMLButtonElement;

btnConfig.addEventListener('click', () => {
  const cargaMs = obterCargaHoraria();
  const horas = Math.floor(cargaMs / (60 * 60 * 1000));
  const minutos = Math.floor((cargaMs % (60 * 60 * 1000)) / (60 * 1000));
  inputHorasCarga.value = horas.toString();
  inputMinutosCarga.value = minutos.toString();
  modalConfig.showModal();
});

btnCancelarConfig.addEventListener('click', () => {
  modalConfig.close();
});

formConfig.addEventListener('submit', (e) => {
  e.preventDefault();
  const horas = parseInt(inputHorasCarga.value || '0', 10);
  const minutos = parseInt(inputMinutosCarga.value || '0', 10);
  const cargaMs = horas * 60 * 60 * 1000 + minutos * 60 * 1000;

  localStorage.setItem('cargaHoraria', cargaMs.toString());
  modalConfig.close();
  atualizarInterface();
});

// --- LÓGICA DE TRANSIÇÃO DE ESTADO ---
async function alternarEstadoPonto(): Promise<void> {
  const agora: number = Date.now();
  const dadosParaArquivar = { ...dadosPonto };

  switch (dadosPonto.estado) {
    case 0:
      dadosPonto.estado = 1;
      dadosPonto.inicioDia = agora;
      break;
    case 1:
      dadosPonto.estado = 2;
      dadosPonto.inicioAlmoco = agora;
      break;
    case 2:
      dadosPonto.estado = 3;
      dadosPonto.fimAlmoco = agora;
      break;
    case 3:
      await arquivarRegistroNoHistorico(dadosParaArquivar);
      dadosPonto = { estado: 0, inicioDia: null, inicioAlmoco: null, fimAlmoco: null };
      break;
  }

  await salvarEstado(dadosPonto);
  executarFeedbackHaptico();
  atualizarInterface();
}

async function cancelarDiaAtual(): Promise<void> {
  dadosPonto = { estado: 0, inicioDia: null, inicioAlmoco: null, fimAlmoco: null };
  await salvarEstado(dadosPonto);
  executarFeedbackHaptico();
  atualizarInterface();
}

// --- CONTROLES DO DROPDOWN E MODAL ---
estadoDropdown.addEventListener('change', async () => {
  const novoEstado = parseInt(estadoDropdown.value, 10);
  const agora = Date.now();

  if (novoEstado >= 1 && !dadosPonto.inicioDia) dadosPonto.inicioDia = agora;
  if (novoEstado >= 2 && !dadosPonto.inicioAlmoco) dadosPonto.inicioAlmoco = agora;
  if (novoEstado >= 3 && !dadosPonto.fimAlmoco) dadosPonto.fimAlmoco = agora;

  dadosPonto.estado = novoEstado;
  await salvarEstado(dadosPonto);
  atualizarInterface();
});

btnEditarHoje.addEventListener('click', () => {
  inputEntradaHoje.value = extrairHora(dadosPonto.inicioDia);
  inputSaidaAlmocoHoje.value = extrairHora(dadosPonto.inicioAlmoco);
  inputRetornoAlmocoHoje.value = extrairHora(dadosPonto.fimAlmoco);
  modalEdicaoHoje.showModal();
});

btnCancelarEdicaoHoje.addEventListener('click', () => {
  modalEdicaoHoje.close();
});

formEdicaoHoje.addEventListener('submit', async (e) => {
  e.preventDefault();
  dadosPonto.inicioDia = converterHoraParaTimestampHoje(inputEntradaHoje.value);
  dadosPonto.inicioAlmoco = converterHoraParaTimestampHoje(inputSaidaAlmocoHoje.value);
  dadosPonto.fimAlmoco = converterHoraParaTimestampHoje(inputRetornoAlmocoHoje.value);

  await salvarEstado(dadosPonto);
  atualizarInterface();
  modalEdicaoHoje.close();
});

// --- FUNÇÕES DE TEMPO E FORMATAÇÃO ---
function formatarTempo(ms: number): string {
  const totalSegundos: number = Math.floor(Math.abs(ms) / 1000);
  const horas: number = Math.floor(totalSegundos / 3600);
  const minutos: number = Math.floor((totalSegundos % 3600) / 60);
  const segundos: number = totalSegundos % 60;
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function extrairHora(timestamp: number | null): string {
  if (!timestamp) return '';
  const data = new Date(timestamp);
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

function converterHoraParaTimestampHoje(horaStr: string): number | null {
  if (!horaStr) return null;
  const [hora, minuto] = horaStr.split(':');
  const data = new Date();
  data.setHours(Number(hora), Number(minuto), 0, 0);
  return data.getTime();
}

function exibirContagemRegressivaOuExtra(tempoRestante: number): void {
  if (tempoRestante >= 0) {
    countdownDisplay.textContent = `Restam ${formatarTempo(tempoRestante)}`;
    countdownDisplay.style.color = 'var(--primary-color)';
  } else {
    countdownDisplay.textContent = `Extra: +${formatarTempo(Math.abs(tempoRestante))}`;
    countdownDisplay.style.color = 'var(--accent-color)';
  }
}

// --- FUNÇÃO PARA CALCULAR HORÁRIO ESTIMADO DE SAÍDA ---
function calcularHorarioSaidaEstimado(): string | null {
  const agoraMs = Date.now();
  const cargaHorariaMs = obterCargaHoraria();
  
  // Só calcula se o dia já foi iniciado
  if (dadosPonto.estado === 0 || !dadosPonto.inicioDia) {
    return null;
  }

  let tempoTrabalhado = 0;
  
  switch (dadosPonto.estado) {
    case 1: {
      // Turno 1: tempo desde o início do dia
      tempoTrabalhado = agoraMs - dadosPonto.inicioDia;
      break;
    }
    case 2: {
      // Horário de almoço: considera apenas o tempo trabalhado antes do almoço
      if (dadosPonto.inicioAlmoco) {
        tempoTrabalhado = dadosPonto.inicioAlmoco - dadosPonto.inicioDia;
      }
      break;
    }
    case 3: {
      // Turno 2: soma turno1 + turno2 atual
      if (dadosPonto.inicioAlmoco && dadosPonto.fimAlmoco) {
        const turno1 = dadosPonto.inicioAlmoco - dadosPonto.inicioDia;
        const turno2 = agoraMs - dadosPonto.fimAlmoco;
        tempoTrabalhado = turno1 + turno2;
      } else if (dadosPonto.inicioDia) {
        // Caso sem almoço registrado
        tempoTrabalhado = agoraMs - dadosPonto.inicioDia;
      }
      break;
    }
  }

  // Calcula o tempo restante
  const tempoRestante = cargaHorariaMs - tempoTrabalhado;
  
  // Se já ultrapassou a carga ou está muito próximo (menos de 1 minuto), retorna null
  if (tempoRestante <= 60000) {
    return null;
  }

  // Calcula o horário de saída estimado
  const horarioSaida = new Date(agoraMs + tempoRestante);
  const horas = horarioSaida.getHours().toString().padStart(2, '0');
  const minutos = horarioSaida.getMinutes().toString().padStart(2, '0');
  
  return `${horas}:${minutos}`;
}

function atualizarInterface(): void {
  const agora: Date = new Date();
  const agoraMs: number = agora.getTime();

  if (estadoDropdown.value !== dadosPonto.estado.toString()) {
    estadoDropdown.value = dadosPonto.estado.toString();
  }

  // Mudado de 'block' para 'flex' para respeitar centralização do ícone no CSS
  btnCancelarDia.style.display = dadosPonto.estado > 0 ? 'flex' : 'none';

  if (dadosPonto.estado !== 2) {
    const horaAtual = agora.toTimeString().split(' ')[0];
    clockDisplay.textContent = horaAtual;
  }

  // Calcular horário estimado de saída
  const horarioEstimado = calcularHorarioSaidaEstimado();

  switch (dadosPonto.estado) {
    case 0:
      statusDisplay.textContent = 'Segure para iniciar o dia';
      countdownDisplay.textContent = `Carga: ${formatarTempo(obterCargaHoraria())}`;
      countdownDisplay.style.color = 'var(--primary-color)';
      break;

    case 1:
      statusDisplay.textContent = 'Trabalhando (Turno 1)';
      if (dadosPonto.inicioDia) {
        const tempoDecorrido1 = agoraMs - dadosPonto.inicioDia;
        const restante1 = obterCargaHoraria() - tempoDecorrido1;
        
        // Exibe contagem regressiva ou extra
        if (restante1 >= 0) {
          let texto = `Restam ${formatarTempo(restante1)}`;
          // Adiciona horário estimado se disponível
          if (horarioEstimado && restante1 > 60000) {
            texto += ` • Saída: ${horarioEstimado}`;
          }
          countdownDisplay.textContent = texto;
          countdownDisplay.style.color = 'var(--primary-color)';
        } else {
          countdownDisplay.textContent = `Extra: +${formatarTempo(Math.abs(restante1))}`;
          countdownDisplay.style.color = 'var(--accent-color)';
        }
      }
      break;

    case 2:
      statusDisplay.textContent = 'Intervalo de Almoço';
      if (dadosPonto.inicioAlmoco) {
        const tempoAlmocoDecorrido = agoraMs - dadosPonto.inicioAlmoco;
        const restanteAlmoco = TEMPO_ALMOCO - tempoAlmocoDecorrido;

        if (restanteAlmoco >= 0) {
          clockDisplay.textContent = formatarTempo(restanteAlmoco);
          countdownDisplay.textContent = 'Aproveite o descanso';
          countdownDisplay.style.color = 'var(--text-secondary)';
        } else {
          clockDisplay.textContent = formatarTempo(restanteAlmoco);
          countdownDisplay.textContent = `Almoço estourado: +${formatarTempo(Math.abs(restanteAlmoco))}`;
          countdownDisplay.style.color = 'var(--alert-color)';
        }
      }
      break;

    case 3:
      statusDisplay.textContent = 'Trabalhando (Turno 2)';
      if (dadosPonto.inicioDia && dadosPonto.inicioAlmoco && dadosPonto.fimAlmoco) {
        const tempoTrabalhadoTurno1 = dadosPonto.inicioAlmoco - dadosPonto.inicioDia;
        const tempoTrabalhadoTurno2 = agoraMs - dadosPonto.fimAlmoco;
        const totalTrabalhado = tempoTrabalhadoTurno1 + tempoTrabalhadoTurno2;
        const restante2 = obterCargaHoraria() - totalTrabalhado;
        
        // Exibe contagem regressiva ou extra
        if (restante2 >= 0) {
          let texto = `Restam ${formatarTempo(restante2)}`;
          // Adiciona horário estimado se disponível
          if (horarioEstimado && restante2 > 60000) {
            texto += ` • Saída: ${horarioEstimado}`;
          }
          countdownDisplay.textContent = texto;
          countdownDisplay.style.color = 'var(--primary-color)';
        } else {
          countdownDisplay.textContent = `Extra: +${formatarTempo(Math.abs(restante2))}`;
          countdownDisplay.style.color = 'var(--accent-color)';
        }
      } else if (dadosPonto.inicioDia) {
        const tempoTotalTrabalhadoDireto = agoraMs - dadosPonto.inicioDia;
        const restanteSemAlmoco = obterCargaHoraria() - tempoTotalTrabalhadoDireto;
        
        // Exibe contagem regressiva ou extra
        if (restanteSemAlmoco >= 0) {
          let texto = `Restam ${formatarTempo(restanteSemAlmoco)}`;
          // Adiciona horário estimado se disponível
          if (horarioEstimado && restanteSemAlmoco > 60000) {
            texto += ` • Saída: ${horarioEstimado}`;
          }
          countdownDisplay.textContent = texto;
          countdownDisplay.style.color = 'var(--primary-color)';
        } else {
          countdownDisplay.textContent = `Extra: +${formatarTempo(Math.abs(restanteSemAlmoco))}`;
          countdownDisplay.style.color = 'var(--accent-color)';
        }
      }
      break;
  }
}

function executarFeedbackHaptico(): void {
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
}

applyLongPress(
  btnPonto,
  1500,
  alternarEstadoPonto,
  undefined,
  () => btnPonto.classList.add('pressing'),
  () => btnPonto.classList.remove('pressing'),
);

applyLongPress(
  btnCancelarDia,
  3000,
  cancelarDiaAtual,
  undefined,
  () => btnCancelarDia.classList.add('pressing'),
  () => btnCancelarDia.classList.remove('pressing'),
);

carregarEstado().then((estadoSalvo: DadosPonto) => {
  dadosPonto = estadoSalvo;
  setInterval(atualizarInterface, 1000);
  atualizarInterface();

  setTimeout(() => {
    splashScreen.style.opacity = '0';
    splashScreen.style.visibility = 'hidden';
  }, 500);
});
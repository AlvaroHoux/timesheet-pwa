// Definição de Interfaces para Tipagem Estrita
interface DadosPonto {
    estado: number;
    inicioDia: number | null;
    inicioAlmoco: number | null;
    fimAlmoco: number | null;
}

interface RegistroHistorico {
    id: number;
    data: string;
    entrada: number | null;
    saidaAlmoco: number | null;
    retornoAlmoco: number | null;
    saidaDia: number;
}

// Configurações de tempo padrão (em milissegundos)
const JORNADA_DIARIA: number = 8 * 60 * 60 * 1000;  // 8 horas
const TEMPO_ALMOCO: number = 1 * 60 * 60 * 1000;    // 1 hora

// Estado inicial da aplicação
let dadosPonto: DadosPonto = {
    estado: 0,
    inicioDia: null,
    inicioAlmoco: null,
    fimAlmoco: null
};

// Mapeamento e asserção de tipos dos elementos do DOM
const btnPonto = document.getElementById('btnPonto') as HTMLButtonElement;
const clockDisplay = document.getElementById('clockDisplay') as HTMLDivElement;
const statusDisplay = document.getElementById('statusDisplay') as HTMLDivElement;
const countdownDisplay = document.getElementById('countdownDisplay') as HTMLDivElement;

let temporizadorPressao: ReturnType<typeof setTimeout> | null = null;
let estaPressionando: boolean = false;

// --- GERENCIAMENTO DE PERSISTÊNCIA ---
function carregarEstado(): void {
    const salvo = localStorage.getItem('ponto_estado_atual');
    if (salvo) {
        dadosPonto = JSON.parse(salvo);
    }
}

function salvarEstado(): void {
    localStorage.setItem('ponto_estado_atual', JSON.stringify(dadosPonto));
}

function arquivarRegistroNoHistorico(): void {
    const historico: RegistroHistorico[] = JSON.parse(localStorage.getItem('ponto_historico') || '[]');
    const novoRegistro: RegistroHistorico = {
        id: Date.now(),
        data: new Date().toLocaleDateString('pt-BR'),
        entrada: dadosPonto.inicioDia,
        saidaAlmoco: dadosPonto.inicioAlmoco,
        retornoAlmoco: dadosPonto.fimAlmoco,
        saidaDia: Date.now()
    };
    historico.push(novoRegistro);
    localStorage.setItem('ponto_historico', JSON.stringify(historico));
}

// --- MÁQUINA DE ESTADOS DO PONTO ---
function alternarEstadoPonto(): void {
    const agora: number = Date.now();

    switch (dadosPonto.estado) {
        case 0: // Iniciar o Dia
            dadosPonto.estado = 1;
            dadosPonto.inicioDia = agora;
            break;
        case 1: // Ir para o Almoço
            dadosPonto.estado = 2;
            dadosPonto.inicioAlmoco = agora;
            break;
        case 2: // Voltar do Almoço
            dadosPonto.estado = 3;
            dadosPonto.fimAlmoco = agora;
            break;
        case 3: // Finalizar a Jornada
            arquivarRegistroNoHistorico();
            dadosPonto = { estado: 0, inicioDia: null, inicioAlmoco: null, fimAlmoco: null };
            break;
    }
    salvarEstado();
    executarFeedbackHaptico();
}

// --- CONTROLE DE TEMPO E FORMATAÇÃO ---
function formatarTempo(ms: number): string {
    const totalSegundos: number = Math.floor(Math.abs(ms) / 1000);
    const horas: number = Math.floor(totalSegundos / 3600);
    const minutos: number = Math.floor((totalSegundos % 3600) / 60);
    const segundos: number = totalSegundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function exibirContagemRegressivaOuExtra(tempoRestante: number): void {
    if (tempoRestante >= 0) {
        countdownDisplay.textContent = `Restam ${formatarTempo(tempoRestante)}`;
        countdownDisplay.style.color = "var(--primary-color)";
    } else {
        countdownDisplay.textContent = `Extra: +${formatarTempo(tempoRestante)}`;
        countdownDisplay.style.color = "var(--accent-color)";
    }
}

function atualizarInterface(): void {
    const agora: Date = new Date();
    const agoraMs: number = agora.getTime();

    if (dadosPonto.estado !== 2) {
        clockDisplay.textContent = agora.toTimeString().split(' ')[0];
    }

    switch (dadosPonto.estado) {
        case 0:
            statusDisplay.textContent = "Segure para iniciar o dia";
            countdownDisplay.textContent = "Carga: 08:00:00";
            countdownDisplay.style.color = "var(--primary-color)";
            break;

        case 1:
            statusDisplay.textContent = "Trabalhando (Turno 1)";
            if (dadosPonto.inicioDia) {
                const tempoDecorrido1 = agoraMs - dadosPonto.inicioDia;
                const restante1 = JORNADA_DIARIA - tempoDecorrido1;
                exibirContagemRegressivaOuExtra(restante1);
            }
            break;

        case 2:
            statusDisplay.textContent = "Intervalo de Almoço";
            if (dadosPonto.inicioAlmoco) {
                const tempoAlmocoDecorrido = agoraMs - dadosPonto.inicioAlmoco;
                const restanteAlmoco = TEMPO_ALMOCO - tempoAlmocoDecorrido;

                if (restanteAlmoco >= 0) {
                    clockDisplay.textContent = formatarTempo(restanteAlmoco);
                    countdownDisplay.textContent = "Aproveite o descanso";
                    countdownDisplay.style.color = "var(--text-secondary)";
                } else {
                    clockDisplay.textContent = formatarTempo(restanteAlmoco);
                    countdownDisplay.textContent = `Almoço estourado: +${formatarTempo(tempoAlmocoDecorrido - TEMPO_ALMOCO)}`;
                    countdownDisplay.style.color = "var(--alert-color)";
                }
            }
            break;

        case 3:
            statusDisplay.textContent = "Trabalhando (Turno 2)";
            if (dadosPonto.inicioDia && dadosPonto.inicioAlmoco && dadosPonto.fimAlmoco) {
                const tempoTrabalhadoTurno1 = dadosPonto.inicioAlmoco - dadosPonto.inicioDia;
                const tempoTrabalhadoTurno2 = agoraMs - dadosPonto.fimAlmoco;
                const totalTrabalhado = tempoTrabalhadoTurno1 + tempoTrabalhadoTurno2;
                const restante2 = JORNADA_DIARIA - totalTrabalhado;
                exibirContagemRegressivaOuExtra(restante2);
            }
            break;
    }
}

// --- LOGICA DO PRESSIONAMENTO DE 3 SEGUNDOS ---
function iniciarPressao(e: Event): void {
    if (estaPressionando) return;
    e.preventDefault();
    estaPressionando = true;
    btnPonto.classList.add('pressing');

    temporizadorPressao = setTimeout(() => {
        alternarEstadoPonto();
        finalizarPressao();
    }, 3000);
}

function finalizarPressao(): void {
    if (!estaPressionando) return;
    estaPressionando = false;
    btnPonto.classList.remove('pressing');
    if (temporizadorPressao) {
        clearTimeout(temporizadorPressao);
        temporizadorPressao = null;
    }
}

function executarFeedbackHaptico(): void {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Ouvintes de Eventos adaptados com suporte a MouseEvent e TouchEvent
btnPonto.addEventListener('mousedown', iniciarPressao);
btnPonto.addEventListener('mouseup', finalizarPressao);
btnPonto.addEventListener('mouseleave', finalizarPressao);

btnPonto.addEventListener('touchstart', iniciarPressao, { passive: false });
btnPonto.addEventListener('touchend', finalizarPressao);
btnPonto.addEventListener('touchcancel', finalizarPressao);

// Inicialização do Script
carregarEstado();
setInterval(atualizarInterface, 1000);
atualizarInterface();
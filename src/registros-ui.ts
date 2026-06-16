import { RegistroHistorico, obterCargaHoraria, obterHistoricoCompleto, salvarRegistroEditado, removerRegistroDoHistorico } from "./registros.js";
import { applyLongPress } from "./utils/long-press.js";

// Elementos do DOM
const mesAtualTitulo = document.getElementById('mesAtualTitulo') as HTMLHeadingElement;
const dataAtualSubtitulo = document.getElementById('dataAtualSubtitulo') as HTMLElement;
const saldoTotalHeader = document.getElementById('saldoTotalHeader') as HTMLElement;
const listaRegistros = document.getElementById('listaRegistros') as HTMLElement;

// Elementos do Modal
const registroModal = document.getElementById('registroModal') as HTMLDialogElement;
const registroForm = document.getElementById('registroForm') as HTMLFormElement;
const btnNovoRegistro = document.getElementById('btnNovoRegistro') as HTMLButtonElement;
const btnCancelarModal = document.getElementById('btnCancelarModal') as HTMLButtonElement;
const modalTitulo = document.getElementById('modalTitulo') as HTMLDivElement;

// Inputs do Modal
const inputTipoRegistro = document.getElementById('inputTipoRegistro') as HTMLSelectElement;
const camposNormal = document.getElementById('camposNormal') as HTMLDivElement;
const camposCompensacao = document.getElementById('camposCompensacao') as HTMLDivElement;
const inputId = document.getElementById('registroId') as HTMLInputElement;
const inputData = document.getElementById('inputData') as HTMLInputElement;
const inputEntrada = document.getElementById('inputEntrada') as HTMLInputElement;
const inputSaidaAlmoco = document.getElementById('inputSaidaAlmoco') as HTMLInputElement;
const inputRetornoAlmoco = document.getElementById('inputRetornoAlmoco') as HTMLInputElement;
const inputSaida = document.getElementById('inputSaida') as HTMLInputElement;
const inputHorasCompensacao = document.getElementById('inputHorasCompensacao') as HTMLInputElement;

// --- INICIALIZAÇÃO E EVENTOS DA UI ---
function inicializarCabecalho(): void {
    const hoje = new Date();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    mesAtualTitulo.textContent = `${meses[hoje.getMonth()]} ${hoje.getFullYear()}`;
    dataAtualSubtitulo.textContent = hoje.toLocaleDateString('pt-BR');
}

inputTipoRegistro.addEventListener('change', () => {
    if (inputTipoRegistro.value === 'compensacao') {
        camposNormal.style.display = 'none';
        camposCompensacao.style.display = 'block';
    } else {
        camposNormal.style.display = 'block';
        camposCompensacao.style.display = 'none';
    }
});

// --- CÁLCULOS E FORMATAÇÃO ---
function extrairHora(timestamp: number | null): string {
    if (!timestamp) return "--:--";
    const data = new Date(timestamp);
    return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

function calcularSaldoRegistro(registro: RegistroHistorico): number {
    if (registro.isCompensacao && registro.saldoCompensacao !== undefined) {
        return registro.saldoCompensacao;
    }

    if (!registro.entrada || !registro.saidaDia) return 0;

    let tempoTrabalhado = 0;
    if (registro.saidaAlmoco && registro.retornoAlmoco) {
        tempoTrabalhado += (registro.saidaAlmoco - registro.entrada);
        tempoTrabalhado += (registro.saidaDia - registro.retornoAlmoco);
    } else {
        tempoTrabalhado += (registro.saidaDia - registro.entrada);
    }
    return tempoTrabalhado - obterCargaHoraria();
}

function formatarSaldoExtenso(saldoMs: number): string {
    const sinal = saldoMs >= 0 ? "+" : "-";
    const absoluto = Math.abs(saldoMs);
    const horas = Math.floor(absoluto / 3600000);
    const minutos = Math.floor((absoluto % 3600000) / 60000);
    return `${sinal}${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function converterStringCompensacaoParaMs(str: string): number {
    const regex = /^([+-]?)\s*(\d+):(\d{2})$/;
    const match = str.trim().match(regex);
    if (!match) return 0;

    const sinal = match[1] === '-' ? -1 : 1;
    const horas = parseInt(match[2], 10);
    const minutos = parseInt(match[3], 10);

    return sinal * ((horas * 3600000) + (minutos * 60000));
}

function executarFeedbackExclusao(): void {
    if (navigator.vibrate) {
        navigator.vibrate([100, 200, 100]); // Vibração distinta para alertas irreversíveis
    }
}

// --- RENDERIZAÇÃO ---
async function carregarEExibirRegistros(): Promise<void> {
    const historico = await obterHistoricoCompleto();
    listaRegistros.innerHTML = '';
    let saldoGeralMs = 0;

    historico.sort((a, b) => b.id - a.id);

    historico.forEach(registro => {
        const saldoDia = calcularSaldoRegistro(registro);
        saldoGeralMs += saldoDia;

        const classeSaldo = saldoDia >= 0 ? 'saldo-positivo' : 'saldo-negativo';
        const strSaldo = formatarSaldoExtenso(saldoDia);

        const card = document.createElement('div');
        card.className = 'registro-card';

        if (registro.isCompensacao) {
            card.innerHTML = `
                <div class="registro-info">
                    <span class="registro-data">Compensação (${registro.data})</span>
                    <span class="registro-tempos">Segure 3s para deletar</span>
                </div>
                <div class="registro-saldo ${classeSaldo}">${strSaldo}</div>
            `;
        } else {
            const temposFormatados = `${extrairHora(registro.entrada)} | ${extrairHora(registro.saidaAlmoco)} | ${extrairHora(registro.retornoAlmoco)} | ${extrairHora(registro.saidaDia)}`;
            card.innerHTML = `
                <div class="registro-info">
                    <span class="registro-data">${registro.data}</span>
                    <span class="registro-tempos">${temposFormatados}</span>
                </div>
                <div class="registro-saldo ${classeSaldo}">${strSaldo}</div>
            `;
        }
        
        // Aplicação do componente modular: Clique curto para editar, Segurar (3s) para remover
        applyLongPress(
            card,
            3000,
            async () => {
                // Ação ao segurar 3s (Exclusão)
                executarFeedbackExclusao();
                await removerRegistroDoHistorico(registro.id);
                await carregarEExibirRegistros(); // Recarrega a tela
            },
            () => {
                // Ação do Clique Simples (Edição)
                abrirModalEdicao(registro);
            },
            () => card.style.opacity = '0.5', // Start
            () => card.style.opacity = '1'    // Cancel
        );

        listaRegistros.appendChild(card);
    });

    saldoTotalHeader.textContent = formatarSaldoExtenso(saldoGeralMs);
    saldoTotalHeader.className = saldoGeralMs >= 0 ? 'saldo-positivo' : 'saldo-negativo';
}

// --- LÓGICA DO MODAL ---
function converterStringTempoParaTimestamp(dataBase: string, tempo: string): number | null {
    if (!tempo) return null;
    const [ano, mes, dia] = dataBase.split('-');
    const [hora, minuto] = tempo.split(':');
    return new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto)).getTime();
}

function abrirModalNovo(): void {
    registroForm.reset();
    inputId.value = '';
    modalTitulo.textContent = "Adicionar Registro Manual";
    inputTipoRegistro.value = 'normal';
    inputTipoRegistro.dispatchEvent(new Event('change'));
    
    const hoje = new Date();
    inputData.value = hoje.toISOString().split('T')[0];
    
    registroModal.showModal();
}

function abrirModalEdicao(registro: RegistroHistorico): void {
    inputId.value = registro.id.toString();
    modalTitulo.textContent = registro.isCompensacao ? "Editar Compensação" : "Editar Registro";
    
    const [dia, mes, ano] = registro.data.split('/');
    inputData.value = `${ano}-${mes}-${dia}`;

    if (registro.isCompensacao) {
        inputTipoRegistro.value = 'compensacao';
        inputHorasCompensacao.value = formatarSaldoExtenso(registro.saldoCompensacao || 0);
    } else {
        inputTipoRegistro.value = 'normal';
        inputEntrada.value = extrairHora(registro.entrada) !== "--:--" ? extrairHora(registro.entrada) : "";
        inputSaidaAlmoco.value = extrairHora(registro.saidaAlmoco) !== "--:--" ? extrairHora(registro.saidaAlmoco) : "";
        inputRetornoAlmoco.value = extrairHora(registro.retornoAlmoco) !== "--:--" ? extrairHora(registro.retornoAlmoco) : "";
        inputSaida.value = extrairHora(registro.saidaDia) !== "--:--" ? extrairHora(registro.saidaDia) : "";
    }
    
    inputTipoRegistro.dispatchEvent(new Event('change'));
    registroModal.showModal();
}

registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const dataBase = inputData.value;
    const id = inputId.value ? Number(inputId.value) : Date.now();
    const [ano, mes, dia] = dataBase.split('-');
    const dataFormatadaStr = `${dia}/${mes}/${ano}`;

    let registroEditado: RegistroHistorico;

    if (inputTipoRegistro.value === 'compensacao') {
        registroEditado = {
            id: id,
            data: dataFormatadaStr,
            entrada: null,
            saidaAlmoco: null,
            retornoAlmoco: null,
            saidaDia: Date.now(), 
            isCompensacao: true,
            saldoCompensacao: converterStringCompensacaoParaMs(inputHorasCompensacao.value)
        };
    } else {
        registroEditado = {
            id: id,
            data: dataFormatadaStr,
            entrada: converterStringTempoParaTimestamp(dataBase, inputEntrada.value),
            saidaAlmoco: converterStringTempoParaTimestamp(dataBase, inputSaidaAlmoco.value),
            retornoAlmoco: converterStringTempoParaTimestamp(dataBase, inputRetornoAlmoco.value),
            saidaDia: converterStringTempoParaTimestamp(dataBase, inputSaida.value) || Date.now(),
            isCompensacao: false
        };
    }

    await salvarRegistroEditado(registroEditado);
    registroModal.close();
    carregarEExibirRegistros();
});

btnNovoRegistro.addEventListener('click', abrirModalNovo);
btnCancelarModal.addEventListener('click', () => registroModal.close());

// Execução inicial
inicializarCabecalho();
carregarEExibirRegistros();
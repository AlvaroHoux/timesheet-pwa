export interface DadosPonto {
  estado: number; // 0: Não iniciado, 1: Turno 1, 2: Almoço, 3: Turno 2
  inicioDia: number | null;
  inicioAlmoco: number | null;
  fimAlmoco: number | null;
}

export interface RegistroHistorico {
  id: number;
  data: string;
  entrada: number | null;
  saidaAlmoco: number | null;
  retornoAlmoco: number | null;
  saidaDia: number;
  isCompensacao?: boolean;
  saldoCompensacao?: number; // em ms
}

const DB_NAME = 'PontoEletronicoDB';
const DB_VERSION = 1;

export function obterCargaHoraria(): number {
  const config = localStorage.getItem('cargaHoraria');
  return config ? parseInt(config, 10) : 8 * 60 * 60 * 1000; // Padrão: 8 horas em ms
}

export function salvarCargaHoraria(ms: number): void {
  localStorage.setItem('cargaHoraria', ms.toString());
}

export function obterTempoAlmoco(): number {
  const config = localStorage.getItem('tempoAlmoco');
  return config ? parseInt(config, 10) : 1 * 60 * 60 * 1000; // Padrão: 1 hora em ms
}

export function salvarTempoAlmoco(ms: number): void {
  localStorage.setItem('tempoAlmoco', ms.toString());
}

function abrirBancoDados(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('estado')) {
        db.createObjectStore('estado');
      }

      if (!db.objectStoreNames.contains('historico')) {
        db.createObjectStore('historico', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function carregarEstado(): Promise<DadosPonto> {
  const db = await abrirBancoDados();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('estado', 'readonly');
    const store = transaction.objectStore('estado');
    const request = store.get('atual');

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result as DadosPonto);
      } else {
        resolve({
          estado: 0,
          inicioDia: null,
          inicioAlmoco: null,
          fimAlmoco: null,
        });
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function salvarEstado(dados: DadosPonto): Promise<void> {
  const db = await abrirBancoDados();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('estado', 'readwrite');
    const store = transaction.objectStore('estado');
    const request = store.put(dados, 'atual');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function arquivarRegistroNoHistorico(dadosPonto: DadosPonto, fimDiaTimestamp: number = Date.now()): Promise<RegistroHistorico> {
  const db = await abrirBancoDados();

  const novoRegistro: RegistroHistorico = {
    id: Date.now(),
    data: new Date(dadosPonto.inicioDia || fimDiaTimestamp).toLocaleDateString('pt-BR'),
    entrada: dadosPonto.inicioDia,
    saidaAlmoco: dadosPonto.inicioAlmoco,
    retornoAlmoco: dadosPonto.fimAlmoco,
    saidaDia: fimDiaTimestamp,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('historico', 'readwrite');
    const store = transaction.objectStore('historico');
    const request = store.add(novoRegistro);

    request.onsuccess = () => resolve(novoRegistro);
    request.onerror = () => reject(request.error);
  });
}

export async function obterHistoricoCompleto(): Promise<RegistroHistorico[]> {
  const db = await abrirBancoDados();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('historico', 'readonly');
    const store = transaction.objectStore('historico');
    const request = store.getAll();

    request.onsuccess = () => {
      const items = (request.result as RegistroHistorico[]) || [];
      // Ordena decrescente por ID / data mais recente primeiro
      items.sort((a, b) => b.id - a.id);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function salvarRegistroEditado(registro: RegistroHistorico): Promise<void> {
  const db = await abrirBancoDados();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('historico', 'readwrite');
    const store = transaction.objectStore('historico');
    const request = store.put(registro);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function removerRegistroDoHistorico(id: number): Promise<void> {
  const db = await abrirBancoDados();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('historico', 'readwrite');
    const store = transaction.objectStore('historico');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function formatarHora(timestamp: number | null): string {
  if (!timestamp) return '--:--';
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatarHoraComSegundos(timestamp: number | null): string {
  if (!timestamp) return '--:--:--';
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export function formatarDuracao(ms: number): string {
  const totalSegundos = Math.floor(Math.abs(ms) / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

export function formatarDuracaoCurta(ms: number): string {
  const totalMinutos = Math.floor(Math.abs(ms) / 60000);
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  return `${horas}h ${String(minutos).padStart(2, '0')}m`;
}

export function calcularSaldoRegistro(registro: RegistroHistorico, cargaHoraria: number): number {
  if (registro.isCompensacao && registro.saldoCompensacao !== undefined) {
    return registro.saldoCompensacao;
  }
  if (!registro.entrada || !registro.saidaDia) return 0;

  let trabalhado = 0;
  if (registro.saidaAlmoco && registro.retornoAlmoco) {
    trabalhado += Math.max(0, registro.saidaAlmoco - registro.entrada);
    trabalhado += Math.max(0, registro.saidaDia - registro.retornoAlmoco);
  } else {
    trabalhado += Math.max(0, registro.saidaDia - registro.entrada);
  }
  return trabalhado - cargaHoraria;
}

export function formatarSaldo(saldoMs: number): string {
  const sinal = saldoMs >= 0 ? '+' : '-';
  const abs = Math.abs(saldoMs);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  return `${sinal}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export async function exportarHistoricoCSV(): Promise<void> {
  const historico = await obterHistoricoCompleto();
  const cargaHoraria = obterCargaHoraria();

  // Ordena por data crescente para exportação
  const ordenado = [...historico].reverse();

  const cabecalho = ['Data', 'Tipo', 'Entrada', 'Saída Almoço', 'Retorno Almoço', 'Saída', 'Saldo'];
  const linhas: string[][] = [cabecalho];

  let saldoAcumuladoMs = 0;

  for (const reg of ordenado) {
    const saldo = calcularSaldoRegistro(reg, cargaHoraria);
    saldoAcumuladoMs += saldo;

    if (reg.isCompensacao) {
      linhas.push([
        reg.data,
        'Compensação',
        '',
        '',
        '',
        '',
        formatarSaldo(saldo),
      ]);
    } else {
      linhas.push([
        reg.data,
        'Normal',
        formatarHora(reg.entrada),
        formatarHora(reg.saidaAlmoco),
        formatarHora(reg.retornoAlmoco),
        formatarHora(reg.saidaDia),
        formatarSaldo(saldo),
      ]);
    }
  }

  linhas.push([]);
  linhas.push(['', '', '', '', '', 'Saldo Total', formatarSaldo(saldoAcumuladoMs)]);

  const csvContent = linhas
    .map((row) => row.map((cell) => `"${cell}"`).join(';'))
    .join('\n');

  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dataHoje = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `historico-ponto-${dataHoje}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

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
  saidaDia: number | null;
  isCompensacao?: boolean;
  saldoCompensacao?: number; // em ms
  descricao?: string; // Motivo do ajuste ou observação
}

export interface ConfigFinanceira {
  salarioMensal: number;
  diasUteisMes: number;
  adicionalExtra: number; // Percentual, ex: 50 (%)
  adicionalFimDeSemana: number; // Percentual, ex: 100 (%)
  mostrarGanhos: boolean;
}

export interface ConfigCiclo {
  diaInicio: number; // Dia de abertura do mês (ex: 27)
  diaFim: number;    // Dia de fechamento do mês (ex: 26)
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

export function obterConfigCiclo(): ConfigCiclo {
  const saved = localStorage.getItem('configCiclo');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.diaInicio && parsed.diaFim) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }
  return {
    diaInicio: 27,
    diaFim: 26,
  };
}

export function salvarConfigCiclo(config: ConfigCiclo): void {
  localStorage.setItem('configCiclo', JSON.stringify(config));
}

export interface CicloInfo {
  key: string;            // '2026-08'
  rotulo: string;         // 'Agosto/2026'
  inicio: Date;
  fim: Date;
  textoFormatado: string; // '27/07 a 26/08/2026'
  ano: number;
  mes: number;            // 1-12 (mês de fechamento)
}

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function calcularPeriodoCicloPorAnoMes(
  diaInicio: number,
  diaFim: number,
  ano: number,
  mes: number // 1 a 12 (mês de fechamento do ciclo)
): CicloInfo {
  const mesIndex = mes - 1; // 0 a 11
  let inicio: Date;
  let fim: Date;

  if (diaInicio <= diaFim) {
    inicio = new Date(ano, mesIndex, diaInicio, 0, 0, 0, 0);
    const ultimoDia = new Date(ano, mesIndex + 1, 0).getDate();
    const diaRealFim = Math.min(diaFim, ultimoDia);
    fim = new Date(ano, mesIndex, diaRealFim, 23, 59, 59, 999);
  } else {
    // Ciclo cruzando meses (ex: diaInicio=27, diaFim=26)
    // O ciclo de Agosto/2026 começou em 27/07/2026 e fecha em 26/08/2026
    const mesAnterior = mesIndex - 1;
    const dataMesAnterior = new Date(ano, mesAnterior, 1);
    const anoInicio = dataMesAnterior.getFullYear();
    const mesInicio = dataMesAnterior.getMonth();
    const ultimoDiaMesAnterior = new Date(anoInicio, mesInicio + 1, 0).getDate();
    const diaRealInicio = Math.min(diaInicio, ultimoDiaMesAnterior);
    inicio = new Date(anoInicio, mesInicio, diaRealInicio, 0, 0, 0, 0);

    const ultimoDiaMesAtual = new Date(ano, mesIndex + 1, 0).getDate();
    const diaRealFim = Math.min(diaFim, ultimoDiaMesAtual);
    fim = new Date(ano, mesIndex, diaRealFim, 23, 59, 59, 999);
  }

  const formatarDataSimples = (d: Date) => {
    const dia = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${dia}/${m}`;
  };

  const key = `${ano}-${String(mes).padStart(2, '0')}`;
  const rotulo = `${NOMES_MESES[mesIndex]}/${ano}`;
  const textoFormatado = `${formatarDataSimples(inicio)} a ${formatarDataSimples(fim)}/${fim.getFullYear()}`;

  return {
    key,
    rotulo,
    inicio,
    fim,
    textoFormatado,
    ano,
    mes,
  };
}

export function calcularPeriodoCiclo(
  diaInicio: number,
  diaFim: number,
  referencia: Date = new Date()
): CicloInfo {
  const diaRef = referencia.getDate();
  const mesRef = referencia.getMonth() + 1; // 1 a 12
  const anoRef = referencia.getFullYear();

  if (diaInicio <= diaFim) {
    return calcularPeriodoCicloPorAnoMes(diaInicio, diaFim, anoRef, mesRef);
  }

  // Se diaRef >= diaInicio, o ciclo em curso fechará no mês seguinte
  if (diaRef >= diaInicio) {
    const proximaData = new Date(anoRef, referencia.getMonth() + 1, 1);
    return calcularPeriodoCicloPorAnoMes(
      diaInicio,
      diaFim,
      proximaData.getFullYear(),
      proximaData.getMonth() + 1
    );
  } else {
    // diaRef < diaInicio, fecha neste mês
    return calcularPeriodoCicloPorAnoMes(diaInicio, diaFim, anoRef, mesRef);
  }
}

export function descobrirCicloDaData(dataStr: string, diaInicio: number, diaFim: number): string {
  if (!dataStr) return '';
  const partes = dataStr.split('/');
  if (partes.length !== 3) return '';
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10); // 1 a 12
  const ano = parseInt(partes[2], 10);

  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return '';

  if (diaInicio <= diaFim) {
    return `${ano}-${String(mes).padStart(2, '0')}`;
  }

  if (dia >= diaInicio) {
    const proxima = new Date(ano, mes, 1);
    return `${proxima.getFullYear()}-${String(proxima.getMonth() + 1).padStart(2, '0')}`;
  } else {
    return `${ano}-${String(mes).padStart(2, '0')}`;
  }
}

export function listarCiclosDisponiveis(
  registros: RegistroHistorico[],
  diaInicio: number,
  diaFim: number
): CicloInfo[] {
  const ciclosMap = new Map<string, CicloInfo>();

  // Sempre adiciona o ciclo atual com base na data de hoje
  const cicloAtual = calcularPeriodoCiclo(diaInicio, diaFim, new Date());
  ciclosMap.set(cicloAtual.key, cicloAtual);

  // Vasculha todos os registros para encontrar ciclos com dados históricos
  for (const reg of registros) {
    if (!reg.data) continue;
    const key = descobrirCicloDaData(reg.data, diaInicio, diaFim);
    if (key && !ciclosMap.has(key)) {
      const [anoStr, mesStr] = key.split('-');
      const ano = parseInt(anoStr, 10);
      const mes = parseInt(mesStr, 10);
      if (!isNaN(ano) && !isNaN(mes)) {
        const info = calcularPeriodoCicloPorAnoMes(diaInicio, diaFim, ano, mes);
        ciclosMap.set(key, info);
      }
    }
  }

  // Ordena decrescente pela chave (os mais recentes primeiro)
  return Array.from(ciclosMap.values()).sort((a, b) => b.key.localeCompare(a.key));
}

export function isDataNoPeriodo(dataStr: string, inicio: Date, fim: Date): boolean {
  if (!dataStr) return false;
  const partes = dataStr.split('/');
  if (partes.length !== 3) return false;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);
  const data = new Date(ano, mes, dia, 12, 0, 0);
  return data.getTime() >= inicio.getTime() && data.getTime() <= fim.getTime();
}

export function obterConfigFinanceira(): ConfigFinanceira {
  const saved = localStorage.getItem('configFinanceira');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {
    salarioMensal: 0,
    diasUteisMes: 22,
    adicionalExtra: 50,
    adicionalFimDeSemana: 100,
    mostrarGanhos: true,
  };
}

export function salvarConfigFinanceira(config: ConfigFinanceira): void {
  localStorage.setItem('configFinanceira', JSON.stringify(config));
}

const STORAGE_SALARIOS_CICLOS = 'salariosPorCiclo';

export function obterSalariosPorCiclo(): Record<string, number> {
  const salvo = localStorage.getItem(STORAGE_SALARIOS_CICLOS);
  if (salvo) {
    try {
      return JSON.parse(salvo);
    } catch {
      // fallback
    }
  }
  return {};
}

export function obterSalarioDoCiclo(cicloKey: string): { salario: number; isCustomizado: boolean } {
  const salarios = obterSalariosPorCiclo();
  if (cicloKey in salarios && typeof salarios[cicloKey] === 'number') {
    return { salario: salarios[cicloKey], isCustomizado: true };
  }
  const config = obterConfigFinanceira();
  return { salario: config.salarioMensal || 0, isCustomizado: false };
}

export function salvarSalarioDoCiclo(cicloKey: string, salario: number): void {
  const salarios = obterSalariosPorCiclo();
  salarios[cicloKey] = Math.max(0, salario);
  localStorage.setItem(STORAGE_SALARIOS_CICLOS, JSON.stringify(salarios));
}

export function removerSalarioCustomizadoDoCiclo(cicloKey: string): void {
  const salarios = obterSalariosPorCiclo();
  delete salarios[cicloKey];
  localStorage.setItem(STORAGE_SALARIOS_CICLOS, JSON.stringify(salarios));
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

export async function criarRegistroAjuste(
  data: string,
  saldoCompensacaoMs: number,
  descricao: string = ''
): Promise<RegistroHistorico> {
  const db = await abrirBancoDados();

  const novoRegistro: RegistroHistorico = {
    id: Date.now(),
    data: data || new Date().toLocaleDateString('pt-BR'),
    entrada: null,
    saidaAlmoco: null,
    retornoAlmoco: null,
    saidaDia: null,
    isCompensacao: true,
    saldoCompensacao: saldoCompensacaoMs,
    descricao: descricao.trim(),
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
      // Ordena decrescente por data/ID
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

export async function limparTodosOsRegistros(): Promise<void> {
  const db = await abrirBancoDados();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['historico', 'estado'], 'readwrite');
    const storeHistorico = transaction.objectStore('historico');
    const storeEstado = transaction.objectStore('estado');

    storeHistorico.clear();
    storeEstado.clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
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

export async function exportarHistoricoCSV(filtroInicio?: Date, filtroFim?: Date): Promise<void> {
  let historico = await obterHistoricoCompleto();
  const cargaHoraria = obterCargaHoraria();

  if (filtroInicio && filtroFim) {
    historico = historico.filter((reg) => isDataNoPeriodo(reg.data, filtroInicio, filtroFim));
  }

  // Ordena por data crescente para exportação
  const ordenado = [...historico].reverse();

  const cabecalho = ['Data', 'Tipo', 'Entrada', 'Saída Almoço', 'Retorno Almoço', 'Saída', 'Saldo', 'Descrição'];
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
        reg.descricao || '',
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
        reg.descricao || '',
      ]);
    }
  }

  linhas.push([]);
  linhas.push(['', '', '', '', '', 'Saldo Total', formatarSaldo(saldoAcumuladoMs), '']);

  const csvContent = linhas
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';'))
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

function parseHoraParaTimestamp(dataStr: string, horaStr: string): number | null {
  if (!horaStr || !horaStr.includes(':')) return null;
  const partesHora = horaStr.split(':');
  const h = parseInt(partesHora[0], 10);
  const m = parseInt(partesHora[1], 10);
  if (isNaN(h) || isNaN(m)) return null;

  // dataStr formato esperado: DD/MM/YYYY
  const partesData = dataStr.split('/');
  if (partesData.length === 3) {
    const dia = parseInt(partesData[0], 10);
    const mes = parseInt(partesData[1], 10) - 1;
    const ano = parseInt(partesData[2], 10);
    const d = new Date(ano, mes, dia, h, m, 0, 0);
    return d.getTime();
  }

  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function parseSaldoMs(saldoStr: string): number {
  if (!saldoStr) return 0;
  const limpo = saldoStr.trim();
  const sinal = limpo.startsWith('-') ? -1 : 1;
  const semSinal = limpo.replace(/^[+-]/, '').trim();
  const [hStr, mStr] = semSinal.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  return sinal * (h * 3600000 + m * 60000);
}

export async function importarHistoricoCSV(csvText: string): Promise<{ importados: number; erros: number }> {
  const db = await abrirBancoDados();
  const linhas = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  if (linhas.length === 0) {
    throw new Error('O arquivo CSV está vazio.');
  }

  let importados = 0;
  let erros = 0;

  // Detecta delimitador: ; ou ,
  const primeiraLinha = linhas[0];
  const delimitador = primeiraLinha.includes(';') ? ';' : ',';

  // Parser simples para linhas CSV respeitando aspas
  const quebrarLinhaCsv = (linha: string): string[] => {
    const regex = new RegExp(`(?:^|${delimitador})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimitador}]*))`, 'g');
    const cols: string[] = [];
    let match;
    while ((match = regex.exec(linha)) !== null) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      cols.push(val ? val.trim() : '');
    }
    return cols;
  };

  const inicioLinha = linhas[0].toLowerCase().includes('data') ? 1 : 0;

  for (let i = inicioLinha; i < linhas.length; i++) {
    const linha = linhas[i];
    if (linha.toLowerCase().includes('saldo total') || !linha.trim()) continue;

    const colunas = quebrarLinhaCsv(linha);
    if (colunas.length < 2) continue;

    try {
      const data = colunas[0];
      const tipo = colunas[1]?.toLowerCase();

      if (!data || data === '""') continue;

      let registro: RegistroHistorico;
      const baseId = Date.now() + i * 10;

      if (tipo === 'compensação' || tipo === 'compensacao' || tipo === 'ajuste') {
        const saldoStr = colunas[6] || '';
        const saldoMs = parseSaldoMs(saldoStr);
        const descricao = colunas[7] || '';

        registro = {
          id: baseId,
          data,
          entrada: null,
          saidaAlmoco: null,
          retornoAlmoco: null,
          saidaDia: null,
          isCompensacao: true,
          saldoCompensacao: saldoMs,
          descricao,
        };
      } else {
        const entrada = parseHoraParaTimestamp(data, colunas[2]);
        const saidaAlmoco = parseHoraParaTimestamp(data, colunas[3]);
        const retornoAlmoco = parseHoraParaTimestamp(data, colunas[4]);
        const saidaDia = parseHoraParaTimestamp(data, colunas[5]);
        const descricao = colunas[7] || '';

        registro = {
          id: baseId,
          data,
          entrada,
          saidaAlmoco,
          retornoAlmoco,
          saidaDia,
          descricao,
        };
      }

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('historico', 'readwrite');
        const store = transaction.objectStore('historico');
        const req = store.add(registro);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      importados++;
    } catch (e) {
      console.warn('Erro ao processar linha CSV:', linha, e);
      erros++;
    }
  }

  return { importados, erros };
}

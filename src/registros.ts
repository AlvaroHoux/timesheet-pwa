export interface DadosPonto {
  estado: number;
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
  saldoCompensacao?: number; // Saldo em milissegundos
}

// Configurações do Banco de Dados
const DB_NAME = "PontoEletronicoDB";
const DB_VERSION = 1;

export function obterCargaHoraria(): number {
  const config = localStorage.getItem("cargaHoraria");
  return config ? parseInt(config, 10) : 8 * 60 * 60 * 1000; // O padrão permanece em 8h
}

/**
 * Função utilitária para abrir a conexão com o IndexedDB.
 * Cria os "Object Stores" (tabelas) se for a primeira vez.
 */
function abrirBancoDados(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store para o estado atual (usaremos a chave "atual" manualmente)
      if (!db.objectStoreNames.contains("estado")) {
        db.createObjectStore("estado");
      }

      // Store para o histórico (usaremos o "id" como chave primária)
      if (!db.objectStoreNames.contains("historico")) {
        db.createObjectStore("historico", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function carregarEstado(): Promise<DadosPonto> {
  const db = await abrirBancoDados();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("estado", "readonly");
    const store = transaction.objectStore("estado");
    const request = store.get("atual");

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result as DadosPonto);
      } else {
        // Retorna o estado inicial se nada for encontrado
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

export async function salvarEstado(dadosPonto: DadosPonto): Promise<void> {
  const db = await abrirBancoDados();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("estado", "readwrite");
    const store = transaction.objectStore("estado");

    // Como o store não tem keyPath, passamos a chave "atual" no segundo parâmetro
    const request = store.put(dadosPonto, "atual");

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function arquivarRegistroNoHistorico(
  dadosPonto: DadosPonto,
): Promise<void> {
  const db = await abrirBancoDados();

  const novoRegistro: RegistroHistorico = {
    id: Date.now(),
    data: new Date().toLocaleDateString("pt-BR"),
    entrada: dadosPonto.inicioDia,
    saidaAlmoco: dadosPonto.inicioAlmoco,
    retornoAlmoco: dadosPonto.fimAlmoco,
    saidaDia: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("historico", "readwrite");
    const store = transaction.objectStore("historico");

    // Adiciona o novo registro (a chave é extraída automaticamente do "id")
    const request = store.add(novoRegistro);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function obterHistoricoCompleto(): Promise<RegistroHistorico[]> {
  const db = await abrirBancoDados();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("historico", "readonly");
    const store = transaction.objectStore("historico");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as RegistroHistorico[]);
    request.onerror = () => reject(request.error);
  });
}

export async function salvarRegistroEditado(
  registro: RegistroHistorico,
): Promise<void> {
  const db = await abrirBancoDados();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("historico", "readwrite");
    const store = transaction.objectStore("historico");
    const request = store.put(registro); // put atualiza se o ID existir, ou insere se não existir

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function removerRegistroDoHistorico(id: number): Promise<void> {
  const db = await abrirBancoDados();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("historico", "readwrite");
    const store = transaction.objectStore("historico");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function formatarHoraCSV(timestamp: number | null): string {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatarSaldoCSV(saldoMs: number): string {
  const sinal = saldoMs >= 0 ? "+" : "-";
  const abs = Math.abs(saldoMs);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  return `${sinal}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calcularSaldoCSV(registro: RegistroHistorico, cargaHoraria: number): number {
  if (registro.isCompensacao && registro.saldoCompensacao !== undefined) {
    return registro.saldoCompensacao;
  }
  if (!registro.entrada || !registro.saidaDia) return 0;
  let trabalhado = 0;
  if (registro.saidaAlmoco && registro.retornoAlmoco) {
    trabalhado += registro.saidaAlmoco - registro.entrada;
    trabalhado += registro.saidaDia - registro.retornoAlmoco;
  } else {
    trabalhado += registro.saidaDia - registro.entrada;
  }
  return trabalhado - cargaHoraria;
}

export async function exportarHistoricoCSV(): Promise<void> {
  const historico = await obterHistoricoCompleto();
  const cargaHoraria = obterCargaHoraria();

  // Ordena por data crescente antes de exportar
  historico.sort((a, b) => {
    const toMs = (d: string) => {
      const [dd, mm, yyyy] = d.split("/");
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
    };
    const diff = toMs(a.data) - toMs(b.data);
    return diff !== 0 ? diff : a.id - b.id;
  });

  const cabecalho = ["Data", "Tipo", "Entrada", "Saída Almoço", "Retorno Almoço", "Saída", "Saldo"];
  const linhas: string[][] = [cabecalho];

  let saldoAcumuladoMs = 0;

  for (const reg of historico) {
    const saldo = calcularSaldoCSV(reg, cargaHoraria);
    saldoAcumuladoMs += saldo;

    if (reg.isCompensacao) {
      linhas.push([
        reg.data,
        "Compensação",
        "",
        "",
        "",
        "",
        formatarSaldoCSV(saldo),
      ]);
    } else {
      linhas.push([
        reg.data,
        "Normal",
        formatarHoraCSV(reg.entrada),
        formatarHoraCSV(reg.saidaAlmoco),
        formatarHoraCSV(reg.retornoAlmoco),
        formatarHoraCSV(reg.saidaDia),
        formatarSaldoCSV(saldo),
      ]);
    }
  }

  // Linha de saldo total
  linhas.push([]);
  linhas.push(["", "", "", "", "", "Saldo Total", formatarSaldoCSV(saldoAcumuladoMs)]);

  const csvContent = linhas
    .map((row) => row.map((cell) => `"${cell}"`).join(";"))
    .join("\n");

  const bom = "\uFEFF"; // BOM para compatibilidade com Excel
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const dataHoje = new Date().toISOString().split("T")[0];
  const a = document.createElement("a");
  a.href = url;
  a.download = `historico-ponto-${dataHoje}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
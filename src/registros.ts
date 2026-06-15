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
        resolve({ estado: 0, inicioDia: null, inicioAlmoco: null, fimAlmoco: null });
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

export async function arquivarRegistroNoHistorico(dadosPonto: DadosPonto): Promise<void> {
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

export async function salvarRegistroEditado(registro: RegistroHistorico): Promise<void> {
  const db = await abrirBancoDados();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("historico", "readwrite");
    const store = transaction.objectStore("historico");
    const request = store.put(registro); // put atualiza se o ID existir, ou insere se não existir

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
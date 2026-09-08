/**
 * Módulo de controle de versão da aplicação.
 * Prioridade:
 * 1. Variável de ambiente `VITE_APP_VERSION` (.env)
 * 2. Constante estática `__APP_VERSION__` injetada pelo Vite a partir do package.json
 * 3. Fallback padrão '1.0.0'
 */
export const APP_VERSION: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_VERSION) ||
  (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0');


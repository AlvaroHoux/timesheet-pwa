import { Auth, type AuthUser } from 'comber-auth';

const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'https://gestao.grupocomber.cloud';
const authUrl = import.meta.env.VITE_AUTH_URL || 'https://automa.grupocomber.cloud/webhook/auth';
export const LOGIN_PORTAL_URL = import.meta.env.VITE_LOGIN_URL || 'https://login.grupocomber.cloud';

export const auth = new Auth({
  url: directusUrl,
  authUrl: authUrl,
  clearEmailOnLogout: false,
});

/**
 * Retorna os dados do usuário autenticado a partir do comber-auth.
 */
export function getUser(): AuthUser | null {
  return auth.getUser();
}

/**
 * Redireciona o usuário para o portal de login preservando a rota atual de retorno.
 */
export function redirectToLogin() {
  const currentUrl = encodeURIComponent(window.location.href);
  window.location.href = `${LOGIN_PORTAL_URL}?redirect=${currentUrl}`;
}

/**
 * Realiza o logout e redireciona para a tela de login.
 */
export async function logoutUser() {
  await auth.logout();
  redirectToLogin();
}
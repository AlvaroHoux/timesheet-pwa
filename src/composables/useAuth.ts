import { ref, computed } from 'vue';
import {
  Auth,
  createDirectusEndpoints,
  type AuthConfig,
  type AuthUser,
  type AuthRole,
  type DirectusEndpoints,
  AuthError,
} from 'comber-auth';
import { auth, getUser as getAuthUser, logoutUser, redirectToLogin } from '@/services/auth';

const DIRECTUS_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DIRECTUS_URL) ||
  'https://gestao.grupocomber.cloud';

const AUTH_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AUTH_URL) ||
  `${DIRECTUS_URL}/auth`;

let apiEndpoints: DirectusEndpoints | null = null;

export function getAPIDirectus(): DirectusEndpoints {
  if (!apiEndpoints) {
    apiEndpoints = createDirectusEndpoints(DIRECTUS_URL, AUTH_URL);
  }
  return apiEndpoints;
}

export function getAuth(): Auth {
  return auth;
}

const currentUser = ref<AuthUser | null>(getAuthUser());

export function useAuth() {
  const refreshUser = () => {
    currentUser.value = getAuthUser();
    return currentUser.value;
  };

  const userInitials = computed(() => {
    const user = currentUser.value;
    if (!user) return 'U';
    const first = user.first_name ? user.first_name.trim().charAt(0).toUpperCase() : '';
    const last = user.last_name ? user.last_name.trim().charAt(0).toUpperCase() : '';
    if (first && last) return `${first}${last}`;
    if (first) return first;
    if (user.email) return user.email.trim().charAt(0).toUpperCase();
    return 'U';
  });

  const displayName = computed(() => {
    const user = currentUser.value;
    if (!user) return 'Usuário';
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return 'Usuário';
  });

  const roleName = computed(() => {
    const user = currentUser.value;
    if (!user?.role) return null;
    if (typeof user.role === 'object' && user.role.name) return user.role.name;
    if (typeof user.role === 'string') return user.role;
    return null;
  });

  const logout = async () => {
    currentUser.value = null;
    await logoutUser();
  };

  return {
    currentUser,
    userInitials,
    displayName,
    roleName,
    getUser: getAuthUser,
    refreshUser,
    logout,
    redirectToLogin,
    auth,
  };
}

export { Auth, AuthError };
export type { AuthConfig, AuthUser, AuthRole, DirectusEndpoints };


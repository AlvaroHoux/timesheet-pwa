import { ref } from 'vue';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'gc_theme';

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const currentTheme = ref<Theme>(getInitialTheme());

export function useTheme() {
  const applyTheme = (theme: Theme) => {
    if (typeof document === 'undefined') return;
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Atualiza theme-color no meta do browser
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#09090b' : '#fafafa');
    }
  };

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme;
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  };

  const toggleTheme = () => {
    const nextTheme: Theme = currentTheme.value === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const initTheme = () => {
    const theme = getInitialTheme();
    currentTheme.value = theme;
    applyTheme(theme);
  };

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    initTheme,
  };
}

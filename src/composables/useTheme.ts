import { ref } from 'vue';

const currentTheme = ref<string>(localStorage.getItem('gc_theme') || 'light');

export function useTheme() {
  const applyTheme = (theme: string) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('gc_theme', currentTheme.value);
    applyTheme(currentTheme.value);
  };

  const initTheme = (load: boolean = false) => {
    if (load) {
      const savedTheme = localStorage.getItem('gc_theme');
      if (savedTheme) {
        currentTheme.value = savedTheme;
      }
    }
    applyTheme(currentTheme.value);
  };

  return {
    currentTheme,
    toggleTheme,
    initTheme,
  };
}

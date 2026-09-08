import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-light': '#3b82f6',
        accent: '#2563eb',
        accent2: '#2563eb',
        pos: '#10b981',
        neg: '#ef4444',
      }
    },
  },
} satisfies Config
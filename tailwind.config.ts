import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neo-bg': 'var(--bg)',
        'neo-fg': 'var(--fg)',
        'neo-primary': 'var(--primary)',
        'neo-secondary': 'var(--secondary)',
        'neo-accent': 'var(--accent)',
        'neo-mint': 'var(--mint)',
        'neo-lavender': 'var(--lavender)',
        'neo-border': 'var(--border)',
      },
    },
  },
  darkMode: 'media',
  plugins: [],
};

export default config;

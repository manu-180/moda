import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF8F5',
        cream: '#F0EEE9',          // Cloud Dancer 2026
        'soft-white': '#FDFCFA',
        charcoal: '#1A1A1A',
        'dark-gray': '#3D3D3D',
        'warm-gray': '#8A8A8A',
        // These two map to CSS vars injected at runtime per client (see layout.tsx + site_settings.brand_colors)
        champagne: 'var(--color-brand-primary)',
        mocha: 'var(--color-brand-accent)',
        'pale-gray': '#E8E4DF',
        'muted-red': '#9B1B30',
        'deep-forest': '#2D5016',
        'rose-blush': '#EAD5C8',
        'gold-light': '#D4AF7A',
      },
      fontFamily: {
        display: ['var(--font-bodoni)', 'Bodoni Moda', 'serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        expo: 'cubic-bezier(0.76, 0, 0.24, 1)',
        reveal: 'cubic-bezier(0.6, 0.05, 0.01, 0.9)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        bloomIn: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'bloom-in': 'bloomIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'rotate-slow': 'rotateSlow 35s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config

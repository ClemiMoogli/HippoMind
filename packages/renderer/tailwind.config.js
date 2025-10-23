/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme
        light: {
          bg: '#ffffff',
          fg: '#111827',
          border: '#d1d5db',
          hover: '#f3f4f6',
        },
        // Dark theme
        dark: {
          bg: '#1f2937',
          fg: '#f9fafb',
          border: '#374151',
          hover: '#374151',
        },
        // Sepia theme
        sepia: {
          bg: '#f5f1e8',
          fg: '#3e2723',
          border: '#d4c5a9',
          hover: '#ebe5d9',
        },
        // Slate theme
        slate: {
          bg: '#1e293b',
          fg: '#e2e8f0',
          border: '#475569',
          hover: '#334155',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

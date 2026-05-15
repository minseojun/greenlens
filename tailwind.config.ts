/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // GreenLens 팔레트: 딥 그린 + 미드나잇 블랙
        canvas: '#080C0A',
        surface: '#0E1510',
        panel: '#141C16',
        border: '#1E2B20',
        'border-bright': '#2A3D2D',
        // 그린 스펙트럼
        'gl-green': '#00E87A',
        'gl-green-dim': '#00A855',
        'gl-green-muted': '#1A3D28',
        // 상태 색상
        trusted: '#00E87A',
        suspicious: '#F59E0B',
        critical: '#EF4444',
        // 텍스트
        'text-primary': '#E8F0E9',
        'text-secondary': '#7A9B80',
        'text-muted': '#4A6B50',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

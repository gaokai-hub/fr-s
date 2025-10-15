/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // 专业的颜色方案
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // 专业蓝色
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        secondary: {
          DEFAULT: '#10b981', // 专业绿色
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b'
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        }
      },
      // 专业的排版设置
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      // 更细粒度的间距控制
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      // 图表和数据可视化的专用颜色
      chart: {
        blue: '#3b82f6',
        green: '#10b981',
        amber: '#f59e0b',
        red: '#ef4444',
        purple: '#8b5cf6',
        indigo: '#6366f1',
        pink: '#ec4899',
        cyan: '#06b6d4',
        teal: '#14b8a6'
      }
    }
  },
  darkMode: 'media',
  plugins: []
}
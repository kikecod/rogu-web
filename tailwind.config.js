/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: '#3A6FF8',
        secondary: '#6C63FF',
        'accent-1': '#8BD3FF',
        'accent-2': '#B5A5FF',
        'text-main': '#0F172A',
        muted: '#6B7280',
        border: '#E9ECF5',
        success: '#4AD991',
        warning: '#F6B968',
        danger: '#F37B83',
        surface: 'rgba(255,255,255,0.65)',
      },
      boxShadow: {
        soft: '10px 12px 24px rgba(34,50,84,0.08), -8px -8px 18px rgba(255,255,255,0.7)',
      },
      borderRadius: {
        card: '16px',
        input: '10px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


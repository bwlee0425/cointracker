/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#64748B',
        danger: '#DC2626',
        background: '#f8f8f8',
        darkBackground: '#121212',
        panelLight: '#ffffff',
        panelDark: '#1e1e1e',
      },
      spacing: {
        72: '18rem',
        84: '21rem',
        96: '24rem',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        panel: '0.5rem', // 사용 중인 패널 radius
      },
      boxShadow: {
        panel: '0 4px 12px rgba(0, 0, 0, 0.2)',
        'panel-hover': '0 10px 20px rgba(0, 0, 0, 0.3)',
        'panel-hover-dark': '0 10px 20px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

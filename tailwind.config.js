/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#F97316',
        teal: '#0D9488',
        danger: '#3B82F6',
        background: '#FAFAF7',
        card: '#FFFFFF',
        'text-primary': '#1C1C1E',
        'text-secondary': '#6B7280',
        amber: '#F59E0B',
        success: '#10B981',
        red: '#EF4444',
        green: '#10B981',
      },
      fontFamily: {
        rounded: ['System', 'Roboto', 'Noto Sans'],
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFDFD',
          100: '#FAFAFA',
          200: '#F4F4F5',
          300: '#E4E4E7',
        },
      },
      boxShadow: {
        'tactile-card': '0 4px 16px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.05), inset 0 1px 0 0 rgba(255,255,255,0.7)',
        'tactile-pressed': 'inset 0 2px 4px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)',
        'tactile-btn': '0 2px 4px rgba(5,150,105,0.25), inset 0 1px 0 0 rgba(255,255,255,0.3)',
      }
    },
  },
  plugins: [],
}

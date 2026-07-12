/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#4f46e5',
        secondary: '#a78bfa',
        text: '#1f2937',
        muted: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444'
      }
    },
  },
  plugins: [],
}

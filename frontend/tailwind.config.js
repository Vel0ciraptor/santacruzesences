/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#031926',      // Profundo azul marino / noche
          navy: '#0b2545',      // Azul elegante
          blue: '#134074',      // Azul primario
          teal: '#006466',      // Verde azulado
          emerald: '#065a60',   // Verde esmeralda refinado
          mint: '#1b3b36',      // Fondo verde oscuro
          accent: '#06d6a0',    // Verde vivo acento
          gold: '#d4af37',      // Dorado refinado para perfumes
          light: '#e0e1dd',     // Texto claro
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

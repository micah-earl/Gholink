/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gholink-blue': '#4FC3F7', // Primary blue (lighter sky blue)
        'gholink-blue-dark': '#29B6F6', // Darker blue
        'gholink-blue-light': '#81D4FA', // Light blue
        'gholink-cyan': '#00BCD4', // Cyan/turquoise (darker gradient end)
        'gholink-cyan-light': '#4DD0E1', // Light cyan
        'gholink-orange': '#FF9600',
        'gholink-red': '#FF4B4B',
        'gholink-purple': '#CE82FF',
        // Keep duolingo-green for backward compatibility but map to blue
        'duolingo-green': '#4FC3F7',
        'duolingo-green-dark': '#29B6F6',
        'duolingo-green-light': '#81D4FA',
        'duolingo-blue': '#00BCD4',
      },
      borderRadius: {
        'duolingo': '16px',
      },
      boxShadow: {
        'duolingo': '0 4px 12px rgba(79, 195, 247, 0.2)',
        'duolingo-lg': '0 8px 24px rgba(79, 195, 247, 0.3)',
      },
    },
  },
  plugins: [],
}


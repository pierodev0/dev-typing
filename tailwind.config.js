/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tokyo': {
          'bg': '#1a1b26',
          'bg-dark': '#16161e',
          'bg-darkest': '#13141a',
          'text': '#c0caf5',
          'text-dim': '#565f89',
          'blue': '#7aa2f7',
          'cyan': '#7dcfff',
          'green': '#9ece6a',
          'yellow': '#e0af68',
          'magenta': '#bb9af7',
          'red': '#f7768e',
        }
      },
      fontFamily: {
        'code': ['JetBrains Mono', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        tokyoNight: {
          "primary": "#7aa2f7",
          "secondary": "#bb9af7",
          "accent": "#7dcfff",
          "neutral": "#565f89",
          "base-100": "#1a1b26",
          "info": "#7aa2f7",
          "success": "#9ece6a",
          "warning": "#e0af68",
          "error": "#f7768e",
        },
      },
    ],
  },
}

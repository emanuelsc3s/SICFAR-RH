import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './.figma/**/*.{jsx,tsx,ts}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#294787',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'elevation-2': '0px 1px 5px 0px #0000001f, 0px 2px 2px 0px #00000024, 0px 3px 1px -2px #00000033',
      },
    },
  },
  plugins: [],
} satisfies Config


/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors:{
        primary: '#00A99D',
        secondary: '#0367A5',
        tertiary: '#8E8E8E',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      boxShadow:{
        faqActive: '0 5px 15px -3px rgba(3, 103, 165,0.3), 0 4px 6px -4px rgba(3, 103, 165,0.3)',
        faqNormal: '0 5px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        faqRound: ' 0 3px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);',
      }
    },
  },
  plugins: [],
};

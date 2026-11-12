const config = require('config/tailwind.config')

module.exports = config({
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.tsx',
    './content/**/*.{ts,tsx,mdx}',
    './features/**/*.{ts,tsx,mdx}',
    './layouts/**/*.tsx',
    './packages/ui/src/**/*.{tsx,ts,js}',
    './packages/ui/index.tsx',
    './packages/ui-patterns/src/**/*.{tsx,ts,js}',
  ],
  plugins: [
    function ({ addUtilities, addVariant }) {
      addUtilities({
        // prose (tailwind typography) helpers
        // useful for removing margins in prose styled sections
        '.prose--remove-p-margin p': {
          margin: '0',
        },
      })
    },
    require('@tailwindcss/container-queries'),
  ],
})

import type { Config } from 'prettier'

// No semicolons, 100 columns, single quotes.
export default {
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  // Sorts Tailwind classes. The stylesheet tells the plugin which classes the theme defines.
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './apps/roundup/global.css',
  tailwindFunctions: ['cn', 'cva'],
} satisfies Config

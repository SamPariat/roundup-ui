import type { Config } from 'prettier'

// The one shared Prettier config. No semicolons, 100 columns, single quotes.
import { fileURLToPath } from 'node:url'

const fromHere = (specifier: string): string => fileURLToPath(import.meta.resolve(specifier))

const config: Config = {
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  // Sorts Tailwind classes. Resolved from this package so every workspace finds it.
  plugins: [fromHere('prettier-plugin-tailwindcss')],
  // The stylesheet tells the plugin which classes the generated theme defines.
  tailwindStylesheet: fromHere('../../apps/app/global.css'),
  tailwindFunctions: ['cn', 'cva'],
}

export default config

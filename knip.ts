import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    '.': {
      // Tools run by Make targets, hooks and CI, not imported by code.
      entry: ['scripts/*.ts'],
      ignoreBinaries: [],
    },
    'apps/app': {
      // Expo Router discovers routes by file name, so every route is an entry.
      entry: ['src/app/**/*.{ts,tsx}', 'app.config.ts', 'jest.config.ts', 'jest.setup.ts'],
      project: ['src/**/*.{ts,tsx}', '*.ts'],
    },
    'apps/server': {
      entry: ['src/main.ts'],
      project: ['src/**/*.ts', '*.ts'],
    },
    'shared/tokens': {
      // The generated files are the package's public surface.
      entry: ['src/index.ts', 'scripts/generate.ts'],
      project: ['src/**/*.ts', 'scripts/**/*.ts', '*.ts'],
    },
    'shared/ui': {
      entry: ['src/index.ts'],
      project: ['src/**/*.{ts,tsx}', '*.ts'],
    },
    'shared/config': {
      entry: ['*.ts'],
      project: ['*.ts'],
      // jest-expo is named as a Jest preset string, and the Tailwind Prettier plugin is
      // resolved by path with import.meta.resolve, so neither is a visible import.
      ignoreDependencies: ['jest-expo', 'prettier-plugin-tailwindcss'],
    },
  },
  // theme.css is generated and read by Tailwind, not imported.
  ignore: ['shared/tokens/src/theme.css'],
}

export default config

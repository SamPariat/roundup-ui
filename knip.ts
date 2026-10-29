import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  // The Expo and Metro plugins execute app.config.ts and metro.config.ts, and NativeWind then
  // rewrites tsconfig files from the wrong directory. Entries are listed by hand instead.
  expo: false,
  metro: false,
  workspaces: {
    '.': {
      // Run by Make targets, hooks and CI rather than imported by code.
      entry: ['scripts/*.ts'],
      // The pre-commit hook calls lint-staged through pnpm exec.
      ignoreDependencies: ['lint-staged'],
    },
    'apps/app': {
      // Expo Router discovers routes by file name, so every route is an entry.
      entry: ['src/app/**/*.{ts,tsx}', 'metro.config.ts'],
      project: ['**/*.{ts,tsx}'],
      ignoreDependencies: [
        // Native modules must be direct dependencies of the app so Expo autolinking finds them
        // (pnpm does not hoist them from shared/ui), even though only shared/ui imports them.
        'expo-glass-effect',
        'expo-localization',
        // Named in app.config.ts plugins or loaded by Expo itself, never imported.
        'babel-preset-expo',
        'babel-plugin-react-compiler',
        'expo-font',
        'expo-system-ui',
      ],
    },
    'apps/server': {
      project: ['src/**/*.ts', 'tests/**/*.ts', '*.ts'],
    },
    'shared/i18n': {
      project: ['src/**/*.ts', 'tests/**/*.ts', '*.ts'],
    },
    'shared/tokens': {
      project: ['src/**/*.ts', 'tests/**/*.ts', 'scripts/**/*.ts', '*.ts'],
    },
    'shared/ui': {
      project: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}', '*.ts'],
    },
    'shared/config': {
      entry: ['*.ts'],
      project: ['*.ts'],
      // jest-expo is named as a Jest preset string, babel-preset-expo as a Babel preset string, and
      // the Tailwind Prettier plugin is resolved by path with import.meta.resolve, so none is a
      // visible import.
      ignoreDependencies: ['babel-preset-expo', 'jest-expo', 'prettier-plugin-tailwindcss'],
    },
  },
}

export default config

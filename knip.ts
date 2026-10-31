import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  // An unreferenced file is dead weight in every workspace, so it fails the run (this is knip's
  // default, written out so nobody downgrades it). Each workspace lists its sources in `project`.
  rules: { files: 'error' },
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
    'apps/roundup': {
      // Expo Router discovers routes by file name, so every route is an entry.
      entry: ['src/app/**/*.{ts,tsx}', 'metro.config.ts'],
      project: ['**/*.{ts,tsx,css}'],
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
      project: ['*.{ts,css}'],
      // jest-expo is named as a Jest preset string, babel-preset-expo as a Babel preset string, and
      // the Tailwind Prettier plugin is resolved by path with import.meta.resolve, so none is a
      // visible import.
      ignoreDependencies: ['babel-preset-expo', 'jest-expo', 'prettier-plugin-tailwindcss'],
    },
  },
}

export default config

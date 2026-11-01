import type { KnipConfig } from 'knip'

export default {
  // An unreferenced file is dead weight in every workspace, so it fails the run (this is knip's
  // default, written out so nobody downgrades it). Each workspace lists its sources in `project`.
  rules: { files: 'error' },
  // The Expo and Metro plugins execute app.config.ts and metro.config.ts, and NativeWind then
  // rewrites tsconfig files from the wrong directory. Entries are listed by hand instead.
  expo: false,
  metro: false,
  workspaces: {
    '.': {
      // The jest configs name the SVG transformer as a string.
      entry: ['jest-svg-transform.ts'],
      // The pre-commit hook calls lint-staged through pnpm exec.
      ignoreDependencies: [
        'lint-staged',
        // Named as strings: jest-svg-transform.ts and the jest configs load these presets.
        'babel-preset-expo',
        'jest-expo',
      ],
      // shellcheck is a system tool (brew or apt), not an npm package.
      ignoreBinaries: ['shellcheck'],
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
        // expo-dev-client is linked natively by expo run:ios / run:android and never imported.
        'expo-dev-client',
        'babel-preset-expo',
        'babel-plugin-react-compiler',
        'expo-system-ui',
        // Run as `with-env.sh expo-doctor` by the doctor script, which knip cannot follow.
        'expo-doctor',
      ],
    },
    'shared/i18n': {
      project: ['src/**/*.ts', 'tests/**/*.ts', '*.ts'],
    },
    'shared/ui': {
      // Metro picks the .native.ts twin of a file on iOS and Android; nothing imports it by name.
      entry: ['src/**/*.native.ts'],
      project: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}', '*.ts'],
    },
  },
} satisfies KnipConfig

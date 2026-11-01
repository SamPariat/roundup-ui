import type { Config } from 'jest'

// jest-expo supplies the React Native environment and transforms. Tests live in tests/, mirroring
// the paths under src/. SVG imports become the same components Metro builds, so tests render the
// real artwork.
export default {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  errorOnDeprecated: true,
  // CI runs every package's suite at once on two cores, so the first test of a file, which also
  // loads React Native and the component tree, can take far longer than the 5s default.
  testTimeout: 30_000,
  transform: { '\\.svg$': '<rootDir>/../../jest-svg-transform.ts' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.ts'],
} satisfies Config

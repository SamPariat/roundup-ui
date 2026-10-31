// Shared Jest settings. jest-expo supplies the React Native environment and transforms.
import type { Config } from 'jest'

/**
 */
export const jestPreset = {
  preset: 'jest-expo',
  // Every package keeps its tests in tests/, mirroring the paths under src/.
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.ts'],
  // Fail on a test that logs an error, so a bad render never passes quietly.
  errorOnDeprecated: true,
  // SVG imports become the same components Metro builds, so tests render the real artwork.
  transform: { '\\.svg$': '@roundup/config/jest-svg-transform' },
} satisfies Config

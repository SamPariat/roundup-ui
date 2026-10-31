import type { Config } from 'jest'

// jest-expo supplies the React Native environment and transforms. Tests live in tests/, mirroring
// the paths under src/. SVG imports become the same components Metro builds, so tests render the
// real artwork.
export default {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.ts'],
  errorOnDeprecated: true,
  transform: { '\\.svg$': '<rootDir>/../../jest-svg-transform.ts' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
} satisfies Config

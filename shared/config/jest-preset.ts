// Shared Jest settings. jest-expo supplies the React Native environment and transforms.
import type { Config } from 'jest'

export const jestPreset = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/**/index.ts'],
  coverageReporters: ['text', 'json-summary'],
  // Fail on a test that logs an error, so a bad render never passes quietly.
  errorOnDeprecated: true,
} satisfies Config

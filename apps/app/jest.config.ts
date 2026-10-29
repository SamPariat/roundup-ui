import type { Config } from 'jest'

import { jestPreset } from '@roundup/config/jest-preset'

const config: Config = {
  ...jestPreset,
  // app.config.ts sits at the package root, outside src, so its test does too.
  testMatch: ['<rootDir>/**/*.test.{ts,tsx}'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.ts'],
}

export default config

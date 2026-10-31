import type { Config } from 'jest'

import { jestPreset } from '@roundup/config/jest-preset'

const config: Config = {
  ...jestPreset,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default config

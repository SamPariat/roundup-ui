import type { Config } from 'jest'

import { jestPreset } from '@roundup/config/jest-preset'

const config: Config = {
  ...jestPreset,
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  coverageThreshold: { global: { lines: 80 } },
}

export default config

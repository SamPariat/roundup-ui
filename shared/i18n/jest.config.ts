import type { Config } from 'jest'

import { jestPreset } from '@roundup/config/jest-preset'

const config: Config = {
  ...jestPreset,
  coverageThreshold: { global: { lines: 80 } },
}

export default config

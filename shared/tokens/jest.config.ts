import type { Config } from 'jest'

import { jestPreset } from '@roundup/config/jest-preset'

const config: Config = {
  ...jestPreset,
}

export default config

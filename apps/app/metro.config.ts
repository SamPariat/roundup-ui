import { getDefaultConfig } from 'expo/metro-config'
import { withNativewind } from 'nativewind/metro'

import { roleNames } from '@roundup/tokens'

// Metro loads this file as CommonJS, where __dirname is the only way to name the project root.
// eslint-disable-next-line unicorn/prefer-module -- see the comment above
const config = getDefaultConfig(__dirname)

// The theme provider overrides every role variable at runtime, so none may be inlined at build time.
export default withNativewind(config, {
  inlineVariables: { exclude: roleNames.map((role) => `--color-${role}` as const) },
})

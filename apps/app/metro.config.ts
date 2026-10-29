import { getDefaultConfig } from 'expo/metro-config'
import { withNativewind } from 'nativewind/metro'

import { roleNames } from '@roundup/tokens'

// Metro loads this file as CommonJS, where __dirname is the only way to name the project root.
// eslint-disable-next-line unicorn/prefer-module -- see the comment above
const config = getDefaultConfig(__dirname)

// The theme provider overrides every role variable at runtime, so none may be inlined at build time.
export default withNativewind(config, {
  // Tailwind's default scales are in rem (h-12 is 3rem). react-native-css inlines rem at 14 on
  // native unless told otherwise, which would make every default class 12.5% smaller than on web,
  // where 1rem is 16px. Pin it so a class is the same size on every platform.
  inlineRem: 16,
  inlineVariables: { exclude: roleNames.map((role) => `--color-${role}` as const) },
})

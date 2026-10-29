// Metro turns every imported .svg into a component through react-native-svg-transformer, and
// Jest does the same through shared/config/jest-svg-transform.ts. `currentColor` in a file follows
// the `color` prop, so a tone becomes a colour without touching the file.
declare module '*.svg' {
  import type { FC } from 'react'
  import type { SvgProps } from 'react-native-svg'

  const Component: FC<SvgProps>

  export default Component
}

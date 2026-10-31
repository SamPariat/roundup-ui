import type { ComponentType, FC } from 'react'

import { styled } from 'nativewind'

import type { Styled } from './svg.ts'

/**
 * react-native-svg reads colour from props (`color`, `fill`, `stroke`), not from style, so a
 * className is resolved to a style first and then mapped onto those props. `text-accent` becomes
 * `color` (what `currentColor` follows), `fill-accent` becomes `fill`, `stroke-border` `stroke`.
 */
const MAPPING = {
  className: {
    target: 'style',
    nativeStyleMapping: { color: 'color', fill: 'fill', stroke: 'stroke' },
  },
} as const

/**
 * Lets an SVG component take a className, resolved by react-native-css into the colour props.
 * @param component - A react-native-svg component or an imported .svg file.
 * @returns A component that reads `text-*`, `fill-*` and `stroke-*` classes.
 */
export const styleSvg = <P extends object>(component: ComponentType<P>): FC<Styled<P>> =>
  styled(component as ComponentType<Record<string, unknown>>, MAPPING) as unknown as FC<Styled<P>>

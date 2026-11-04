import type { ComponentType, FC } from 'react'

import { styled } from 'nativewind'

import type { TStyled } from './svg'

/**
 * react-native-svg reads color from props (`color`, `fill`, `stroke`), not from style, so a
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
 * SVG helpers. Static methods only. The web version of this file (svg.ts) has the same class and
 * API.
 */
export class SvgHelper {
  /**
   * Lets an SVG component take a className, resolved by react-native-css into the color props.
   * @param component - A react-native-svg component or an imported .svg file.
   * @returns A component that reads `text-*`, `fill-*` and `stroke-*` classes.
   */
  static style<P extends object>(component: ComponentType<P>): FC<TStyled<P>> {
    return styled(component as ComponentType<Record<string, unknown>>, MAPPING) as unknown as FC<
      TStyled<P>
    >
  }
}
